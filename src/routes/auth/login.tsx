import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { setCookie, getRequestHeader } from "@tanstack/react-start/server";
import { buildAuthorizationUrl } from "../../lib/whop";

const initiateOAuth = createServerFn({ method: "GET" }).handler(async () => {
  const clientId = process.env.WHOP_APP_ID;
  if (!clientId) throw new Error("WHOP_APP_ID not configured");

  const host = getRequestHeader("host") ?? "localhost:3000";
  const proto = getRequestHeader("x-forwarded-proto") ?? "http";
  const redirectUri = `${proto}://${host}/auth/callback`;

  const { url, codeVerifier, state, nonce } = await buildAuthorizationUrl(redirectUri, clientId);

  setCookie("pkce", JSON.stringify({ codeVerifier, state, nonce }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  throw redirect({ href: url });
});

export const Route = createFileRoute("/auth/login")({
  beforeLoad: async () => {
    await initiateOAuth();
  },
  component: () => <p>Redirecting to Whop...</p>,
});
