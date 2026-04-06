import {
  verifySessionToken as _verifySessionToken,
  encodeSecret,
  generateSecret,
} from "whop-kit/auth";
import type { Session as BaseSession } from "whop-kit/auth";
import { getCookie } from "@tanstack/react-start/server";
import { prisma } from "../../db/index";
import { PLAN_KEYS, DEFAULT_PLAN, PLAN_RANK, type PlanKey } from "./constants";

export interface Session extends Omit<BaseSession, "plan"> {
  plan: PlanKey;
}

let cachedSecret: Uint8Array | null = null;

async function getSecret(): Promise<Uint8Array> {
  if (cachedSecret) return cachedSecret;
  const envSecret = process.env.SESSION_SECRET;
  if (envSecret) { cachedSecret = encodeSecret(envSecret); return cachedSecret; }

  const existing = await prisma.systemConfig.findUnique({ where: { key: "session_secret" } });
  if (existing) { cachedSecret = encodeSecret(existing.value); return cachedSecret; }

  const generated = generateSecret();
  try {
    await prisma.systemConfig.create({ data: { key: "session_secret", value: generated } });
  } catch {
    const raced = await prisma.systemConfig.findUnique({ where: { key: "session_secret" } });
    if (raced) { cachedSecret = encodeSecret(raced.value); return cachedSecret; }
  }
  cachedSecret = encodeSecret(generated);
  return cachedSecret;
}

export async function getSession(): Promise<Session | null> {
  try {
    const token = getCookie("session");
    if (!token) return null;

    const secret = await getSecret();
    const session = await _verifySessionToken(token, secret, PLAN_KEYS, DEFAULT_PLAN);
    if (!session) return null;

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { plan: true, cancelAtPeriodEnd: true },
    });
    if (!user) return null;

    const plan = PLAN_KEYS.includes(user.plan as PlanKey) ? (user.plan as PlanKey) : DEFAULT_PLAN;
    return { ...session, plan, cancelAtPeriodEnd: user.cancelAtPeriodEnd } as Session;
  } catch {
    return null;
  }
}

export function hasMinimumPlan(userPlan: PlanKey, minimumPlan: PlanKey): boolean {
  return (PLAN_RANK[userPlan] ?? 0) >= (PLAN_RANK[minimumPlan] ?? 0);
}
