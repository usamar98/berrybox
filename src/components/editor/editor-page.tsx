"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  Bot,
  Box,
  ChevronRight,
  Code2,
  Coins,
  FileCode2,
  Folder,
  Heart,
  Home,
  ImageIcon,
  LoaderCircle,
  MessageSquareText,
  Package,
  RotateCcw,
  Save,
  Send,
  Sparkles,
  Target,
  UploadCloud,
  User,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Panel } from "@/components/ui/panel";
import { ToastButton } from "@/components/shared/toast-button";
import { useToast } from "@/components/shared/toast";
import {
  GameSpecSchema,
  createGameCode,
  defaultGameSpec,
  getGameAssets,
  type GameSpec,
} from "@/lib/game-spec";
import { cn } from "@/lib/utils";

type ChatMessage = {
  role: "User" | "AI";
  text: string;
};

type GenerateResponse = {
  spec?: unknown;
  assistantMessage?: string;
  source?: "openai" | "local-fallback";
  error?: string;
};

const files = [
  "game.config.json",
  "src/main.ts",
  "src/game/Player.ts",
  "src/game/Enemy.ts",
  "src/game/Collectible.ts",
  "src/styles.css",
];

const welcomeMessage: ChatMessage = {
  role: "AI",
  text: "Describe a top-down RPG and I will turn it into a playable configuration. After that, ask me to change its speed, enemies, coins, theme, or goal.",
};

function storeProject(spec: GameSpec) {
  window.localStorage.setItem(
    "berrybox-project",
    JSON.stringify({ version: 1, spec }),
  );
}

