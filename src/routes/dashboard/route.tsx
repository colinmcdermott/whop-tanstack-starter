import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getSession } from "@/lib/auth";

const requireAuth = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getSession();
  if (!session) throw redirect({ to: "/login" });
  return session;
});

export const Route = createFileRoute("/dashboard")({
  beforeLoad: async () => {
    const session = await requireAuth();
    return { session };
  },
  component: DashboardLayout,
});

function DashboardLayout() {
  const { session } = Route.useRouteContext();

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 48 }}>
        <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Dashboard</h1>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span style={{ fontSize: 14, color: "#71717a" }}>{session.email}</span>
          <a href="/api/auth/logout" style={{ fontSize: 14, color: "#ef4444", textDecoration: "none" }}>Sign out</a>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
