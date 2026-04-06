import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: () => (
    <main style={{ maxWidth: 600, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
      <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 12 }}>Whop SaaS Starter</h1>
      <p style={{ color: "#71717a", marginBottom: 32 }}>
        Built with TanStack Start and whop-kit
      </p>
      <a href="/auth/login" style={{ display: "inline-block", background: "#18181b", color: "white", padding: "12px 32px", borderRadius: 8, textDecoration: "none" }}>
        Sign in with Whop
      </a>
    </main>
  ),
});