export function EditorPage({ initialPrompt = "" }: { initialPrompt?: string }) {
  const [spec, setSpec] = useState<GameSpec>(defaultGameSpec);
  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationSource, setGenerationSource] = useState<"openai" | "local-fallback">("openai");
  const [error, setError] = useState<string | null>(null);
  const initialized = useRef(false);
  const { showToast } = useToast();

  const generateGame = useCallback(
    async (prompt: string, currentSpec?: GameSpec) => {
      const cleanPrompt = prompt.trim();
      if (!cleanPrompt || isGenerating) return;

      setError(null);
      setIsGenerating(true);
      setMessages((current) => [
        ...current,
        { role: "User", text: cleanPrompt },
      ]);

      try {
        const response = await fetch("/api/games/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: cleanPrompt, currentSpec }),
        });
        const data = (await response.json()) as GenerateResponse;

        if (!response.ok) {
          throw new Error(data.error || "Game generation failed.");
        }

        const nextSpec = GameSpecSchema.parse(data.spec);
        setSpec(nextSpec);
        setGenerationSource(data.source ?? "openai");
        setMessages((current) => [
          ...current,
          {
            role: "AI",
            text:
              data.assistantMessage ||
              `Updated ${nextSpec.title}. The preview is ready to play.`,
          },
        ]);
        storeProject(nextSpec);
      } catch (generationError) {
        const message =
          generationError instanceof Error
            ? generationError.message
            : "Game generation failed.";
        setError(message);
        setMessages((current) => [
          ...current,
          { role: "AI", text: `${message} Your current preview is unchanged.` },
        ]);
      } finally {
        setIsGenerating(false);
      }
    },
    [isGenerating],
  );

  useEffect(() => {
    if (initialized.current) return;

    const timer = window.setTimeout(() => {
      if (initialized.current) return;
      initialized.current = true;

      if (initialPrompt.trim()) {
        void generateGame(initialPrompt);
        return;
      }

      const savedProject = window.localStorage.getItem("berrybox-project");
      if (!savedProject) return;

      try {
        const storedValue = JSON.parse(savedProject) as {
          version?: number;
          spec?: unknown;
        };
        const savedSpec = GameSpecSchema.parse(
          storedValue.version === 1 ? storedValue.spec : storedValue,
        );
        setSpec(savedSpec);
        setMessages([
          welcomeMessage,
          { role: "AI", text: `Restored ${savedSpec.title} from this browser.` },
        ]);
      } catch {
        window.localStorage.removeItem("berrybox-project");
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, [generateGame, initialPrompt]);

  function saveProject() {
    storeProject(spec);
    showToast(`${spec.title} saved in this browser`);
  }

  return (
    <div className="min-h-screen bg-[#070b12] text-white">
      <TopBar
        title={spec.title}
        isGenerating={isGenerating}
        generationSource={generationSource}
        onSave={saveProject}
      />
      <div className="grid min-h-[calc(100vh-72px)] grid-cols-1 gap-4 p-4 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
        <ChatPanel
          messages={messages}
          isGenerating={isGenerating}
          error={error}
          onSubmit={(prompt) => generateGame(prompt, spec)}
        />
        <PreviewPanel spec={spec} />
        <RightPanel spec={spec} />
      </div>
    </div>
  );
}

function TopBar({
  title,
  isGenerating,
  generationSource,
  onSave,
}: {
  title: string;
  isGenerating: boolean;
  generationSource: "openai" | "local-fallback";
  onSave: () => void;
}) {
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
            Live project
          </p>
          <h1 className="truncate text-lg font-black text-white">{title}</h1>
        </div>
        {isGenerating ? (
          <Badge tone="teal">
            <LoaderCircle className="mr-1 h-3.5 w-3.5 animate-spin" />
            Generating
          </Badge>
        ) : generationSource === "local-fallback" ? (
          <Badge tone="coral">Local fallback</Badge>
        ) : (
          <Badge tone="teal">AI connected</Badge>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/"
          className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
        >
          <Home className="h-4 w-4" />
          Home
        </Link>
        <Button type="button" variant="secondary" size="sm" onClick={onSave}>
          <Save className="h-4 w-4" />
          Save
        </Button>
        <ToastButton
          size="sm"
          message="Publishing will connect in a future phase"
        >
          <UploadCloud className="h-4 w-4" />
          Publish
        </ToastButton>
      </div>
    </header>
  );
}

function ChatPanel({
  messages,
  isGenerating,
  error,
  onSubmit,
}: {
  messages: ChatMessage[];
  isGenerating: boolean;
  error: string | null;
  onSubmit: (prompt: string) => void;
}) {
  const [input, setInput] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim() || isGenerating) return;
    onSubmit(input);
    setInput("");
  }

  return (
    <Panel className="flex min-h-[560px] flex-col p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg border border-teal-300/20 bg-teal-300/10 text-[var(--teal)]">
            <Bot className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-black text-white">AI game designer</h2>
            <p className="text-xs font-semibold text-slate-500">
              Structured game generation
            </p>
          </div>
        </div>
        <Badge tone="teal">Live</Badge>
      </div>

      {error ? (
        <div role="alert" className="mb-3 rounded-lg border border-red-300/20 bg-red-400/10 p-3 text-xs leading-5 text-red-100">
          {error}
        </div>
      ) : null}

      <div className="code-scroll flex-1 space-y-3 overflow-auto pr-1">
        {messages.map((message, index) => {
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
                {fromUser ? <User className="h-3.5 w-3.5" /> : <Bot className="h-3.5 w-3.5" />}
                {message.role}
              </div>
              <p className="text-sm leading-6 text-slate-200">{message.text}</p>
            </div>
          );
        })}
        {isGenerating ? (
          <div className="flex items-center gap-2 rounded-lg border border-teal-200/18 bg-teal-300/10 p-3 text-sm text-teal-100">
            <LoaderCircle className="h-4 w-4 animate-spin" />
            Designing the game configuration...
          </div>
        ) : null}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 rounded-lg border border-white/10 bg-[#090f1a] p-2">
        <div className="flex items-center gap-2">
          <MessageSquareText className="h-4 w-4 text-slate-500" />
          <input
            aria-label="AI game request"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            maxLength={500}
            disabled={isGenerating}
            placeholder="Add enemies, change the theme, make me faster..."
            className="h-10 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600 disabled:opacity-60"
          />
          <Button
            type="submit"
            size="icon"
            disabled={isGenerating || input.trim().length < 3}
            aria-label="Send game request"
          >
            {isGenerating ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </Panel>
  );
}

function PreviewPanel({ spec }: { spec: GameSpec }) {
  const assets = getGameAssets(spec);

  return (
    <div className="flex min-h-[620px] min-w-0 flex-col gap-4">
      <Panel intensity="strong" className="flex flex-1 flex-col p-4">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              Playable preview
            </p>
            <h2 className="mt-1 text-xl font-black text-white">{spec.title}</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
              {spec.summary}
            </p>
          </div>
          <Badge tone="coral">
            <Target className="mr-1 h-3.5 w-3.5" />
            {spec.collectibles.count} {spec.collectibles.name.toLowerCase()}s
          </Badge>
        </div>
        <GameCanvas key={JSON.stringify(spec)} spec={spec} />
      </Panel>

      <Panel className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">Assets</p>
            <h2 className="mt-1 font-black text-white">Generated asset manifest</h2>
          </div>
          <Badge tone="neutral">{assets.length} files</Badge>
        </div>
        <div className="grid gap-3 sm:grid-cols-5">
          {assets.map((asset, index) => (
            <div key={asset} className="rounded-lg border border-white/10 bg-white/[0.045] p-3">
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
              <p className="truncate text-xs font-semibold text-slate-300">{asset}</p>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

type Position = { x: number; y: number };

function createPositions(count: number, offset: number): Position[] {
  return Array.from({ length: count }, (_, index) => ({
    x: 12 + ((index * 31 + offset) % 76),
    y: 18 + ((index * 23 + offset * 2) % 58),
  }));
}

const themeBackgrounds: Record<GameSpec["theme"], string> = {
  forest: "radial-gradient(circle at 50% 35%, #24543d 0%, #102b21 42%, #07130e 100%)",
  desert: "radial-gradient(circle at 50% 35%, #8a542c 0%, #4c2d1c 44%, #1c100b 100%)",
  space: "radial-gradient(circle at 50% 35%, #273b72 0%, #111a3b 42%, #050711 100%)",
  ice: "radial-gradient(circle at 50% 35%, #3a7180 0%, #193b49 44%, #07151c 100%)",
  neon: "radial-gradient(circle at 50% 35%, #4c246d 0%, #211037 44%, #0a0611 100%)",
};

const playerColors: Record<GameSpec["player"]["color"], string> = {
  teal: "#39f5d4",
  coral: "#ff7a59",
  violet: "#a78bfa",
  amber: "#ffd166",
};

function GameCanvas({ spec }: { spec: GameSpec }) {
  const [player, setPlayer] = useState<Position>({ x: 50, y: 76 });
  const [collected, setCollected] = useState<number[]>([]);
  const [health, setHealth] = useState(spec.player.health);
  const lastHit = useRef(0);
  const coins = useMemo(
    () => createPositions(spec.collectibles.count, 7),
    [spec.collectibles.count],
  );
  const enemies = useMemo(
    () => createPositions(spec.enemies.count, 19),
    [spec.enemies.count],
  );
  const complete = collected.length === coins.length;
  const defeated = health <= 0;
  const score = collected.length * spec.collectibles.pointsEach;

  const reset = useCallback(() => {
    setPlayer({ x: 50, y: 76 });
    setCollected([]);
    setHealth(spec.player.health);
    lastHit.current = 0;
  }, [spec.player.health]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const directions: Record<string, Position> = {
        ArrowUp: { x: 0, y: -1 },
        ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 },
        ArrowRight: { x: 1, y: 0 },
      };
      const direction = directions[event.key];
      if (!direction || complete || defeated) return;

      event.preventDefault();
      const step = spec.player.speed / 55;
      const next = {
        x: Math.max(4, Math.min(94, player.x + direction.x * step)),
        y: Math.max(8, Math.min(88, player.y + direction.y * step)),
      };

      const newlyCollected = coins
        .map((coin, index) => ({ coin, index }))
        .filter(
          ({ coin, index }) =>
            !collected.includes(index) &&
            Math.hypot(coin.x - next.x, coin.y - next.y) < 6,
        )
        .map(({ index }) => index);

      if (newlyCollected.length) {
        setCollected((current) => [...current, ...newlyCollected]);
      }

      const hitEnemy = enemies.some(
        (enemy) => Math.hypot(enemy.x - next.x, enemy.y - next.y) < 7,
      );
      if (hitEnemy && Date.now() - lastHit.current > 700) {
        lastHit.current = Date.now();
        setHealth((current) => Math.max(0, current - 1));
        setPlayer({ x: 50, y: 76 });
        return;
      }

      setPlayer(next);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [coins, collected, complete, defeated, enemies, player, spec.player.speed]);

  return (
    <div
      className="relative min-h-[430px] flex-1 overflow-hidden rounded-xl border border-white/10 outline-none"
      style={{ background: themeBackgrounds[spec.theme] }}
      aria-label={`Playable preview for ${spec.title}`}
    >
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:34px_34px]" />

      <div className="absolute left-4 top-4 z-20 flex flex-wrap items-center gap-2">
        <Badge tone="coral">
          <Coins className="mr-1 h-3.5 w-3.5" />
          {score} pts
        </Badge>
        <Badge tone="neutral">
          <Heart className="mr-1 h-3.5 w-3.5" />
          {health}/{spec.player.health}
        </Badge>
        <Badge tone="neutral">Speed {spec.player.speed}</Badge>
      </div>

      <div className="absolute right-4 top-4 z-20">
        <Button type="button" size="sm" variant="secondary" onClick={reset}>
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      {coins.map((coin, index) =>
        collected.includes(index) ? null : (
          <div
            key={`coin-${index}`}
            title={spec.collectibles.name}
            className="absolute z-10 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-yellow-100/70 bg-[var(--amber)] shadow-[0_0_22px_rgba(255,209,102,0.55)]"
            style={{ left: `${coin.x}%`, top: `${coin.y}%` }}
          />
        ),
      )}

      {enemies.map((enemy, index) => (
        <div
          key={`enemy-${index}`}
          title={spec.enemies.name}
          className="absolute z-10 grid h-10 w-10 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-lg border border-red-100/30 bg-red-500/75 text-[10px] font-black text-white shadow-[0_0_24px_rgba(239,68,68,0.32)]"
          style={{
            left: `${enemy.x}%`,
            top: `${enemy.y}%`,
            animation: `pulse ${Math.max(0.5, 2.2 - spec.enemies.speed / 120)}s ease-in-out infinite`,
          }}
        >
          {index + 1}
        </div>
      ))}

      <div
        title={spec.player.name}
        className="absolute z-20 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-xl border-2 border-white/70 text-xs font-black text-[#07110e] shadow-[0_0_30px_rgba(255,255,255,0.34)] transition-[left,top] duration-75"
        style={{
          left: `${player.x}%`,
          top: `${player.y}%`,
          backgroundColor: playerColors[spec.player.color],
        }}
      >
        P
      </div>

      <div className="absolute bottom-4 left-1/2 z-20 w-[calc(100%-2rem)] -translate-x-1/2 rounded-lg border border-white/10 bg-black/45 px-3 py-2 text-center text-xs font-semibold text-slate-100 backdrop-blur">
        Arrow keys move {spec.player.name}. Goal: {spec.goal}
      </div>

      {complete || defeated ? (
        <div className="absolute inset-0 z-30 grid place-items-center bg-black/65 p-6 backdrop-blur-sm">
          <div className="max-w-sm rounded-xl border border-white/15 bg-[#0c1422] p-6 text-center shadow-2xl">
            {complete ? <Sparkles className="mx-auto h-8 w-8 text-[var(--amber)]" /> : <Heart className="mx-auto h-8 w-8 text-[var(--coral)]" />}
            <h3 className="mt-4 text-2xl font-black text-white">
              {complete ? "Level complete" : "Try again"}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              {complete
                ? `You collected every ${spec.collectibles.name.toLowerCase()} for ${score} points.`
                : `${spec.enemies.name} stopped the run. Tune the game or restart the level.`}
            </p>
            <Button type="button" className="mt-5" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
              Play again
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function RightPanel({ spec }: { spec: GameSpec }) {
  const codeSample = createGameCode(spec);

  return (
    <Panel className="flex min-h-[620px] min-w-0 flex-col overflow-hidden p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Project files</p>
          <h2 className="mt-1 font-black text-white">Generated configuration</h2>
        </div>
        <Badge tone="violet">
          <Code2 className="mr-1 h-3.5 w-3.5" />
          Phaser-style
        </Badge>
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2">
        <SpecStat label="Enemies" value={spec.enemies.count} />
        <SpecStat label="Items" value={spec.collectibles.count} />
        <SpecStat label="Health" value={spec.player.health} />
      </div>

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-rows-[0.75fr_1.25fr] xl:grid-rows-[250px_minmax(0,1fr)]">
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
                  index === 0
                    ? "bg-teal-300/10 text-teal-100"
                    : "text-slate-400 hover:bg-white/[0.04]",
                )}
              >
                {file.endsWith(".json") ? <Package className="h-4 w-4" /> : <FileCode2 className="h-4 w-4" />}
                <span className="min-w-0 truncate">{file}</span>
                {index === 0 ? <ChevronRight className="ml-auto h-4 w-4" /> : null}
              </div>
            ))}
          </div>
        </div>

        <div className="code-scroll min-h-[300px] overflow-auto rounded-lg border border-white/10 bg-[#050914] p-4">
          <div className="mb-4 flex items-center gap-2 text-xs font-black uppercase text-slate-500">
            <Box className="h-3.5 w-3.5" />
            src/game/{spec.player.name.replace(/\s+/g, "")}.ts
          </div>
          <pre className="text-xs leading-6 text-slate-300">
            <code>{codeSample}</code>
          </pre>
        </div>
      </div>
    </Panel>
  );
}

function SpecStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-2 text-center">
      <p className="text-lg font-black text-white">{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
    </div>
  );
}
