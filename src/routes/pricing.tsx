import { createFileRoute } from "@tanstack/react-router";
import { APP_NAME, PLAN_METADATA } from "../lib/constants";

export const Route = createFileRoute("/pricing")({
  component: PricingPage,
});

function PricingPage() {
  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: "64px 24px", textAlign: "center" }}>
      <h1 style={{ fontSize: 36, fontWeight: 700, marginBottom: 8 }}>Simple pricing</h1>
      <p style={{ color: "#71717a", marginBottom: 48 }}>Choose the plan that works for you</p>

      <div style={{ display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap" }}>
        {Object.entries(PLAN_METADATA).map(([key, plan]) => (
          <div key={key} style={{
            border: `1px solid ${plan.highlighted ? "#5b4cff" : "#e4e4e7"}`,
            borderRadius: 12, padding: 32, width: 280, background: "white", textAlign: "left",
            transform: plan.highlighted ? "scale(1.05)" : undefined,
            boxShadow: plan.highlighted ? "0 4px 24px rgba(91, 76, 255, 0.15)" : undefined,
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 600, marginTop: 0, marginBottom: 8 }}>{plan.name}</h3>
            <p style={{ fontSize: 14, color: "#71717a", marginBottom: 16 }}>{plan.description}</p>
            <div style={{ marginBottom: 24 }}>
              <span style={{ fontSize: 32, fontWeight: 700 }}>
                {plan.priceMonthly === 0 ? "Free" : `$${plan.priceMonthly}`}
              </span>
              {plan.priceMonthly > 0 && <span style={{ color: "#71717a" }}>/mo</span>}
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px 0" }}>
              {plan.features.map((f) => (
                <li key={f} style={{ fontSize: 14, padding: "4px 0", color: "#3f3f46" }}>✓ {f}</li>
              ))}
            </ul>
            <a
              href="/auth/login"
              style={{
                display: "block", textAlign: "center", padding: "10px", borderRadius: 8, textDecoration: "none", fontWeight: 500,
                background: plan.highlighted ? "#5b4cff" : "#18181b",
                color: "white",
              }}
            >
              {key === "free" ? "Get Started" : "Subscribe"}
            </a>
          </div>
        ))}
      </div>
    </main>
  );
}
