import { cn } from "@/lib/utils";

export function SceneArt({ variant = "explorer", className }: { variant?: "explorer" | "runner" | "character" | "workflow"; className?: string }) {
  return (
    <div aria-hidden="true" className={cn("scene-art", "scene-art-" + variant, className)}>
      <div className="scene-orbit" />
      <div className="scene-platform">
        <span className="scene-tile tile-one" />
        <span className="scene-tile tile-two" />
        <span className="scene-tile tile-three" />
        <span className="scene-tile tile-four" />
      </div>
      {variant === "character" ? (
        <div className="scene-person"><i /><b /><em /><span /></div>
      ) : variant === "workflow" ? (
        <div className="scene-nodes"><i /><i /><i /></div>
      ) : (
        <><div className="scene-crystal crystal-one" /><div className="scene-crystal crystal-two" /><div className="scene-crystal crystal-three" /><div className="scene-player" /></>
      )}
      <div className="scene-caption">{variant === "explorer" ? "WORLD_01 / CRYSTAL GROVE" : variant === "runner" ? "WORLD_02 / NEON RUSH" : variant === "character" ? "CHARACTER / NEXT CHAPTER" : "IDEA → WORLD → RELEASE"}</div>
    </div>
  );
}
