"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default function ModelViewer({ modelUrl, variant = "template" }: { modelUrl?: string; variant?: "template" | "character" }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const message = messageRef.current;
    if (!host) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0e);
    scene.fog = new THREE.Fog(0x0a0a0e, 12, 30);

    const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 1000);
    camera.position.set(4.4, 3.2, 5.8);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.setAttribute("aria-label", variant === "character" ? "Interactive 3D character viewer" : "Interactive 3D model viewer");
    renderer.domElement.setAttribute("role", "img");
    host.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.minDistance = 0.25;
    controls.maxDistance = 40;

    scene.add(new THREE.HemisphereLight(0xe9e5ff, 0x301522, 2.2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.6);
    keyLight.position.set(4, 7, 5);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xff3974, 4.2);
    rimLight.position.set(-5, 3, -4);
    scene.add(rimLight);
    const grid = new THREE.GridHelper(20, 40, 0x6b253d, 0x242128);
    scene.add(grid);

    let active = true;
    let mixer: THREE.AnimationMixer | undefined;
    const timer = new THREE.Timer();
    if (modelUrl) {
      if (message) message.textContent = "Loading generated GLB…";
      const loader = new GLTFLoader();
      loader.load(modelUrl, (gltf) => {
        if (!active) return;
        const model = gltf.scene;
        scene.add(model);
        const bounds = new THREE.Box3().setFromObject(model);
        const center = bounds.getCenter(new THREE.Vector3());
        const size = bounds.getSize(new THREE.Vector3());
        model.position.sub(center);
        const radius = Math.max(size.x, size.y, size.z, 0.25);
        camera.position.set(radius * 1.45, radius * 0.95, radius * 1.8);
        camera.near = Math.max(radius / 100, 0.01);
        camera.far = Math.max(radius * 100, 100);
        camera.updateProjectionMatrix();
        controls.target.set(0, 0, 0);
        controls.maxDistance = radius * 8;
        controls.update();
        if (gltf.animations.length) {
          mixer = new THREE.AnimationMixer(model);
          mixer.clipAction(gltf.animations[0]).play();
        }
        if (message) message.textContent = gltf.animations.length
          ? "Animation playing · Drag to orbit · Scroll to zoom"
          : "Drag to orbit · Scroll to zoom · Right-drag to pan";
      }, undefined, () => {
        if (active && message) message.textContent = "The GLB could not be loaded. Download it and verify the provider URL has not expired.";
      });
    } else {
      const material = new THREE.MeshStandardMaterial({ color: 0x6f263f, roughness: 0.48, metalness: 0.2 });
      const accent = new THREE.MeshStandardMaterial({ color: 0xf04d7a, roughness: 0.32, metalness: 0.35 });
      const demo = new THREE.Group();
      if (variant === "character") {
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.44, 32, 24), accent);
        head.position.y = 3.05;
        const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.55, 1.15, 8, 20), material);
        torso.position.y = 1.95;
        const hips = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.42, 0.58), accent);
        hips.position.y = 1.12;
        const limbGeometry = new THREE.CapsuleGeometry(0.16, 1.05, 6, 14);
        const leftArm = new THREE.Mesh(limbGeometry, material);
        leftArm.position.set(-0.82, 2.03, 0);
        leftArm.rotation.z = -0.18;
        const rightArm = leftArm.clone();
        rightArm.position.x = 0.82;
        rightArm.rotation.z = 0.18;
        const leftLeg = new THREE.Mesh(limbGeometry, material);
        leftLeg.position.set(-0.3, 0.35, 0);
        const rightLeg = leftLeg.clone();
        rightLeg.position.x = 0.3;
        const halo = new THREE.Mesh(new THREE.TorusGeometry(1.65, 0.025, 8, 64), accent);
        halo.rotation.x = Math.PI / 2;
        halo.position.y = -0.26;
        demo.add(head, torso, hips, leftArm, rightArm, leftLeg, rightLeg, halo);
        controls.target.set(0, 1.45, 0);
        camera.position.set(4.2, 3.1, 6.2);
        if (message) message.textContent = "Your rigged character will appear here · Drag to orbit";
      } else {
        const base = new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.7, 0.38, 8), material);
        base.position.y = 0.19;
        const arch = new THREE.Mesh(new THREE.TorusGeometry(1.12, 0.22, 16, 64, Math.PI), accent);
        arch.rotation.z = Math.PI / 2;
        arch.position.y = 1.2;
        const left = new THREE.Mesh(new THREE.BoxGeometry(0.44, 1.7, 0.48), material);
        left.position.set(-1.1, 0.95, 0);
        const right = left.clone();
        right.position.x = 1.1;
        demo.add(base, arch, left, right);
        controls.target.set(0, 0.8, 0);
        if (message) message.textContent = "Generated GLB models appear here · Drag to test the viewer";
      }
      scene.add(demo);
    }

    const resize = () => {
      const width = Math.max(host.clientWidth, 1);
      const height = Math.max(host.clientHeight, 1);
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    renderer.setAnimationLoop((timestamp) => {
      timer.update(timestamp);
      mixer?.update(timer.getDelta());
      controls.update();
      renderer.render(scene, camera);
    });

    return () => {
      active = false;
      observer.disconnect();
      renderer.setAnimationLoop(null);
      controls.dispose();
      scene.traverse((object) => {
        if (!(object instanceof THREE.Mesh)) return;
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach((material) => {
          Object.values(material).forEach((value) => { if (value instanceof THREE.Texture) value.dispose(); });
          material.dispose();
        });
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [modelUrl, variant]);

  return (
    <div className="bb-model-viewer">
      <div ref={hostRef} className="bb-model-canvas" />
      <p ref={messageRef} className="bb-model-help">Preparing 3D viewer…</p>
      <div className="bb-model-axis" aria-hidden="true"><b>Y</b><span>X</span><i>Z</i></div>
    </div>
  );
}
