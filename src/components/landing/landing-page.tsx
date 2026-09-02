"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Bot,
  Boxes,
  BrainCircuit,
  Gamepad2,
  MessageSquareText,
  Play,
  Rocket,
  Share2,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Panel } from "@/components/ui/panel";
import { GameImage } from "@/components/shared/game-image";
import { PageShell } from "@/components/shared/page-shell";
import { Reveal } from "@/components/shared/reveal";
import { SectionHeading } from "@/components/shared/section-heading";
import { ToastButton } from "@/components/shared/toast-button";
import { GameCard } from "@/components/gallery/game-card";
import { featuredGames } from "@/lib/mock-data/games";
import { templates } from "@/lib/mock-data/templates";
import { cn } from "@/lib/utils";

const steps = [
  {
    title: "Describe the game",
    description:
      "Start with a plain-language idea, a genre, a mechanic, or a character hook.",
    icon: MessageSquareText,
  },
  {
    title: "Forge a plan",
    description:
      "OpenAI turns the idea into a validated game configuration with mechanics, enemies, collectibles, and a goal.",
    icon: BrainCircuit,
  },
  {
    title: "Tune the preview",
    description:
      "Play the generated level, inspect its files, and ask the AI to tune the configuration.",
    icon: Gamepad2,
  },
];

const featureSections = [
  {
    title: "AI game generation",
    description:
      "A live OpenAI generation route converts plain-language ideas into safe, structured RPG configurations for the playable preview.",
    icon: WandSparkles,
    tone: "teal",
  },
  {
    title: "Template library",
    description:
      "Start from RPGs, platformers, visual novels, racing games, puzzles, shooters, and 3D exploration shells.",
    icon: Boxes,
    tone: "coral",
  },
  {
    title: "AI characters/NPCs",
    description:
      "Mocked NPC story flows show where memory, goals, dialogue, and branching quests will connect.",
    icon: Bot,
    tone: "violet",
  },
  {
    title: "Asset generation",
    description:
      "A future asset queue can create sprites, backgrounds, props, UI elements, and world textures.",
    icon: Sparkles,
    tone: "teal",
  },
  {
    title: "Publish and share",
    description:
      "Deployment contracts leave room for future Vercel publishing, share URLs, project pages, and community remixing.",
    icon: Share2,
    tone: "coral",
  },
];

const faqs = [
  {
    question: "Does BerryBox call a real AI model?",
    answer:
      "Yes. The prompt and editor chat use OpenAI to create and revise a validated game configuration.",
  },
  {
    question: "Can I connect auth, storage, and payments later?",
    answer:
      "Yes. The project includes future provider contracts for auth, storage, payments, AI, and deployment.",
  },
  {
    question: "Are templates and gallery games real published games?",
    answer:
      "Not yet. They are polished demo records for client presentation and product exploration.",
  },
  {
    question: "Is the editor a real game engine?",
    answer:
      "The first playable renderer supports keyboard movement, health, enemy collisions, collectibles, scoring, and generated configuration updates.",
  },
];

export function LandingPage() {
  return (
    <PageShell>
      <Hero />
      <HowItWorks />
      <GenerationSystem />
      <TemplateLibraryPreview />
      <CapabilityRail />
      <FeaturedGames />
      <FaqSection />
    </PageShell>
  );
}

