"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Expand, Move3D, Rotate3D, ZoomIn, ZoomOut } from "lucide-react";

type ViewerElement = HTMLElement & {
  autoRotate: boolean;
  cameraOrbit: string;
  fieldOfView: string;
  resetTurntableRotation: (theta?: number) => void;
  jumpCameraToGoal: () => void;
  updateFraming: () => void;
  zoom: (keyPresses: number) => void;
};

export function SceneModelViewer({ src, poster, prompt }: { src?: string; poster?: string; prompt?: string }) {
  const viewerRef = useRef<ViewerElement | null>(null);
  const [registered, setRegistered] = useState(false);
  const [loadedSrc, setLoadedSrc] = useState<string>();
  const [autoRotate, setAutoRotate] = useState(true);
  const [viewerFailure, setViewerFailure] = useState<{ src?: string; message: string }>();

  useEffect(() => {
    let active = true;
    import("@google/model-viewer").then(() => { if (active) setRegistered(true); }).catch(() => {
      if (active) setViewerFailure({ message: "The interactive viewer could not be loaded. You can still download the GLB." });
    });
    return () => { active = false; };
  }, []);

  const viewerError = viewerFailure && (!viewerFailure.src || viewerFailure.src === src) ? viewerFailure.message : "";
  const controlsReady = Boolean(src && registered && loadedSrc === src);

  function toggleAutoRotate() {
    setAutoRotate((current) => {
      const next = !current;
      if (viewerRef.current) viewerRef.current.autoRotate = next;
      return next;
    });
  }

  function resetView() {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.updateFraming();
    viewer.cameraOrbit = "0deg 75deg 105%";
    viewer.fieldOfView = "auto";
    viewer.resetTurntableRotation(0);
    viewer.jumpCameraToGoal();
    viewer.autoRotate = true;
    setAutoRotate(true);
  }

  function zoom(amount: number) {
    const viewer = viewerRef.current;
    if (!viewer) return;
    viewer.zoom(amount);
    viewer.jumpCameraToGoal();
  }

  return (
    <div className="scene-viewer-shell">
      <div className="scene-viewer-toolbar" aria-label="3D preview controls">
        <span><Box size={14} /> GLB PREVIEW</span>
        <div>
          <button className={autoRotate && controlsReady ? "active" : undefined} type="button" onClick={toggleAutoRotate} aria-pressed={autoRotate} disabled={!controlsReady}><Rotate3D size={14} /> {autoRotate ? "Pause 360°" : "Auto 360°"}</button>
          <button type="button" onClick={() => zoom(2)} disabled={!controlsReady}><ZoomIn size={14} /> Zoom in</button>
          <button type="button" onClick={() => zoom(-2)} disabled={!controlsReady}><ZoomOut size={14} /> Zoom out</button>
          <button type="button" onClick={resetView} disabled={!controlsReady}><Expand size={14} /> Reset</button>
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
            auto-rotate-delay="300"
            rotation-per-second="32deg"
            shadow-intensity="1.2"
            environment-image="neutral"
            exposure="1.05"
            interaction-prompt="auto"
            interaction-prompt-style="wiggle"
            interaction-prompt-threshold="1200"
            loading="eager"
            onLoad={() => {
              setLoadedSrc(src);
              setViewerFailure(undefined);
            }}
            onError={() => {
              setLoadedSrc(undefined);
              setViewerFailure({ src, message: "The generated GLB could not be rendered. You can still download the model." });
            }}
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
        {src && registered && loadedSrc !== src && !viewerError ? <p className="scene-viewer-loading">Loading the 3D model…</p> : null}
        {controlsReady ? <div className="scene-viewer-live"><span /> LIVE 3D</div> : null}
        {controlsReady ? <div className="scene-viewer-help"><Move3D size={13} /> Drag to rotate · scroll or pinch to zoom</div> : null}
        {viewerError ? <p className="scene-viewer-error" role="alert">{viewerError}</p> : null}
      </div>
    </div>
  );
}
