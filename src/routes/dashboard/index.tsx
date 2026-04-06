import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  const { session } = Route.useRouteContext();

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        <div style={{ background: "white", border: "1px solid #e4e4e7", borderRadius: 12, padding: 24 }}>
          <p style={{ fontSize: 12, color: "#71717a", textTransform: "uppercase", marginBottom: 4, marginTop: 0 }}>Plan</p>
          <p style={{ fontSize: 24, fontWeight: 600, textTransform: "capitalize", margin: 0 }}>{session.plan}</p>
        </div>
        <div style={{ background: "white", border: "1px solid #e4e4e7", borderRadius: 12, padding: 24 }}>
          <p style={{ fontSize: 12, color: "#71717a", textTransform: "uppercase", marginBottom: 4, marginTop: 0 }}>Name</p>
          <p style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>{session.name || "—"}</p>
        </div>
        <div style={{ background: "white", border: "1px solid #e4e4e7", borderRadius: 12, padding: 24 }}>
          <p style={{ fontSize: 12, color: "#71717a", textTransform: "uppercase", marginBottom: 4, marginTop: 0 }}>Role</p>
          <p style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>{session.isAdmin ? "Admin" : "Member"}</p>
        </div>
      </div>

      <div style={{ border: "1px solid #e4e4e7", borderRadius: 12, padding: 24, background: "white" }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: 0, marginBottom: 12 }}>Your app goes here</h2>
        <p style={{ fontSize: 14, color: "#71717a", lineHeight: 1.6, margin: 0 }}>
          This template uses <a href="https://www.npmjs.com/package/whop-kit" style={{ color: "#2563eb" }}>whop-kit</a> for
          authentication, session management, and subscription handling. Built with TanStack Start for type-safe
          routing and server functions.
        </p>
      </div>
    </>
  );
}
