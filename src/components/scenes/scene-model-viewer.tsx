"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Expand, Move3D, Rotate3D, ZoomIn, ZoomOut } from "lucide-react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { KTX2Loader } from "three/examples/jsm/loaders/KTX2Loader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";

type ViewerRuntime = {
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  renderer: THREE.WebGLRenderer;
};

class ModelLoadError extends Error {
  constructor(public readonly viewerMessage: string, cause?: unknown) {
    super(viewerMessage, { cause });
    this.name = "ModelLoadError";
  }
}

function validateGlbBuffer(buffer: ArrayBuffer) {
  if (buffer.byteLength < 20) {
    throw new ModelLoadError("The downloaded 3D file is incomplete. Generate the scene again or download the GLB to inspect it.");
  }

  const header = new DataView(buffer);
  const magic = header.getUint32(0, true);
  const version = header.getUint32(4, true);
  const declaredLength = header.getUint32(8, true);
  if (magic !== 0x46546c67 || version !== 2) {
    throw new ModelLoadError("The model endpoint did not return a valid GLB file. Generate the scene again.");
  }
  if (declaredLength !== buffer.byteLength) {
    throw new ModelLoadError("The 3D file was cut off while downloading. Retry the 3D view.");
  }

  let offset = 12;
  let chunkIndex = 0;
  while (offset < buffer.byteLength) {
    if (offset + 8 > buffer.byteLength) {
      throw new ModelLoadError("The downloaded GLB has a damaged chunk table. Generate the scene again.");
    }
    const chunkLength = header.getUint32(offset, true);
    const chunkType = header.getUint32(offset + 4, true);
    if (chunkIndex === 0 && chunkType !== 0x4e4f534a) {
      throw new ModelLoadError("The downloaded GLB is missing its scene data. Generate the scene again.");
    }
    offset += 8 + chunkLength;
    if (offset > buffer.byteLength) {
      throw new ModelLoadError("The downloaded GLB contains an incomplete data chunk. Retry the 3D view.");
    }
    chunkIndex += 1;
  }
  if (offset !== buffer.byteLength || chunkIndex === 0) {
    throw new ModelLoadError("The downloaded GLB is incomplete. Generate the scene again.");
  }
}

async function downloadModel(src: string, signal: AbortSignal) {
  const response = await fetch(src, {
    cache: "no-store",
    credentials: "same-origin",
    headers: { Accept: "model/gltf-binary, application/octet-stream;q=0.9" },
    signal,
  });
  if (!response.ok) {
    const message = response.status === 404
      ? "The saved 3D file is unavailable. Generate the scene again to create a fresh model."
      : `The 3D file could not be downloaded (HTTP ${response.status}). Retry the 3D view.`;
    throw new ModelLoadError(message);
  }
  const buffer = await response.arrayBuffer();
  validateGlbBuffer(buffer);
  return buffer;
}

function disposeModel(root: THREE.Object3D) {
  root.traverse((object) => {
    const mesh = object as THREE.Mesh;
    mesh.geometry?.dispose();
    const materials = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
    for (const material of materials) {
      for (const value of Object.values(material)) {
        if (value instanceof THREE.Texture) value.dispose();
      }
      material.dispose();
    }
  });
}

function frameModel(root: THREE.Object3D, camera: THREE.PerspectiveCamera, controls: OrbitControls) {
  root.updateMatrixWorld(true);
  const bounds = new THREE.Box3().setFromObject(root);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const largestSide = Math.max(size.x, size.y, size.z);
  if (!Number.isFinite(largestSide) || largestSide <= 0) throw new Error("The GLB contains no visible scene geometry.");

  root.position.sub(center);
  root.updateMatrixWorld(true);

  const distance = (largestSide / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)))) * 1.45;
  camera.near = Math.max(distance / 100, 0.01);
  camera.far = Math.max(distance * 100, 100);
  camera.position.set(distance * 0.72, distance * 0.42, distance);
  camera.updateProjectionMatrix();

  controls.target.set(0, 0, 0);
  controls.minDistance = Math.max(distance * 0.18, 0.02);
  controls.maxDistance = distance * 6;
  controls.update();
  controls.saveState();
}

