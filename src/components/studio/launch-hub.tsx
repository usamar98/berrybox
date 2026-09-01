import Image from "next/image";
import Link from "next/link";
import {
  Bot,
  Box,
  Boxes,
  ChevronDown,
  ChevronRight,
  CirclePlay,
  Code2,
  Component,
  Crosshair,
  Cuboid,
  Expand,
  Gamepad2,
  Layers3,
  Lightbulb,
  Maximize2,
  MessageSquareText,
  Move3D,
  Package,
  PanelLeftClose,
  Play,
  Plus,
  Redo2,
  Rotate3D,
  Save,
  Search,
  Settings2,
  Sparkles,
  Undo2,
  UserRound,
  Users,
  Volume2,
  WandSparkles,
} from "lucide-react";

const studioTabs = ["World", "Gameplay", "NPCs", "Assets", "UI", "Test"];
const systems = ["Health System", "Inventory System", "Quest System", "Combat System", "AI Behavior"];
const assets = [
  { name: "Tree", image: "/game-cards/forest-courier.svg" },
  { name: "Pines", image: "/game-cards/3d-world-explorer.png" },
  { name: "Boulders", image: "/game-cards/skyforge-isles.svg" },
  { name: "Barrel", image: "/game-cards/2d-rpg-adventure.png" },
  { name: "Campfire", image: "/game-cards/ai-npc-story-game.png" },
  { name: "Crate", image: "/game-cards/puzzle-game.png" },
  { name: "Tent", image: "/game-cards/platformer-game.png" },
  { name: "Workbench", image: "/game-cards/neon-orchard.png" },
];

