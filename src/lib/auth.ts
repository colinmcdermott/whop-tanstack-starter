import {
  verifySessionToken as _verifySessionToken,
  encodeSecret,
  generateSecret,
} from "whop-kit/auth";
import type { Session as BaseSession } from "whop-kit/auth";
import { requestCookieAdapter } from "./adapters/tanstack";
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

/**
 * Get the session from a cookie header string.
 * Used in server handlers and beforeLoad.
 */
export async function getSessionFromRequest(cookieHeader: string): Promise<Session | null> {
  try {
    const adapter = requestCookieAdapter(cookieHeader);
    const token = adapter.get("session");
    if (!token) return null;

    const secret = await getSecret();
    const session = await _verifySessionToken(token, secret, PLAN_KEYS, DEFAULT_PLAN);
    if (!session) return null;

    // Refresh plan from DB
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

/**
 * Get session - convenience for server functions that can access request headers.
 */
export async function getSession(): Promise<Session | null> {
  // In server functions, we need the cookie header passed explicitly
  // This is a fallback that returns null — use getSessionFromRequest in handlers
  return null;
}

export function hasMinimumPlan(userPlan: PlanKey, minimumPlan: PlanKey): boolean {
  return (PLAN_RANK[userPlan] ?? 0) >= (PLAN_RANK[minimumPlan] ?? 0);
}
