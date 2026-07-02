"use client";

import Link from "next/link";
import {
  Bot,
  Box,
  ChevronRight,
  Code2,
  Coins,
  FileCode2,
  Folder,
  Home,
  ImageIcon,
  MessageSquareText,
  Package,
  Save,
  Send,
  UploadCloud,
  User,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { ToastButton } from "@/components/shared/toast-button";
import { cn } from "@/lib/utils";

const chatMessages = [
  {
    role: "User",
    text: "Create a 2D RPG where a knight explores a forest.",
  },
  {
    role: "AI",
    text: "I created a playable RPG starter with movement, NPC dialogue, and collectibles.",
  },
  {
    role: "User",
    text: "Add enemies and coins.",
  },
  {
    role: "AI",
    text: "Enemies and coin scoring have been added.",
  },
];

const files = [
  "package.json",
  "src/main.ts",
  "src/game/Player.ts",
  "src/game/Enemy.ts",
  "src/game/NPC.ts",
  "src/styles.css",
];

const assets = ["player.png", "forest-bg.png", "coin.png", "enemy.png", "npc.png"];

const codeSample = `import Phaser from "phaser";

export class ForestScene extends Phaser.Scene {
  score = 0;

  create() {
    this.player = this.physics.add.sprite(120, 140, "player");
    this.coins = this.physics.add.group({ key: "coin", repeat: 6 });
    this.enemies = this.physics.add.group({ key: "enemy", repeat: 3 });

    this.physics.add.overlap(this.player, this.coins, collectCoin);
    this.physics.add.collider(this.player, this.enemies, restartLevel);
  }

  update() {
    moveWithArrowKeys(this.player);
  }
}`;

export function EditorPage() {
  return (
    <div className="min-h-screen bg-[#070b12] text-white">
      <TopBar />
      <div className="grid min-h-[calc(100vh-72px)] grid-cols-1 gap-4 p-4 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
        <ChatPanel />
        <PreviewPanel />
        <RightPanel />
      </div>
    </div>
  );
}

function TopBar() {
  return (
    <header className="flex min-h-[4.5rem] flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#070b12]/86 px-4 backdrop-blur-xl">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          href="/"
          className="grid h-10 w-10 place-items-center rounded-lg border border-teal-300/25 bg-teal-300/10 text-[var(--teal)]"
          aria-label="Back to home"
        >
          <Zap className="h-5 w-5 fill-current" />
        </Link>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-slate-500">
            Project
          </p>
          <h1 className="truncate text-lg font-black text-white">
            Forest Knight RPG
          </h1>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          <Home className="h-4 w-4" />
          Home
        </Link>
        <ToastButton variant="secondary" size="sm" message="Project save is coming soon">
          <Save className="h-4 w-4" />
          Save
        </ToastButton>
        <ToastButton size="sm" message="Publishing will connect in a future phase">
          <UploadCloud className="h-4 w-4" />
          Publish
        </ToastButton>
      </div>
    </header>
  );
}

function ChatPanel() {
  return (
    <Panel className="flex min-h-[520px] flex-col p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-teal-300/20 bg-teal-300/10 text-[var(--teal)]">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-black text-white">AI chat</h2>
            <p className="text-xs font-semibold text-slate-500">Mock transcript</p>
          </div>
        </div>
        <Badge tone="teal">Static</Badge>
      </div>
      <div className="code-scroll flex-1 space-y-3 overflow-auto pr-1">
        {chatMessages.map((message, index) => {
          const fromUser = message.role === "User";
          return (
            <div
              key={`${message.role}-${index}`}
              className={cn(
                "rounded-lg border p-3",
                fromUser
                  ? "border-orange-200/18 bg-orange-300/10"
                  : "border-teal-200/18 bg-teal-300/10",
              )}
            >
              <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-slate-500">
                {fromUser ? (
                  <User className="h-3.5 w-3.5" />
                ) : (
                  <Bot className="h-3.5 w-3.5" />
                )}
                {message.role}
              </div>
              <p className="text-sm leading-6 text-slate-200">{message.text}</p>
            </div>
          );
        })}
      </div>
      <div className="mt-4 rounded-lg border border-white/10 bg-[#090f1a] p-2">
        <div className="flex items-center gap-2">
          <MessageSquareText className="h-4 w-4 text-slate-500" />
          <input
            aria-label="AI message"
            placeholder="Ask for a level, enemy, or item..."
            className="h-10 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
          />
          <Button type="button" size="icon" aria-label="Send message">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Panel>
  );
}

function PreviewPanel() {
  return (
    <div className="flex min-h-[620px] min-w-0 flex-col gap-4">
      <Panel intensity="strong" className="flex flex-1 flex-col p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              Live game preview
            </p>
            <h2 className="mt-1 text-xl font-black text-white">
              Forest clearing canvas
            </h2>
          </div>
          <Badge tone="coral">
            <Coins className="mr-1 h-3.5 w-3.5" />
            Score 120
          </Badge>
        </div>
        <GameCanvas />
      </Panel>
      <Panel className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              Assets
            </p>
            <h2 className="mt-1 font-black text-white">Generated asset tray</h2>
          </div>
          <Badge tone="neutral">{assets.length} files</Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-5">
          {assets.map((asset, index) => (
            <div
              key={asset}
              className="rounded-lg border border-white/10 bg-white/[0.045] p-3"
            >
              <div
                className={cn(
                  "mb-3 grid aspect-square place-items-center rounded-md border",
                  index % 2
                    ? "border-orange-200/20 bg-orange-300/10 text-[var(--coral)]"
                    : "border-teal-200/20 bg-teal-300/10 text-[var(--teal)]",
                )}
              >
                <ImageIcon className="h-5 w-5" />
              </div>
              <p className="truncate text-xs font-semibold text-slate-300">
                {asset}
              </p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function GameCanvas() {
  return (
    <div className="relative min-h-[420px] flex-1 overflow-hidden rounded-xl border border-white/10 bg-[#0b1d16]">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />
      <div className="absolute left-4 top-4 z-10 rounded-lg border border-black/20 bg-black/35 px-3 py-2 text-sm font-black text-white">
        Score: 120
      </div>
      <div className="absolute bottom-4 left-1/2 z-10 w-[calc(100%-2rem)] -translate-x-1/2 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-center text-xs font-semibold text-slate-200 backdrop-blur">
        Use arrow keys to move â€” demo preview only
      </div>

      <div className="absolute bottom-0 left-0 h-[4.5rem] w-full bg-emerald-950/80" />
      <div className="absolute left-[16%] top-[22%] h-20 w-8 rounded-t-full bg-emerald-300/35" />
      <div className="absolute left-[20%] top-[31%] h-16 w-8 rounded-t-full bg-emerald-300/25" />
      <div className="absolute right-[18%] top-[20%] h-24 w-8 rounded-t-full bg-emerald-300/35" />
      <div className="absolute right-[30%] top-[38%] h-16 w-8 rounded-t-full bg-emerald-300/25" />
      <div className="absolute left-[42%] top-[33%] h-12 w-12 rounded-md border-2 border-white/30 bg-slate-100 shadow-[0_0_30px_rgba(255,255,255,0.22)]" />
      <div className="absolute left-[58%] top-[44%] h-10 w-10 rounded bg-[var(--coral)] shadow-[0_0_24px_rgba(255,122,89,0.38)]" />
      <div className="absolute left-[70%] top-[28%] h-10 w-10 rounded bg-[var(--coral)] shadow-[0_0_24px_rgba(255,122,89,0.38)]" />
      <Coin className="left-[30%] top-[48%]" />
      <Coin className="left-[50%] top-[24%]" />
      <Coin className="left-[78%] top-[56%]" />
      <div className="absolute left-[11%] bottom-[18%] h-10 w-20 rounded bg-[#1d3d2b]" />
      <div className="absolute right-[13%] bottom-[22%] h-10 w-24 rounded bg-[#1d3d2b]" />
    </div>
  );
}

function Coin({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "absolute h-6 w-6 rounded-full border border-yellow-100/60 bg-[var(--amber)] shadow-[0_0_24px_rgba(255,209,102,0.42)]",
        className,
      )}
    />
  );
}

function RightPanel() {
  return (
    <Panel className="flex min-h-[620px] min-w-0 flex-col overflow-hidden p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">
            Project files
          </p>
          <h2 className="mt-1 font-black text-white">Code preview</h2>
        </div>
        <Badge tone="violet">
          <Code2 className="mr-1 h-3.5 w-3.5" />
          Phaser-style
        </Badge>
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-rows-[0.8fr_1.2fr] xl:grid-rows-[260px_minmax(0,1fr)]">
        <div className="code-scroll overflow-auto rounded-lg border border-white/10 bg-[#090f1a] p-3">
          <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-slate-500">
            <Folder className="h-3.5 w-3.5" />
            File tree
          </div>
          <div className="space-y-1">
            {files.map((file, index) => (
              <div
                key={file}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-2 text-sm font-semibold",
                  index === 2
                    ? "bg-teal-300/10 text-teal-100"
                    : "text-slate-400 hover:bg-white/[0.04]",
                )}
              >
                {file.endsWith(".json") ? (
                  <Package className="h-4 w-4" />
                ) : (
                  <FileCode2 className="h-4 w-4" />
                )}
                <span className="min-w-0 truncate">{file}</span>
                {index === 2 ? <ChevronRight className="ml-auto h-4 w-4" /> : null}
              </div>
            ))}
          </div>
        </div>

        <div className="code-scroll min-h-[300px] overflow-auto rounded-lg border border-white/10 bg-[#050914] p-4">
          <div className="mb-4 flex items-center gap-2 text-xs font-black uppercase text-slate-500">
            <Box className="h-3.5 w-3.5" />
            src/game/Player.ts
          </div>
          <pre className="text-xs leading-6 text-slate-300">
            <code>{codeSample}</code>
          </pre>
        </div>
      </div>
    </Panel>
  );
}

