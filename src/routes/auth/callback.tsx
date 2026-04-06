import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, deleteCookie, getRequestUrl } from "@tanstack/react-start/server";
import { exchangeCodeForTokens, getWhopUser } from "../../lib/whop";
import { createSessionToken, encodeSecret, generateSecret } from "whop-kit/auth";
import { prisma } from "../../../db/index";

const handleCallback = createServerFn({ method: "GET" }).handler(async () => {
  const url = new URL(getRequestUrl());
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");

  if (!code || !state) throw redirect({ to: "/login" });

  const pkceCookie = getCookie("pkce");
  if (!pkceCookie) throw redirect({ to: "/login" });

  const pkce = JSON.parse(pkceCookie);
  if (pkce.state !== state) throw redirect({ to: "/login" });

  deleteCookie("pkce");

  const clientId = process.env.WHOP_APP_ID;
  if (!clientId) throw redirect({ to: "/login" });

  const redirectUri = `${url.origin}/auth/callback`;

  try {
    const tokens = await exchangeCodeForTokens(code, pkce.codeVerifier, redirectUri, clientId);
    const whopUser = await getWhopUser(tokens.access_token);

    const existingCount = await prisma.user.count();
    const user = await prisma.user.upsert({
      where: { whopUserId: whopUser.sub },
      update: { email: whopUser.email ?? null, name: whopUser.name ?? null, profileImageUrl: whopUser.picture ?? null },
      create: { whopUserId: whopUser.sub, email: whopUser.email ?? null, name: whopUser.name ?? null, profileImageUrl: whopUser.picture ?? null, isAdmin: existingCount === 0 },
    });

    let secretStr = process.env.SESSION_SECRET;
    if (!secretStr) {
      const existing = await prisma.systemConfig.findUnique({ where: { key: "session_secret" } });
      secretStr = existing?.value ?? generateSecret();
      if (!existing) {
        try { await prisma.systemConfig.create({ data: { key: "session_secret", value: secretStr } }); } catch {}
      }
    }

    const token = await createSessionToken(
      { userId: user.id, whopUserId: user.whopUserId, email: user.email, name: user.name, profileImageUrl: user.profileImageUrl, plan: user.plan, cancelAtPeriodEnd: user.cancelAtPeriodEnd, isAdmin: user.isAdmin },
      encodeSecret(secretStr),
    );

    const maxAge = 60 * 60 * 24 * 7;
    setCookie("session", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge, path: "/" });
    setCookie("logged_in", "1", { httpOnly: false, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge, path: "/" });

    throw redirect({ to: "/dashboard" });
  } catch (err) {
    if ((err as any)?.redirect || (err as any)?.to) throw err;
    console.error("[Auth] Callback error:", err);
    throw redirect({ to: "/login" });
  }
});

export const Route = createFileRoute("/auth/callback")({
  beforeLoad: async () => {
    await handleCallback();
  },
  component: () => <p>Processing sign-in...</p>,
});
