import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getSession } from "../../lib/auth";
import { getPlansConfig } from "../../lib/config";
import { PLAN_KEYS, type PlanKey, type BillingInterval } from "../../lib/constants";
import { CheckoutForm } from "../../components/checkout/checkout-form";

const getCheckoutData = createServerFn({ method: "GET" }).handler(async () => {
  const [plans, session] = await Promise.all([
    getPlansConfig(),
    getSession(),
  ]);
  return {
    plans,
    userEmail: session?.email ?? null,
    userName: session?.name ?? null,
  };
});

export const Route = createFileRoute("/checkout/")({
  validateSearch: (search: Record<string, unknown>) => ({
    plan: (search.plan as string) ?? undefined,
    interval: (search.interval as string) ?? "yearly",
  }),
  loader: () => getCheckoutData(),
  head: () => ({
    meta: [{ title: "Checkout | Whop SaaS Starter" }],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { plan: planParam, interval: intervalParam } = Route.useSearch();
  const { plans, userEmail, userName } = Route.useLoaderData();

  const planKey: PlanKey | null =
    planParam && PLAN_KEYS.includes(planParam as PlanKey)
      ? (planParam as PlanKey)
      : null;
  const interval: BillingInterval =
    intervalParam === "monthly" ? "monthly" : "yearly";

  const plan = planKey ? (plans[planKey] ?? null) : null;
  const whopPlanId = plan
    ? interval === "yearly"
      ? plan.whopPlanIdYearly
      : plan.whopPlanId
    : "";

  // Invalid or missing plan
  if (!plan || !whopPlanId || !planKey) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-xs text-center">
          <h1 className="text-sm font-semibold">Invalid Plan</h1>
          <p className="mt-2 text-xs text-[var(--muted)]">
            The plan you selected doesn&apos;t exist or hasn&apos;t been
            configured.
          </p>
          <a
            href="/pricing"
            className="mt-6 inline-block rounded-lg border border-[var(--border)] px-5 py-2 text-sm font-medium transition-colors hover:bg-[var(--surface)]"
          >
            Back to Pricing
          </a>
        </div>
      </div>
    );
  }

  return (
    <CheckoutForm
      planKey={planKey}
      plan={plan}
      whopPlanId={whopPlanId}
      interval={interval}
      userEmail={userEmail}
      userName={userName}
    />
  );
}
