"use client";

import { Eye, WandSparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { ToastButton } from "@/components/shared/toast-button";
import { GameImage } from "@/components/shared/game-image";
import type { GameTemplate } from "@/lib/mock-data/templates";

export function TemplateCard({ template }: { template: GameTemplate }) {
  return (
    <Panel className="group flex h-full flex-col overflow-hidden p-3 transition duration-300 hover:-translate-y-1 hover:border-teal-200/30">
      <GameImage src={template.image} alt={`${template.title} game image`} />
      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-black text-white">{template.title}</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {template.description}
            </p>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Badge tone="teal">{template.category}</Badge>
          <Badge tone="neutral">{template.difficulty}</Badge>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-3">
          <ToastButton
            size="sm"
            message={`${template.title} template flow is coming soon`}
          >
            <WandSparkles className="h-4 w-4" />
            Use Template
          </ToastButton>
          <ToastButton
            size="sm"
            variant="secondary"
            message={`${template.title} preview is coming soon`}
          >
            <Eye className="h-4 w-4" />
            Preview
          </ToastButton>
        </div>
      </div>
    </Panel>
  );
}
