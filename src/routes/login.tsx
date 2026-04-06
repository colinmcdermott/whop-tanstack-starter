import { createFileRoute } from "@tanstack/react-router";
import { APP_NAME } from "@/lib/constants";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  return (
    <main style={{ maxWidth: 400, margin: "0 auto", padding: "128px 24px", textAlign: "center" }}>
      <h1 style={{ fontSize: 24, fontWeight: 600, marginBottom: 8 }}>Sign in to {APP_NAME}</h1>
      <p style={{ color: "#71717a", marginBottom: 32 }}>Continue with your Whop account</p>
      <a href="/api/auth/login" style={{ display: "inline-block", background: "#18181b", color: "white", padding: "12px 32px", borderRadius: 8, textDecoration: "none", fontWeight: 500 }}>
        Sign in with Whop
      </a>
    </main>
  );
}