export function LaunchHub() {
  return (
    <main className="creator-studio">
      <header className="creator-topbar">
        <div className="creator-project">
          <Link href="/templates" aria-label="Back to templates" className="creator-mark">
            <Image src="/berrybox.png" alt="" width={28} height={28} priority />
          </Link>
          <div>
            <strong>Mystic Forest</strong>
            <span><i /> Auto-saved</span>
          </div>
        </div>

        <nav aria-label="Creator studio tools" className="creator-tabs">
          {studioTabs.map((tab) => (
            <button key={tab} type="button" className={tab === "World" ? "is-active" : ""}>
              {tab === "World" ? <Cuboid /> : tab === "Gameplay" ? <Gamepad2 /> : tab === "NPCs" ? <Users /> : tab === "Assets" ? <Package /> : tab === "UI" ? <Component /> : <Code2 />}
              {tab}
            </button>
          ))}
        </nav>

        <div className="creator-actions">
          <button type="button" aria-label="Undo"><Undo2 /></button>
          <button type="button" aria-label="Redo"><Redo2 /></button>
          <button type="button" aria-label="Save project"><Save /></button>
          <button type="button" aria-label="Expand workspace"><Expand /></button>
          <Link href="/play?template=explorer" className="creator-play"><Play /> Play</Link>
          <Link href="/workflow" className="creator-publish">Publish</Link>
        </div>
      </header>

      <div className="creator-layout">
        <aside className="creator-rail" aria-label="Studio navigation">
          <button type="button" className="is-active" aria-label="AI assistant"><Bot /></button>
          <button type="button" aria-label="Scene"><Box /></button>
          <button type="button" aria-label="Assets"><Package /></button>
          <button type="button" aria-label="Characters"><UserRound /></button>
          <button type="button" aria-label="Lighting"><Lightbulb /></button>
          <button type="button" aria-label="Audio"><Volume2 /></button>
          <button type="button" aria-label="Settings"><Settings2 /></button>
        </aside>

        <aside className="creator-assistant">
          <div className="creator-assistant-head">
            <div className="creator-avatar">
              <Image src="/game-cards/ai-npc-story-game.png" alt="Berry AI assistant" fill sizes="44px" />
            </div>
            <div><strong>Berry AI</strong><span><i /> Ready to create</span></div>
            <button type="button" aria-label="Collapse assistant"><PanelLeftClose /></button>
          </div>
          <div className="creator-conversation">
            <div className="creator-message berry"><span>B</span><p>Hi! I&apos;m Berry. What would you like to create or improve today?</p></div>
            <div className="creator-message user"><span>U</span><p>Add a bandit camp in the forest clearing.</p></div>
            <div className="creator-message berry"><span>B</span><p>I&apos;ve added a bandit camp with tents, a campfire, and three enemy NPCs. What should they drop?</p></div>
          </div>
          <div className="creator-suggestions">
            <button type="button"><Plus /> Add Quest</button>
            <button type="button"><Plus /> Add NPC</button>
            <button type="button">Change Environment</button>
            <button type="button">Improve Gameplay</button>
          </div>
          <div className="creator-composer">
            <textarea aria-label="Ask Berry AI" placeholder="Ask Berry AI…" rows={3} />
            <button type="button" aria-label="Generate with AI"><WandSparkles /></button>
          </div>
        </aside>

        <section className="creator-canvas-column" aria-label="World editor">
          <div className="creator-viewport">
            <Image src="/game-cards/3d-world-explorer.png" alt="Mystic Forest game world" fill priority sizes="(max-width: 900px) 100vw, 62vw" />
            <div className="creator-viewport-shade" />
            <div className="creator-view-tools">
              <button type="button" aria-label="Select"><Crosshair /></button>
              <button type="button" aria-label="Move"><Move3D /></button>
              <button type="button" aria-label="Rotate"><Rotate3D /></button>
            </div>
            <div className="creator-view-meta"><span><i /> LIVE SCENE</span><strong>Forest Clearing</strong></div>
            <div className="creator-enemy enemy-one"><span /></div>
            <div className="creator-enemy enemy-two"><span /></div>
            <div className="creator-enemy enemy-three"><span /></div>
            <div className="creator-axis"><i className="axis-y">Y</i><i className="axis-x">X</i><i className="axis-z">Z</i></div>
            <button type="button" className="creator-fullscreen" aria-label="Fullscreen"><Maximize2 /></button>
            <div className="creator-world-status"><span><Sparkles /> AI-built scene</span><span>3 enemies</span><span>12 objects</span></div>
          </div>

          <div className="creator-assets">
            <div className="creator-assets-head">
              <div className="creator-asset-tabs"><button type="button" className="is-active">Assets</button><button type="button">Characters</button><button type="button">Environment</button><button type="button">Props</button><button type="button">Audio</button><button type="button">UI</button><button type="button">My Assets</button></div>
              <label><Search /><input aria-label="Search assets" placeholder="Search assets…" /></label>
            </div>
            <div className="creator-asset-grid">
              {assets.map((asset) => (
                <button type="button" key={asset.name} className="creator-asset-card">
                  <span><Image src={asset.image} alt="" fill sizes="92px" /></span>
                  {asset.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="creator-inspector">
          <div className="creator-inspector-tabs"><button type="button">Code</button><button type="button" className="is-active">Systems</button><button type="button">Properties</button></div>
          <section className="creator-system-panel">
            <div className="creator-panel-title"><span>Game Systems</span><button type="button"><Plus /></button></div>
            {systems.map((system) => <div className="creator-system" key={system}><span>{system}</span><button type="button" aria-label={`${system} enabled`} className="creator-toggle"><i /></button></div>)}
          </section>
          <section className="creator-hierarchy">
            <div className="creator-panel-title"><span>Scene Hierarchy</span><button type="button"><Plus /></button></div>
            <div className="creator-tree"><p><ChevronDown /> World</p><p className="level-one"><ChevronDown /> Forest_Clearing</p><p className="level-two"><ChevronRight /> Bandit_Camp</p><p className="level-two"><ChevronRight /> Trees_01</p><p className="level-two"><ChevronRight /> Tent_02</p><p className="level-two"><ChevronRight /> Campfire</p><p className="level-two"><ChevronRight /> Bandit_01</p><p className="level-two"><ChevronRight /> Bandit_02</p><p className="level-two"><ChevronRight /> Bandit_03</p><p className="level-two"><ChevronRight /> Berry_Player</p></div>
          </section>
          <div className="creator-inspector-footer"><MessageSquareText /><span>Describe changes to Berry AI or select any object to edit its properties.</span></div>
        </aside>
      </div>

      <div className="creator-mobile-bar">
        <Link href="/templates"><Layers3 /> Templates</Link>
        <Link href="/editor"><Sparkles /> AI Builder</Link>
        <Link href="/play?template=explorer"><CirclePlay /> Play</Link>
        <Link href="/workflow"><Boxes /> Publish</Link>
      </div>
    </main>
  );
}
