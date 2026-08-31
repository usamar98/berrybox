import * as THREE from "three";
import type { GameConfig } from "./config";
import { createWorld, portal, stepWorld, type Controls, type World } from "./world";

export type PlayStats = { collected: number; health: number; seconds: number; status: World["status"] };
export function mountWorld(
  host: HTMLDivElement, config: GameConfig,
  getControls: () => Controls, isRunning: () => boolean,
  onStats: (stats: PlayStats) => void, onFailure: () => void,
) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.setAttribute("aria-label", "Playable 3D world");
  host.appendChild(renderer.domElement);
  const scene = new THREE.Scene();
  const palette = config.theme === "forest"
    ? { sky: "#101d23", ground: "#34524a", side: "#243a37", accent: "#a4efd4", tree: "#41796b" }
    : config.theme === "desert"
      ? { sky: "#2a2029", ground: "#aa7659", side: "#654937", accent: "#ffcf88", tree: "#d7a873" }
      : { sky: "#151329", ground: "#34314f", side: "#252238", accent: "#d5a6f7", tree: "#706197" };
  scene.background = new THREE.Color(palette.sky);
  scene.fog = new THREE.Fog(palette.sky, 38, 85);
  const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 150);
  camera.position.set(16, 26, 29);
  camera.lookAt(0, 0, 0);
  scene.add(new THREE.HemisphereLight("#e6e9ff", "#33323a", 2.8));
  const sunlight = new THREE.DirectionalLight("#fff0d6", 3);
  sunlight.position.set(-10, 22, 12);
  sunlight.castShadow = true;
  sunlight.shadow.mapSize.set(1024, 1024);
  Object.assign(sunlight.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20 });
  sunlight.shadow.bias = -0.001;
  scene.add(sunlight);
  const materials = new Map<string, THREE.MeshStandardMaterial>();
  function material(color: string) {
    if (!materials.has(color)) materials.set(color, new THREE.MeshStandardMaterial({ color, roughness: 0.72 }));
    return materials.get(color)!;
  }
  function mesh(geometry: THREE.BufferGeometry, color: string, x: number, y: number, z: number, parent: THREE.Object3D = scene) {
    const object = new THREE.Mesh(geometry, material(color));
    object.position.set(x, y, z);
    object.castShadow = true;
    object.receiveShadow = true;
    parent.add(object);
    return object;
  }
  const world = createWorld(config);
  const width = config.template === "runner" ? 12 : 25;
  mesh(new THREE.BoxGeometry(width, 1.2, 29), palette.side, 0, -0.8, 0);
  mesh(new THREE.BoxGeometry(width, 0.2, 29), palette.ground, 0, -0.1, 0);
  const grid = new THREE.GridHelper(28, 28, palette.accent, palette.accent);
  grid.position.y = 0.015;
  grid.scale.x = width / 28;
  const gridMaterial = grid.material as THREE.Material;
  gridMaterial.transparent = true;
  gridMaterial.opacity = 0.08;
  scene.add(grid);
  // Decorative scenery stays outside the playable bounds.
  for (let index = 0; index < 12; index++) {
    const x = (index % 2 ? 1 : -1) * (width / 2 + 1.3);
    const z = -12 + Math.floor(index / 2) * 4.6;
    mesh(new THREE.CylinderGeometry(.18, .25, 1.5, 6), "#56483f", x, .75, z);
    mesh(new THREE.ConeGeometry(1.1, 2.5, config.theme === "neon" ? 4 : 6), palette.tree, x, 2.4, z);
  }
  world.barriers.forEach((barrier) => {
    mesh(new THREE.BoxGeometry(barrier.width, .85, .6), "#bc809b", barrier.x, .425, barrier.z);
    mesh(new THREE.BoxGeometry(barrier.width, .08, .64), "#f6c1d6", barrier.x, .88, barrier.z);
  });
  if (config.template === "runner") {
    const gate = mesh(new THREE.TorusGeometry(1.25, .17, 8, 32), palette.accent, portal.x, 1.4, portal.z);
    gate.rotation.y = 0;
    mesh(new THREE.CylinderGeometry(1.7, 1.7, .1, 32), palette.tree, portal.x, .05, portal.z);
  }
  const colors = { mint: "#9ce8ca", rose: "#ecacc4", violet: "#b5a0f0", gold: "#f5ce88" };
  const player = new THREE.Group();
  const playerColor = colors[config.playerColor];
  mesh(new THREE.BoxGeometry(.65, .7, .5), playerColor, 0, .65, 0, player);
  mesh(new THREE.BoxGeometry(.58, .55, .54), "#f0d1b9", 0, 1.27, 0, player);
  mesh(new THREE.BoxGeometry(.64, .16, .6), playerColor, 0, 1.57, 0, player);
  [-.16, .16].forEach((x) => {
    mesh(new THREE.BoxGeometry(.1, .09, .05), "#23303a", x, 1.3, .29, player);
    mesh(new THREE.BoxGeometry(.23, .25, .36), "#25343b", x, .17, .05, player);
  });
  scene.add(player);
  const crystals = world.crystals.map((crystal) =>
    mesh(new THREE.OctahedronGeometry(.48), palette.accent, crystal.x, 1, crystal.z));
  const enemies = world.enemies.map((enemy) => {
    const group = new THREE.Group();
    mesh(new THREE.IcosahedronGeometry(.6, 1), "#a876a9", 0, .7, 0, group);
    mesh(new THREE.BoxGeometry(.5, .12, .13), "#f7d6e4", 0, .85, .5, group);
    group.position.set(enemy.x, 0, enemy.z);
    scene.add(group);
    return group;
  });
  function resize() {
    const { width: hostWidth, height: hostHeight } = host.getBoundingClientRect();
    renderer.setSize(Math.max(1, hostWidth), Math.max(1, hostHeight));
    camera.aspect = hostWidth / Math.max(1, hostHeight);
    // Keep the full world visible on narrow/mobile screens too.
    camera.fov = camera.aspect < 1 ? 65 : 48;
    camera.updateProjectionMatrix();
  }
  const observer = new ResizeObserver(resize);
  observer.observe(host);
  resize();
  let previous = 0;
  let previousStats = "";
  function frame(time: number) {
    const delta = previous ? (time - previous) / 1000 : 0;
    previous = time;
    if (isRunning()) stepWorld(world, config, getControls(), delta);
    player.position.set(world.player.x, world.player.y, world.player.z);
    const controls = getControls();
    if (isRunning() && (controls.x || controls.z)) player.rotation.y = Math.atan2(controls.x, controls.z);
    player.visible = !(world.invulnerable > 0 && Math.floor(time / 120) % 2);
    crystals.forEach((crystal, index) => {
      crystal.visible = !world.crystals[index].collected;
      crystal.rotation.y = world.elapsed + index;
      crystal.position.y = 1 + Math.sin(world.elapsed * 2 + index) * .13;
    });
    enemies.forEach((enemy, index) => {
      enemy.position.set(world.enemies[index].x, Math.sin(world.elapsed * 3 + index) * .1, world.enemies[index].z);
    });
    const stats: PlayStats = {
      collected: world.crystals.filter((crystal) => crystal.collected).length,
      health: world.health, seconds: Math.max(0, Math.ceil(config.timeLimit - world.elapsed)), status: world.status,
    };
    const encoded = JSON.stringify(stats);
    if (encoded !== previousStats) { onStats(stats); previousStats = encoded; }
    renderer.render(scene, camera);
  }
  const lost = (event: Event) => { event.preventDefault(); onFailure(); };
  renderer.domElement.addEventListener("webglcontextlost", lost);
  renderer.setAnimationLoop(frame);
  return () => {
    renderer.setAnimationLoop(null);
    observer.disconnect();
    renderer.domElement.removeEventListener("webglcontextlost", lost);
    const geometries = new Set<THREE.BufferGeometry>();
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) geometries.add(object.geometry);
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((entry) => entry.dispose());
    gridMaterial.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  };
}
