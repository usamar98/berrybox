"use client";

import { CreditCard, Lock, Sparkles } from "lucide-react";
import { Panel } from "@/components/ui/panel";
import { PricingCard } from "@/components/pricing/pricing-card";
import { PageShell } from "@/components/shared/page-shell";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { pricingPlans } from "@/lib/mock-data/pricing";

export function PricingPage() {
  return (
    <PageShell>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <SectionHeading
              title="Pricing preview"
              description="Static pricing cards only. No Stripe, checkout, subscription, credit ledger, or payment provider is connected yet."
              align="center"
            />
          </Reveal>
          <div className="grid gap-4 lg:grid-cols-4">
            {pricingPlans.map((plan, index) => (
              <Reveal key={plan.name} delay={index * 0.05}>
                <PricingCard plan={plan} />
              </Reveal>
            ))}
          </div>
          <Reveal>
            <Panel className="mt-8 grid gap-4 p-6 md:grid-cols-3">
              <div className="flex items-start gap-4">
                <Sparkles className="mt-1 h-5 w-5 text-[var(--teal)]" />
                <div>
                  <h3 className="font-black text-white">AI generations</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Credits are mocked for now and ready for a future ledger.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Lock className="mt-1 h-5 w-5 text-[var(--violet)]" />
                <div>
                  <h3 className="font-black text-white">Private projects</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Auth and database providers are interface-only stubs.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <CreditCard className="mt-1 h-5 w-5 text-[var(--coral)]" />
                <div>
                  <h3 className="font-black text-white">No payments yet</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Buttons intentionally show static coming-soon feedback.
                  </p>
                </div>
              </div>
            </Panel>
          </Reveal>
        </div>
      </section>
    </PageShell>
  );
}

