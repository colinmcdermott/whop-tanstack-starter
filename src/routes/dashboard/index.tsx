import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/")({
  component: () => {
    const { session } = Route.useRouteContext();

    return (
      <div style={{ border: "1px solid #e4e4e7", borderRadius: 12, padding: 24, background: "white" }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginTop: 0, marginBottom: 12 }}>Start building</h2>
        <p style={{ fontSize: 14, color: "#71717a", lineHeight: 1.6, margin: 0 }}>
          This template uses <a href="https://www.npmjs.com/package/whop-kit" style={{ color: "#2563eb" }}>whop-kit</a> for
          authentication and payments. Built with TanStack Start.
          Plan: {session.plan}
        </p>
      </div>
    );
  },
});
