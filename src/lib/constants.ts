import { definePlans } from "whop-kit/core";
export type { BillingInterval, PlanMetadataEntry } from "whop-kit/core";

export const APP_NAME = "Whop SaaS Starter";
export const APP_DESCRIPTION = "A modern SaaS starter built with TanStack Start and Whop";

export const plans = definePlans({
  free: {
    name: "Free",
    description: "Get started with the basics",
    priceMonthly: 0,
    priceYearly: 0,
    features: ["Up to 3 projects", "Basic analytics", "Community support", "1 GB storage"],
    highlighted: false,
  },
  starter: {
    name: "Starter",
    description: "For growing teams and businesses",
    priceMonthly: 0,
    priceYearly: 0,
    features: ["Unlimited projects", "Advanced analytics", "Priority support", "100 GB storage", "Custom integrations", "Team collaboration"],
    highlighted: true,
  },
  pro: {
    name: "Pro",
    description: "For power users and larger teams",
    priceMonthly: 0,
    priceYearly: 0,
    features: ["Everything in Starter", "Unlimited storage", "Dedicated support", "Custom SLA", "SSO & advanced security", "Audit logs", "API access"],
    highlighted: false,
  },
});

export const PLAN_METADATA = plans.metadata;
export type PlanKey = keyof typeof PLAN_METADATA;
export const PLAN_KEYS = plans.keys;
export const PLAN_RANK = plans.ranks as Record<string, number>;
export const DEFAULT_PLAN = plans.defaultPlan;
export const getPlanBillingIntervals = plans.getBillingIntervals;
