import { Check, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { ToastButton } from "@/components/shared/toast-button";
import type { PricingPlan } from "@/lib/mock-data/pricing";
import { cn } from "@/lib/utils";

export function PricingCard({ plan }: { plan: PricingPlan }) {
  return (
    <Panel
      intensity={plan.featured ? "strong" : "soft"}
      className={cn(
        "relative flex h-full flex-col p-6",
        plan.featured && "border-teal-200/35 shadow-[0_0_70px_rgba(57,245,212,0.16)]",
      )}
    >
      {plan.featured ? (
        <Badge tone="teal" className="absolute right-5 top-5">
          <Sparkles className="mr-1 h-3 w-3" />
          Best fit
        </Badge>
      ) : null}
      <div>
        <h3 className="text-xl font-black text-white">{plan.name}</h3>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          {plan.description}
        </p>
      </div>
      <div className="mt-7 flex items-end gap-2">
        <span className="text-4xl font-black text-white">{plan.price}</span>
        <span className="pb-1 text-sm font-semibold text-slate-500">/mo</span>
      </div>
      <ul className="mt-7 flex flex-1 flex-col gap-3 text-sm text-slate-300">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--teal)]" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <ToastButton
        className="mt-8 w-full"
        variant={plan.featured ? "primary" : "secondary"}
        message={`${plan.name} checkout is coming soon`}
      >
        Choose {plan.name}
      </ToastButton>
    </Panel>
  );
}
