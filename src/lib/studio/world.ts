import type { GameConfig } from "./config";

export type Point = { x: number; z: number };
export type World = {
  player: Point & { y: number; velocity: number };
  enemies: (Point & { homeX: number; homeZ: number })[];
  crystals: (Point & { collected: boolean })[];
  barriers: (Point & { width: number })[];
  health: number; elapsed: number; invulnerable: number;
  status: "playing" | "won" | "lost";
};
export type Controls = { x: number; z: number; jump: boolean };
export const spawn = { x: 0, z: 11 };
export const portal = { x: 0, z: -12 };

export function createWorld(config: GameConfig): World {
  return {
    player: { ...spawn, y: 0, velocity: 0 },
    crystals: Array.from({ length: config.collectibleCount }, (_, index) => {
      if (config.template === "runner") {
        return { x: index % 2 ? 2.5 : -2.5, z: 8 - index * 18 / Math.max(1, config.collectibleCount - 1), collected: false };
      }
      const angle = index / config.collectibleCount * Math.PI * 2;
      return { x: Math.cos(angle) * 8, z: Math.sin(angle) * 8, collected: false };
    }),
    enemies: Array.from({ length: config.enemyCount }, (_, index) => {
      const x = config.template === "runner" ? (index % 2 ? 3 : -3) : Math.cos(index * 2.4) * 4;
      const z = config.template === "runner" ? 5 - index * 3 : Math.sin(index * 2.4) * 4;
      return { x, z, homeX: x, homeZ: z };
    }),
    barriers: config.template === "runner"
      ? [6, 1, -4, -8].map((z, index) => ({ x: index % 2 ? 1.5 : -1.5, z, width: 6 }))
      : [],
    health: config.health, elapsed: 0, invulnerable: 0, status: "playing",
  };
}

export function stepWorld(world: World, config: GameConfig, controls: Controls, delta: number) {
  if (world.status !== "playing") return;
  const dt = Math.min(Math.max(delta, 0), 0.05);
  world.elapsed += dt;
  world.invulnerable = Math.max(0, world.invulnerable - dt);
  const length = Math.hypot(controls.x, controls.z) || 1;
  const next = {
    x: world.player.x + controls.x / length * config.moveSpeed * dt,
    z: world.player.z + controls.z / length * config.moveSpeed * dt,
  };
  if (controls.jump && world.player.y === 0) world.player.velocity = 7;
  world.player.velocity -= 17 * dt;
  world.player.y = Math.max(0, world.player.y + world.player.velocity * dt);
  if (world.player.y === 0) world.player.velocity = 0;
  const blocked = world.barriers.some((barrier) =>
    Math.abs(next.x - barrier.x) < barrier.width / 2 + 0.35 &&
    Math.abs(next.z - barrier.z) < 0.65 && world.player.y < 0.9);
  if (!blocked) {
    const edge = config.template === "runner" ? 5 : 11;
    world.player.x = Math.max(-edge, Math.min(edge, next.x));
    world.player.z = Math.max(-13, Math.min(13, next.z));
  }
  world.enemies.forEach((enemy, index) => {
    const nearPlayer = Math.hypot(enemy.x - world.player.x, enemy.z - world.player.z) < 5;
    const target = config.behavior === "chase" || (config.behavior === "guard" && nearPlayer)
      ? world.player
      : config.behavior === "guard"
        ? { x: enemy.homeX, z: enemy.homeZ }
        : { x: enemy.homeX + Math.sin(world.elapsed * 0.7 + index) * 2, z: enemy.homeZ + Math.cos(world.elapsed * 0.7 + index) * 2 };
    const distance = Math.hypot(target.x - enemy.x, target.z - enemy.z);
    if (distance > 0.02) {
      const amount = Math.min(distance, config.enemySpeed * dt);
      enemy.x += (target.x - enemy.x) / distance * amount;
      enemy.z += (target.z - enemy.z) / distance * amount;
    }
  });
  world.crystals.forEach((crystal) => {
    if (Math.hypot(crystal.x - world.player.x, crystal.z - world.player.z) < 1 &&
      world.player.y < 2) crystal.collected = true;
  });
  if (world.invulnerable === 0 && world.player.y < 1 &&
    world.enemies.some((enemy) => Math.hypot(enemy.x - world.player.x, enemy.z - world.player.z) < 0.85)) {
    world.health--;
    world.invulnerable = 2;
    Object.assign(world.player, spawn, { y: 0, velocity: 0 });
  }
  if (world.health <= 0 || world.elapsed >= config.timeLimit) {
    world.status = "lost";
  } else if (world.crystals.every((crystal) => crystal.collected) &&
    (config.template !== "runner" || Math.hypot(world.player.x - portal.x, world.player.z - portal.z) < 1.5)) {
    world.status = "won";
  }
}
