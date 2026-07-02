"use client";

import { Boxes, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { PageShell } from "@/components/shared/page-shell";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { TemplateCard } from "@/components/templates/template-card";
import { templates } from "@/lib/mock-data/templates";

export function TemplatesPage() {
  return (
    <PageShell>
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="mb-10 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <SectionHeading
                title="Template gallery"
                description="Pick a starting genre, inspect the mock visual, and route future actions through static coming-soon states."
                className="mb-0"
              />
              <Panel className="flex items-center gap-3 p-3">
                <Search className="h-5 w-5 text-slate-500" />
                <input
                  aria-label="Search templates"
                  placeholder="Search templates, genres, mechanics..."
                  className="h-11 min-w-0 flex-1 bg-transparent text-sm font-semibold text-white outline-none placeholder:text-slate-500"
                />
                <Badge tone="teal">
                  <Boxes className="mr-1 h-3.5 w-3.5" />8 templates
                </Badge>
              </Panel>
            </div>
          </Reveal>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {templates.map((template, index) => (
              <Reveal key={template.title} delay={index * 0.04}>
                <TemplateCard template={template} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
