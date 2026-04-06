import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getConfig } from "../lib/config";
import { getSession } from "../lib/auth";
import { prisma } from "../../db/index";
import { PLAN_KEYS, planConfigKey, planConfigKeyYearly, planNameConfigKey } from "../lib/constants";
import { SetupWizard, type DbStatus } from "../components/setup/setup-wizard";

/** Check database connectivity and schema readiness. */
async function checkDatabase(): Promise<DbStatus> {
  const hasUrl = !!(process.env.DATABASE_URL || process.env.NILEDB_POSTGRES_URL);
  if (!hasUrl) return "no_url";

  try {
    await prisma.$queryRawUnsafe("SELECT 1");
  } catch {
    return "connection_failed";
  }

  try {
    await prisma.systemConfig.findFirst();
  } catch {
    return "schema_missing";
  }

  return "connected";
}

const getSetupData = createServerFn({ method: "GET" }).handler(async () => {
  const dbStatus = await checkDatabase();

  // Only redirect away from setup when it's explicitly marked complete.
  const setupComplete = dbStatus === "connected"
    ? await getConfig("setup_complete")
    : null;
  if (setupComplete === "true") {
    throw redirect({ to: "/" });
  }

  // Fetch session and existing config in parallel
  const [session, whopAppId, ...planConfigValues] = await Promise.all([
    getSession(),
    dbStatus === "connected" ? getConfig("whop_app_id") : Promise.resolve(null),
    ...PLAN_KEYS.flatMap((key) => [
      dbStatus === "connected" ? getConfig(planConfigKey(key)) : Promise.resolve(null),
      dbStatus === "connected" ? getConfig(planConfigKeyYearly(key)) : Promise.resolve(null),
      dbStatus === "connected" ? getConfig(planNameConfigKey(key)) : Promise.resolve(null),
    ]),
  ]);

  // Reconstruct plan IDs and names from flat array
  const initialPlanIds: Record<string, string> = {};
  const initialPlanNames: Record<string, string> = {};
  let idx = 0;
  for (const key of PLAN_KEYS) {
    const monthly = planConfigValues[idx++];
    const yearly = planConfigValues[idx++];
    const name = planConfigValues[idx++];
    if (monthly) initialPlanIds[planConfigKey(key)] = monthly;
    if (yearly) initialPlanIds[planConfigKeyYearly(key)] = yearly;
    if (name) initialPlanNames[planNameConfigKey(key)] = name;
  }

  // Construct repo URL from Vercel's auto-set git env vars
  const repoOwner = process.env.VERCEL_GIT_REPO_OWNER;
  const repoSlug = process.env.VERCEL_GIT_REPO_SLUG;
  const repoUrl = repoOwner && repoSlug
    ? `https://github.com/${repoOwner}/${repoSlug}`
    : null;

  return {
    isSignedIn: !!session,
    isAdmin: session?.isAdmin ?? false,
    repoUrl,
    dbStatus,
    isVercel: !!process.env.VERCEL,
    initialConfig: {
      whopAppId: whopAppId ?? "",
      planIds: initialPlanIds,
      planNames: initialPlanNames,
    },
  };
});

export const Route = createFileRoute("/setup")({
  loader: () => getSetupData(),
  validateSearch: (search: Record<string, unknown>) => ({
    step: search.step ? parseInt(search.step as string, 10) : undefined,
  }),
  head: () => ({
    meta: [{ title: "Setup | Whop SaaS Starter" }],
  }),
  component: SetupPage,
});

function SetupPage() {
  const data = Route.useLoaderData();
  const { step: initialStep } = Route.useSearch();

  return (
    <SetupWizard
      initialStep={initialStep}
      isSignedIn={data.isSignedIn}
      isAdmin={data.isAdmin}
      repoUrl={data.repoUrl}
      dbStatus={data.dbStatus}
      isVercel={data.isVercel}
      initialConfig={data.initialConfig}
    />
  );
}
