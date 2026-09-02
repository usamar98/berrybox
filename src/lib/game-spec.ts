import { z } from "zod";

export const GameSpecSchema = z.object({
  title: z.string().min(2).max(48),
  summary: z.string().min(12).max(180),
  theme: z.enum(["forest", "desert", "space", "ice", "neon"]),
  goal: z.string().min(8).max(120),
  player: z.object({
    name: z.string().min(1).max(24),
    speed: z.number().int().min(120).max(320),
    health: z.number().int().min(1).max(5),
    color: z.enum(["teal", "coral", "violet", "amber"]),
  }),
  enemies: z.object({
    name: z.string().min(1).max(24),
    count: z.number().int().min(1).max(8),
    speed: z.number().int().min(40).max(180),
    behavior: z.enum(["patrol", "chase", "guard"]),
  }),
  collectibles: z.object({
    name: z.string().min(1).max(24),
    count: z.number().int().min(3).max(15),
    pointsEach: z.number().int().min(5).max(100),
  }),
});

export type GameSpec = z.infer<typeof GameSpecSchema>;

export const defaultGameSpec: GameSpec = {
  title: "Forest Knight RPG",
  summary: "Guide a brave knight through an enchanted clearing while avoiding slimes and collecting sun coins.",
  theme: "forest",
  goal: "Collect every sun coin without losing all your health.",
  player: {
    name: "Knight",
    speed: 200,
    health: 3,
    color: "teal",
  },
  enemies: {
    name: "Slime",
    count: 3,
    speed: 80,
    behavior: "patrol",
  },
  collectibles: {
    name: "Sun coin",
    count: 7,
    pointsEach: 20,
  },
};

export function createGameCode(spec: GameSpec) {
  const className = spec.title.replace(/[^a-zA-Z0-9]/g, "") || "BerryBoxGame";

  return `import Phaser from "phaser";

export class ${className} extends Phaser.Scene {
  score = 0;

  create() {
    this.player = this.physics.add.sprite(120, 140, "${spec.player.name.toLowerCase()}");
    this.player.setData("speed", ${spec.player.speed});
    this.player.setData("health", ${spec.player.health});

    this.collectibles = this.physics.add.group({
      key: "${spec.collectibles.name.toLowerCase()}",
      repeat: ${spec.collectibles.count - 1},
    });
    this.enemies = this.physics.add.group({
      key: "${spec.enemies.name.toLowerCase()}",
      repeat: ${spec.enemies.count - 1},
    });

    this.physics.add.overlap(this.player, this.collectibles, collectItem);
    this.physics.add.collider(this.player, this.enemies, damagePlayer);
  }

  update() {
    moveWithArrowKeys(this.player, ${spec.player.speed});
    runBehavior(this.enemies, "${spec.enemies.behavior}", ${spec.enemies.speed});
  }
}`;
}

export function getGameAssets(spec: GameSpec) {
  return [
    `${spec.player.name.toLowerCase().replace(/\s+/g, "-")}.png`,
    `${spec.theme}-background.png`,
    `${spec.collectibles.name.toLowerCase().replace(/\s+/g, "-")}.png`,
    `${spec.enemies.name.toLowerCase().replace(/\s+/g, "-")}.png`,
    "game-ui.png",
  ];
}

const numberWords: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  thirteen: 13,
  fourteen: 14,
  fifteen: 15,
};

function findCount(prompt: string, nouns: string[], fallback: number) {
  const nounPattern = nouns.join("|");
  const match = prompt.match(
    new RegExp(`\\b(\\d+|${Object.keys(numberWords).join("|")})\\s+(?:\\w+\\s+){0,2}(?:${nounPattern})\\b`, "i"),
  );
  if (!match) return fallback;

  const value = Number.parseInt(match[1], 10);
  return Number.isNaN(value) ? numberWords[match[1].toLowerCase()] ?? fallback : value;
}

export function createLocalGameSpec(prompt: string, currentSpec?: GameSpec): GameSpec {
  const lower = prompt.toLowerCase();
  const base = currentSpec ?? defaultGameSpec;
  const theme = lower.includes("neon")
    ? "neon"
    : lower.includes("space") || lower.includes("galaxy")
      ? "space"
      : lower.includes("desert") || lower.includes("sand")
        ? "desert"
        : lower.includes("ice") || lower.includes("snow")
          ? "ice"
          : lower.includes("forest") || lower.includes("jungle")
            ? "forest"
            : base.theme;

  const enemyCount = Math.max(
    1,
    Math.min(8, findCount(lower, ["enemies", "enemy", "monsters", "monster"], base.enemies.count)),
  );
  const collectibleCount = Math.max(
    3,
    Math.min(15, findCount(lower, ["coins", "coin", "gems", "gem", "collectibles"], base.collectibles.count)),
  );
  const enemyName = lower.includes("shadow")
    ? "Shadow"
    : lower.includes("robot")
      ? "Robot"
      : lower.includes("ghost")
        ? "Ghost"
        : lower.includes("slime")
          ? "Slime"
          : base.enemies.name;
  const collectibleName = lower.includes("gem")
    ? "Gem"
    : lower.includes("star")
      ? "Star"
      : lower.includes("crystal")
        ? "Crystal"
        : base.collectibles.name;

  let playerSpeed = base.player.speed;
  if (/\b(make me|player).{0,18}\b(fast|faster|quick)/.test(lower)) playerSpeed += 50;
  if (/\b(make me|player).{0,18}\b(slow|slower)/.test(lower)) playerSpeed -= 40;

  let enemySpeed = base.enemies.speed;
  if (/\b(fast|faster|quick)\s+\w*\s*(enemies|enemy|monsters|monster)/.test(lower)) enemySpeed += 35;
  if (/\b(slow|slower)\s+\w*\s*(enemies|enemy|monsters|monster)/.test(lower)) enemySpeed -= 30;

  const themeName = theme.charAt(0).toUpperCase() + theme.slice(1);
  const title = currentSpec ? base.title : `${themeName} Relic Quest`;

  return GameSpecSchema.parse({
    ...base,
    title,
    summary: `Guide ${base.player.name} through a ${theme} arena, avoid ${enemyCount} ${enemyName.toLowerCase()} enemies, and collect every ${collectibleName.toLowerCase()}.`,
    theme,
    goal: `Collect all ${collectibleCount} ${collectibleName.toLowerCase()}s without losing all your health.`,
    player: {
      ...base.player,
      speed: Math.max(120, Math.min(320, playerSpeed)),
    },
    enemies: {
      ...base.enemies,
      name: enemyName,
      count: enemyCount,
      speed: Math.max(40, Math.min(180, enemySpeed)),
      behavior: lower.includes("chase")
        ? "chase"
        : lower.includes("guard")
          ? "guard"
          : base.enemies.behavior,
    },
    collectibles: {
      ...base.collectibles,
      name: collectibleName,
      count: collectibleCount,
    },
  });
}
