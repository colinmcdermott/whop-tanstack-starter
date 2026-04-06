import { createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { APP_NAME, PLAN_METADATA } from "@/lib/constants";
import { getSessionFromRequest } from "@/lib/auth";
import { getRequestHeader } from "@tanstack/react-start/server";

const getIndexData = createServerFn({ method: "GET" }).handler(async () => {
  let session = null;
  try {
    const cookieHeader = getRequestHeader("cookie") ?? "";
    session = await getSessionFromRequest(cookieHeader);
  } catch { /* DB not ready */ }
  return { session };
});

export const Route = createFileRoute("/")({
  loader: () => getIndexData(),
  component: HomePage,
});

function HomePage() {
  const { session } = Route.useLoaderData();

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "64px 24px", textAlign: "center" }}>
      <h1 style={{ fontSize: 48, fontWeight: 700, marginBottom: 16 }}>{APP_NAME}</h1>
      <p style={{ fontSize: 20, color: "#71717a", marginBottom: 48 }}>
        Built with TanStack Start and{" "}
        <a href="https://www.npmjs.com/package/whop-kit" style={{ color: "#2563eb" }}>whop-kit</a>
      </p>

      <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
        {Object.entries(PLAN_METADATA).map(([key, plan]) => (
          <div key={key} style={{
            border: `1px solid ${plan.highlighted ? "#2563eb" : "#e4e4e7"}`,
            borderRadius: 12, padding: 32, width: 280, background: "white", textAlign: "left",
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{plan.name}</h3>
            <p style={{ fontSize: 14, color: "#71717a", marginBottom: 16 }}>{plan.description}</p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {plan.features.map((f) => (
                <li key={f} style={{ fontSize: 14, padding: "4px 0", color: "#3f3f46" }}>✓ {f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {session ? (
        <div>
          <p style={{ marginBottom: 16 }}>Welcome back, {session.name || session.email || "user"}!</p>
          <a href="/dashboard" style={{ display: "inline-block", background: "#18181b", color: "white", padding: "10px 24px", borderRadius: 8, textDecoration: "none", marginRight: 8 }}>
            Dashboard
          </a>
          <a href="/api/auth/logout" style={{ color: "#71717a", padding: "10px 24px", textDecoration: "none" }}>
            Sign out
          </a>
        </div>
      ) : (
        <a href="/api/auth/login" style={{ display: "inline-block", background: "#18181b", color: "white", padding: "12px 32px", borderRadius: 8, textDecoration: "none", fontWeight: 500 }}>
          Sign in with Whop
        </a>
      )}
    </main>
  );
}
