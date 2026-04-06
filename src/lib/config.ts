// ---------------------------------------------------------------------------
// DB-backed configuration system
// ---------------------------------------------------------------------------

import { createConfigManager } from "whop-kit/config";
import { prisma } from "../../db/index";
import { prismaConfigStore } from "./adapters/prisma";
import {
  PLAN_METADATA,
  PLAN_KEYS,
  DEFAULT_PLAN,
  getPlanBillingIntervals,
  planConfigKey,
  planConfigKeyYearly,
  planPriceConfigKey,
  planPriceConfigKeyYearly,
  planNameConfigKey,
  planEnvVar,
  planEnvVarYearly,
  type PlanKey,
  type BillingInterval,
} from "./constants";

// ---------------------------------------------------------------------------
// Dynamic plan config key -> env var mappings
// ---------------------------------------------------------------------------

const planEnvEntries: Record<string, string> = {};
for (const key of PLAN_KEYS) {
  planEnvEntries[planConfigKey(key)] = planEnvVar(key);
  if (getPlanBillingIntervals(key).includes("yearly")) {
    planEnvEntries[planConfigKeyYearly(key)] = planEnvVarYearly(key);
  }
}

/** Map of our config keys to their env var fallbacks */
const ENV_MAP: Record<string, string> = {
  whop_app_id: "WHOP_APP_ID",
  whop_api_key: "WHOP_API_KEY",
  whop_webhook_secret: "WHOP_WEBHOOK_SECRET",
  ...planEnvEntries,
  app_name: "APP_NAME",
  app_url: "APP_URL",
  accent_color: "ACCENT_COLOR",
  analytics_provider: "ANALYTICS_PROVIDER",
  analytics_id: "ANALYTICS_ID",
  email_provider: "EMAIL_PROVIDER",
  email_api_key: "EMAIL_API_KEY",
  email_from_address: "EMAIL_FROM_ADDRESS",
};

/** All valid config keys */
const VALID_KEYS = new Set([
  ...Object.keys(ENV_MAP),
  "setup_complete",
  "session_secret",
]);

// Register price and name config keys (DB-only, no env var fallback)
for (const key of PLAN_KEYS) {
  VALID_KEYS.add(planPriceConfigKey(key));
  VALID_KEYS.add(planPriceConfigKeyYearly(key));
  VALID_KEYS.add(planNameConfigKey(key));
}

// ---------------------------------------------------------------------------
// Config manager instance (powered by whop-kit)
// ---------------------------------------------------------------------------

const configManager = createConfigManager({
  store: prismaConfigStore(prisma),
  envMap: ENV_MAP,
});

// ---------------------------------------------------------------------------
// Core read/write
// ---------------------------------------------------------------------------

export async function getConfig(key: string): Promise<string | null> {
  return configManager.get(key);
}

export async function setConfig(key: string, value: string): Promise<void> {
  if (!VALID_KEYS.has(key)) throw new Error(`Invalid config key: ${key}`);
  return configManager.set(key, value);
}

/** Bulk set config values */
export async function setConfigs(configs: Record<string, string>): Promise<void> {
  const filtered = Object.fromEntries(
    Object.entries(configs).filter(([key, value]) => !!value && VALID_KEYS.has(key)),
  );
  return configManager.setMany(filtered);
}

// ---------------------------------------------------------------------------
// Setup detection
// ---------------------------------------------------------------------------

export async function isSetupComplete(): Promise<boolean> {
  try {
    const val = await getConfig("setup_complete");
    if (val === "true") return true;

    // Also consider setup complete if whop_app_id is configured via env var
    const appId = await getConfig("whop_app_id");
    return !!appId;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Plan config
// ---------------------------------------------------------------------------

export interface PlanConfig {
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  whopPlanId: string;
  whopPlanIdYearly: string;
  features: readonly string[];
  highlighted: boolean;
  trialDays?: number;
  billingIntervals: BillingInterval[];
}

export type PlansConfig = Record<PlanKey, PlanConfig>;

/** Build full plan config by merging static metadata with dynamic plan IDs from DB/env. */
export async function getPlansConfig(): Promise<PlansConfig> {
  const configs = await Promise.all(
    PLAN_KEYS.map(async (key) => {
      const intervals = getPlanBillingIntervals(key);
      const [monthlyId, yearlyId, dbPriceMonthly, dbPriceYearly, dbName] = await Promise.all([
        getConfig(planConfigKey(key)),
        intervals.includes("yearly")
          ? getConfig(planConfigKeyYearly(key))
          : Promise.resolve(null),
        getConfig(planPriceConfigKey(key)),
        getConfig(planPriceConfigKeyYearly(key)),
        getConfig(planNameConfigKey(key)),
      ]);
      const meta = PLAN_METADATA[key];
      return {
        key,
        monthlyId,
        yearlyId,
        dbPriceMonthly,
        dbPriceYearly,
        config: {
          ...meta,
          name: dbName || meta.name,
          priceMonthly: dbPriceMonthly ? parseFloat(dbPriceMonthly) : meta.priceMonthly,
          priceYearly: dbPriceYearly ? parseFloat(dbPriceYearly) : meta.priceYearly,
          billingIntervals: intervals,
          whopPlanId: monthlyId ?? "",
          whopPlanIdYearly: yearlyId ?? monthlyId ?? "",
        } satisfies PlanConfig,
      };
    })
  );

  const plans = {} as PlansConfig;
  for (const { key, config } of configs) {
    plans[key] = config;
  }
  return plans;
}