export function SceneModelViewer({ src, poster, prompt }: { src?: string; poster?: string; prompt?: string }) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const runtimeRef = useRef<ViewerRuntime | null>(null);
  const autoRotateRef = useRef(true);
  const [loadedSrc, setLoadedSrc] = useState<string>();
  const [autoRotate, setAutoRotate] = useState(true);
  const [viewerFailure, setViewerFailure] = useState<{ src?: string; message: string }>();
  const [reload, setReload] = useState<{ src?: string; attempt: number }>({ attempt: 0 });

  const reloadAttempt = reload.src === src ? reload.attempt : 0;
  const modelSrc = src ? `${src}${src.includes("?") ? "&" : "?"}threeAttempt=${reloadAttempt}` : undefined;

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !modelSrc || !src) return;

    let disposed = false;
    let loadedModel: THREE.Object3D | undefined;
    let renderer: THREE.WebGLRenderer;
    const modelRequest = new AbortController();
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 1_000);

    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch (error) {
      console.error("WebGL renderer could not start", error);
      const frame = window.requestAnimationFrame(() => {
        setViewerFailure({ src: modelSrc, message: "WebGL is unavailable in this browser. Enable hardware acceleration or download the GLB." });
      });
      return () => window.cancelAnimationFrame(frame);
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    host.replaceChildren(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.065;
    controls.enablePan = true;
    controls.screenSpacePanning = true;
    controls.autoRotate = autoRotateRef.current;
    controls.autoRotateSpeed = 1.65;
    controls.zoomSpeed = 0.85;
    controls.rotateSpeed = 0.72;
    controls.panSpeed = 0.65;
    runtimeRef.current = { camera, controls, renderer };

    scene.add(new THREE.HemisphereLight(0xeaf2ff, 0x2a1d2b, 2.5));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.2);
    keyLight.position.set(4, 7, 6);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xff8eb1, 1.35);
    fillLight.position.set(-5, 2, -3);
    scene.add(fillLight);

    const resize = () => {
      const width = Math.max(1, host.clientWidth);
      const height = Math.max(1, host.clientHeight);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    renderer.setAnimationLoop(() => {
      controls.update();
      renderer.render(scene, camera);
    });

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath("/model-viewer/draco/");
    dracoLoader.setDecoderConfig({ type: "wasm" });
    const ktx2Loader = new KTX2Loader();
    ktx2Loader.setTranscoderPath("/model-viewer/basis/");
    ktx2Loader.detectSupport(renderer);
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);
    loader.setKTX2Loader(ktx2Loader);
    loader.setMeshoptDecoder(MeshoptDecoder);

    const fail = (error: unknown) => {
      if (disposed) return;
      console.error("Three.js GLB load failed", error);
      if (reloadAttempt === 0) {
        setReload({ src, attempt: 1 });
        return;
      }
      const message = error instanceof ModelLoadError
        ? error.viewerMessage
        : "The GLB downloaded successfully but its 3D data could not be decoded. Generate the scene again or download the GLB.";
      setViewerFailure({ src: modelSrc, message });
    };

    const loadModel = async () => {
      try {
        const buffer = await downloadModel(modelSrc, modelRequest.signal);
        const gltf = await loader.parseAsync(buffer, "");
        if (disposed) {
          disposeModel(gltf.scene);
          return;
        }
        loadedModel = gltf.scene;
        frameModel(loadedModel, camera, controls);
        scene.add(loadedModel);
        setLoadedSrc(modelSrc);
        setViewerFailure(undefined);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        if (loadedModel) disposeModel(loadedModel);
        loadedModel = undefined;
        fail(error);
      }
    };
    void loadModel();

    return () => {
      disposed = true;
      modelRequest.abort();
      resizeObserver.disconnect();
      renderer.setAnimationLoop(null);
      controls.dispose();
      dracoLoader.dispose();
      ktx2Loader.dispose();
      if (loadedModel) disposeModel(loadedModel);
      renderer.dispose();
      renderer.domElement.remove();
      if (runtimeRef.current?.renderer === renderer) runtimeRef.current = null;
    };
  }, [modelSrc, reloadAttempt, src]);

  const viewerError = viewerFailure && (!viewerFailure.src || viewerFailure.src === modelSrc) ? viewerFailure.message : "";
  const controlsReady = Boolean(modelSrc && loadedSrc === modelSrc);

  function toggleAutoRotate() {
    setAutoRotate((current) => {
      const next = !current;
      autoRotateRef.current = next;
      if (runtimeRef.current) runtimeRef.current.controls.autoRotate = next;
      return next;
    });
  }

  function resetView() {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    runtime.controls.reset();
    runtime.controls.autoRotate = true;
    autoRotateRef.current = true;
    runtime.controls.update();
    setAutoRotate(true);
  }

  function zoom(inward: boolean) {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    const offset = runtime.camera.position.clone().sub(runtime.controls.target);
    const nextDistance = THREE.MathUtils.clamp(
      offset.length() * (inward ? 0.78 : 1.28),
      runtime.controls.minDistance,
      runtime.controls.maxDistance,
    );
    offset.setLength(nextDistance);
    runtime.camera.position.copy(runtime.controls.target).add(offset);
    runtime.controls.update();
  }

  function retryModel() {
    if (!src) return;
    setViewerFailure(undefined);
    setReload({ src, attempt: reloadAttempt + 1 });
  }

  return (
    <div className="scene-viewer-shell">
      <div className="scene-viewer-toolbar" aria-label="3D preview controls">
        <span><Box size={14} /> THREE.JS LIVE PREVIEW</span>
        <div>
          <button className={autoRotate && controlsReady ? "active" : undefined} type="button" onClick={toggleAutoRotate} aria-pressed={autoRotate} disabled={!controlsReady}><Rotate3D size={14} /> {autoRotate ? "Pause 360°" : "Auto 360°"}</button>
          <button type="button" onClick={() => zoom(true)} disabled={!controlsReady}><ZoomIn size={14} /> Zoom in</button>
          <button type="button" onClick={() => zoom(false)} disabled={!controlsReady}><ZoomOut size={14} /> Zoom out</button>
          <button type="button" onClick={resetView} disabled={!controlsReady}><Expand size={14} /> Reset</button>
        </div>
      </div>
      <div className="scene-viewer-stage">
        {modelSrc ? (
          <div
            className="scene-three-host"
            ref={hostRef}
            role="img"
            aria-label={`Interactive 3D preview for: ${prompt || "generated scene"}`}
            style={poster && !controlsReady ? { backgroundImage: `url(${poster})` } : undefined}
          />
        ) : poster ? (
          <div className="scene-viewer-poster" style={{ backgroundImage: `url(${poster})` }} role="img" aria-label={`Preview image for ${prompt || "generated scene"}`} />
        ) : (
          <div className="scene-viewer-empty">
            <span><Box size={42} /></span>
            <p><b>Your scene will appear here</b><small>Generate a compact diorama, then orbit, zoom, and download the textured GLB.</small></p>
          </div>
        )}
        {modelSrc && loadedSrc !== modelSrc && !viewerError ? <p className="scene-viewer-loading">Loading interactive 3D scene…</p> : null}
        {controlsReady ? <div className="scene-viewer-live"><span /> LIVE 3D</div> : null}
        {controlsReady ? <div className="scene-viewer-help"><Move3D size={13} /> Left-drag to rotate · wheel to zoom · right-drag to pan</div> : null}
        {viewerError ? <div className="scene-viewer-error" role="alert"><span>{viewerError}</span><button type="button" onClick={retryModel}>Retry 3D view</button></div> : null}
      </div>
    </div>
  );
}