function Hero() {
  const [prompt, setPrompt] = useState("");
  const router = useRouter();

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanPrompt = prompt.trim();
    if (cleanPrompt.length < 3) return;
    router.push(`/editor?prompt=${encodeURIComponent(cleanPrompt)}`);
  }

  return (
    <section className="relative isolate min-h-[100svh] w-full overflow-hidden px-4 py-20 text-center sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="hero-red-backdrop -z-20"
      />
      <div aria-hidden="true" className="hero-red-floor -z-10" />
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 mx-auto flex max-w-4xl flex-col items-center"
      >
        <h1 className="text-balance text-5xl font-black tracking-tight text-white sm:text-6xl lg:text-7xl">
          Build playable games from a prompt
        </h1>

        <div className="mx-auto mt-10 w-full max-w-3xl">
          <Panel className="p-3 text-left">
            <form onSubmit={handleCreate}>
            <label htmlFor="game-prompt" className="sr-only">
              Game prompt
            </label>
            <textarea
              id="game-prompt"
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              maxLength={500}
              placeholder="Describe the game you want to create…"
              className="min-h-32 w-full resize-none rounded-lg border border-white/10 bg-[#090f1a]/90 p-4 text-base leading-7 text-white outline-none transition placeholder:text-slate-500 focus:border-teal-200/45"
            />
            <div className="mt-3 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <Button
                type="submit"
                size="lg"
                disabled={prompt.trim().length < 3}
                className="w-full sm:w-auto"
              >
                <Rocket className="h-5 w-5" />
                Create Game
              </Button>
              <Link
                href="/templates"
                className={cn(
                  buttonVariants({ variant: "secondary", size: "lg" }),
                )}
              >
                <Boxes className="h-5 w-5" />
                Explore Templates
              </Link>
            </div>
            </form>
          </Panel>
        </div>
      </motion.div>
    </section>
  );
}
function HowItWorks() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading
            title="How it works"
            description="A working prompt-to-game loop that turns an idea into a validated configuration, playable level, and editable project."
            align="center"
          />
        </Reveal>
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Reveal key={step.title} delay={index * 0.08}>
                <Panel className="h-full p-6">
                  <div className="mb-6 grid h-12 w-12 place-items-center rounded-lg border border-teal-300/20 bg-teal-300/10 text-[var(--teal)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-black text-white">{step.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-slate-400">
                    {step.description}
                  </p>
                </Panel>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function GenerationSystem() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <Reveal>
          <SectionHeading
            title="AI game generation"
            description="The first live generation pipeline connects prompt, structured game plan, playable preview, generated files, and browser-local project saving."
          />
          <Link
            href="/roadmap"
            className={cn(buttonVariants({ variant: "secondary" }))}
          >
            <Rocket className="h-4 w-4" />
            View Roadmap
          </Link>
        </Reveal>
        <Panel className="grid gap-4 p-4 md:grid-cols-2">
          {featureSections.slice(0, 2).map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-lg border border-white/10 bg-[#0b1220]/70 p-5"
              >
                <Icon className="h-6 w-6 text-[var(--teal)]" />
                <h3 className="mt-5 text-lg font-black text-white">
                  {feature.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </Panel>
      </div>
    </section>
  );
}

function TemplateLibraryPreview() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading
            title="Template library"
            description="Eight starting points are modeled with categories, difficulty, preview visuals, and static use/preview actions."
          />
        </Reveal>
        <div className="grid gap-4 md:grid-cols-4">
          {templates.slice(0, 4).map((template, index) => (
            <Reveal key={template.title} delay={index * 0.06}>
              <Panel className="overflow-hidden p-3">
                <GameImage src={template.image} alt={`${template.title} game image`} className="min-h-36" />
                <div className="p-3">
                  <Badge tone="neutral">{template.difficulty}</Badge>
                  <h3 className="mt-3 text-base font-black text-white">
                    {template.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400">
                    {template.category}
                  </p>
                </div>
              </Panel>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function CapabilityRail() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-4 lg:grid-cols-3">
          {featureSections.slice(2).map((feature, index) => {
            const Icon = feature.icon;
            const tone = feature.tone as "teal" | "coral" | "violet";
            return (
              <Reveal key={feature.title} delay={index * 0.08}>
                <Panel className="h-full p-6">
                  <Badge tone={tone}>{feature.title}</Badge>
                  <Icon className="mt-7 h-8 w-8 text-white" />
                  <p className="mt-5 text-sm leading-6 text-slate-400">
                    {feature.description}
                  </p>
                </Panel>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeaturedGames() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <SectionHeading
            title="Featured demo games"
            description="Public gallery cards show how future generated games can be played, cloned, and remixed."
          />
        </Reveal>
        <div className="grid gap-4 lg:grid-cols-3">
          {featuredGames.map((game, index) => (
            <Reveal key={game.title} delay={index * 0.08}>
              <GameCard game={game} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqSection() {
  return (
    <section className="px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionHeading title="FAQ" align="center" />
        </Reveal>
        <div className="grid gap-4 md:grid-cols-2">
          {faqs.map((faq, index) => (
            <Reveal key={faq.question} delay={index * 0.05}>
              <Panel className="h-full p-6">
                <h3 className="text-lg font-black text-white">{faq.question}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-400">
                  {faq.answer}
                </p>
              </Panel>
            </Reveal>
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <ToastButton variant="coral" message="Client handoff notes coming soon">
            <Play className="h-4 w-4" />
            Request Demo Walkthrough
          </ToastButton>
        </div>
      </div>
    </section>
  );
}


