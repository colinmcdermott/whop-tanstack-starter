import { createFileRoute, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { isSetupComplete, getPlansConfig, type PlansConfig } from "../lib/config";
import { Header } from "../components/landing/header";
import { Hero } from "../components/landing/hero";
import { Features } from "../components/landing/features";
import { PricingCards } from "../components/landing/pricing-cards";
import { Testimonials } from "../components/landing/testimonials";
import { CTA } from "../components/landing/cta";
import { Footer } from "../components/landing/footer";

const getIndexData = createServerFn({ method: "GET" }).handler(async () => {
  const setupDone = await isSetupComplete();
  if (!setupDone) {
    throw redirect({ to: "/setup" });
  }

  const plans = await getPlansConfig();
  return { plans };
});

export const Route = createFileRoute("/")({
  loader: () => getIndexData(),
  head: () => ({
    meta: [
      { title: "Whop SaaS Starter | A modern SaaS starter built with TanStack Start and Whop" },
      { name: "description", content: "A modern SaaS starter built with TanStack Start and Whop" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { plans } = Route.useLoaderData();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main id="main-content" className="flex-1">
        <Hero />
        <Features />
        <Testimonials />

        {/* Pricing section */}
        <section>
          <div className="mx-auto max-w-5xl px-4 py-24 sm:px-6">
            <div className="text-center mb-16">
              <h2 className="text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                Simple, transparent pricing
              </h2>
              <p className="mt-3 text-sm text-[var(--muted)]">
                Start free. Upgrade when you&apos;re ready.
              </p>
            </div>
            <PricingCards plans={plans} />
          </div>
        </section>

        <CTA />
      </main>
      <Footer />
    </div>
  );
}
