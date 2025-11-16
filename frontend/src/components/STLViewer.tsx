// src/components/STLViewer.tsx
import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

type Props = {
  src?: string;             // ex: "/files/1.stl"
  autoRotate?: boolean;     // rotation douce auto
  background?: string;      // couleur fond
  showGround?: boolean;     // afficher le sol (true par défaut)
  wireframe?: boolean;      // mode fil de fer
  aspectRatio?: number;     // ratio largeur/hauteur si tu veux forcer (ex: 16/10)
};

export default function STLViewer({
  src,
  autoRotate = true,
  background = "#0e1220",
  showGround = true,
  wireframe = false,
  aspectRatio, // si non fourni, on prend la taille réelle du parent
}: Props) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const groundRef = useRef<THREE.Mesh | null>(null);
  const animRef = useRef<number | null>(null);
  const resizeObsRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const container = mountRef.current!;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(background);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Caméra
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 5000);
    camera.position.set(140, 120, 140);

    // Contrôles
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.2;
    controlsRef.current = controls;

    // Lumières
    const hemi = new THREE.HemisphereLight(0xffffff, 0x222233, 0.9);
    scene.add(hemi);
    const dir = new THREE.DirectionalLight(0xffffff, 0.9);
    dir.position.set(100, 150, 100);
    dir.castShadow = true;
    scene.add(dir);

    // Sol (facultatif)
    if (showGround) {
      const ground = new THREE.Mesh(
        new THREE.CircleGeometry(200, 64),
        new THREE.MeshStandardMaterial({
          color: 0x111620,
          metalness: 0.1,
          roughness: 0.9,
        })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      scene.add(ground);
      groundRef.current = ground;
    }

    // === CHARGEMENT STL ===
    const loader = new STLLoader();

    const addMeshToScene = (geom: THREE.BufferGeometry) => {
      // Calcul des dimensions
      geom.computeBoundingBox();
      geom.computeBoundingSphere();

      const box = geom.boundingBox!;
      const sphere = geom.boundingSphere!;

      // Recentrage géométrique
      const center = new THREE.Vector3();
      box.getCenter(center);
      geom.translate(-center.x, -center.y, -center.z);

      // Création du mesh
      const material = new THREE.MeshStandardMaterial({
        color: 0x89b9ff,
        metalness: 0.15,
        roughness: 0.35,
        wireframe,
      });
      const mesh = new THREE.Mesh(geom, material);
      mesh.castShadow = true;

      // Mise à l’échelle uniforme
      const radius = Math.max(sphere.radius, 1e-6);
      const target = 80; // taille visuelle
      const scale = target / radius;
      mesh.scale.setScalar(scale);

      scene.add(mesh);

      // Ajustement du sol
      if (showGround && groundRef.current) {
        const minY = box.min.y * scale;
        groundRef.current.position.y = minY - 2;
        groundRef.current.scale.setScalar(Math.max(target * 3, 200));
      }

      // Caméra / contrôles
      const dist = target * 2.6;
      camera.position.set(dist, dist * 0.85, dist);
      camera.near = Math.max(target / 500, 0.05);
      camera.far = target * 50;
      camera.updateProjectionMatrix();
      controls.target.set(0, 0, 0);
      controls.maxDistance = target * 10;
      controls.update();
    };

    const onError = () => {
      // Fallback : torus knot si le STL échoue
      const g = new THREE.TorusKnotGeometry(20, 6, 150, 16);
      addMeshToScene(g);
    };

    if (src) loader.load(src, addMeshToScene, undefined, onError);
    else onError();

    // === Rendu continu ===
    const tick = () => {
      animRef.current = requestAnimationFrame(tick);
      controls.update();
      renderer.render(scene, camera);
    };

    // === Resize responsive ===
    const applySize = (w: number, h: number) => {
      if (aspectRatio && aspectRatio > 0) h = Math.round(w / aspectRatio);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      const cr = entry.contentRect;
      applySize(Math.floor(cr.width), Math.floor(cr.height));
    });
    ro.observe(container);
    resizeObsRef.current = ro;

    // Premier sizing
    const rect = container.getBoundingClientRect();
    applySize(rect.width, rect.height);

    tick();

    // Cleanup
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      resizeObsRef.current?.disconnect();
      controls.dispose();
      renderer.dispose();
      scene.traverse((obj) => {
        if ((obj as any).isMesh) {
          const m = obj as THREE.Mesh;
          m.geometry?.dispose();
          if (Array.isArray(m.material))
            m.material.forEach((mat) => mat.dispose());
          else (m.material as THREE.Material)?.dispose();
        }
      });
      container.innerHTML = "";
    };
  }, [src, autoRotate, background, showGround, wireframe, aspectRatio]);

  return (
    <div
      ref={mountRef}
      className="card"
      style={{
        width: "100%",
        height: "clamp(320px, 45vh, 560px)",
        overflow: "hidden",
        borderRadius: "var(--radius)",
        padding: 0,
      }}
    />
  );
}
