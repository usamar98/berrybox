"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Expand, Rotate3D, ZoomIn } from "lucide-react";

type ViewerElement = HTMLElement & {
  cameraOrbit: string;
  fieldOfView: string;
  resetTurntableRotation: () => void;
  jumpCameraToGoal: () => void;
};

export function SceneModelViewer({ src, poster, prompt }: { src?: string; poster?: string; prompt?: string }) {
  const viewerRef = useRef<ViewerElement | null>(null);
  const [registered, setRegistered] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const [viewerError, setViewerError] = useState("");

  useEffect(() => {
    let active = true;
    import("@google/model-viewer").then(() => { if (active) setRegistered(true); }).catch(() => {
      if (active) setViewerError("The interactive viewer could not be loaded. You can still download the GLB.");
    });
    return () => { active = false; };
  }, []);

  function resetView() {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.cameraOrbit = "45deg 68deg auto";
    viewer.fieldOfView = "30deg";
    viewer.resetTurntableRotation?.();
    viewer.jumpCameraToGoal?.();
  }

  function zoomIn() {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.fieldOfView = "22deg";
    viewer.jumpCameraToGoal?.();
  }

  return (
    <div className="scene-viewer-shell">
      <div className="scene-viewer-toolbar" aria-label="3D preview controls">
        <span><Box size={14} /> GLB PREVIEW</span>
        <div>
          <button type="button" onClick={() => setAutoRotate((value) => !value)} aria-pressed={autoRotate} disabled={!src}><Rotate3D size={14} /> {autoRotate ? "Stop rotation" : "Auto rotate"}</button>
          <button type="button" onClick={zoomIn} disabled={!src}><ZoomIn size={14} /> Zoom</button>
          <button type="button" onClick={resetView} disabled={!src}><Expand size={14} /> Reset</button>
        </div>
      </div>
      <div className="scene-viewer-stage">
        {src && registered ? (
          <model-viewer
            ref={(node) => { viewerRef.current = node as ViewerElement | null; }}
            src={src}
            poster={poster}
            alt={`Interactive 3D preview for: ${prompt || "generated scene"}`}
            camera-controls
            auto-rotate={autoRotate || undefined}
            rotation-per-second="18deg"
            shadow-intensity="1.2"
            environment-image="neutral"
            exposure="1.05"
            interaction-prompt="auto"
            loading="eager"
          />
        ) : poster ? (
          // The poster is the user's generated thumbnail, not a substitute output.
          <div className="scene-viewer-poster" style={{ backgroundImage: `url(${poster})` }} role="img" aria-label={`Preview image for ${prompt || "generated scene"}`} />
        ) : (
          <div className="scene-viewer-empty">
            <span><Box size={42} /></span>
            <p><b>Your scene will appear here</b><small>Generate a compact diorama, then orbit, zoom, and download the textured GLB.</small></p>
          </div>
        )}
        {src && !registered && !viewerError ? <p className="scene-viewer-loading">Loading interactive viewer…</p> : null}
        {viewerError ? <p className="scene-viewer-error" role="alert">{viewerError}</p> : null}
      </div>
    </div>
  );
}
