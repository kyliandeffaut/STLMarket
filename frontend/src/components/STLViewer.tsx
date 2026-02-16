import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

type Props = {
  src?: string;
  autoRotate?: boolean;
  interactive?: boolean; // ✅ NOUVEAU : Option pour activer/désactiver l'interaction
};

export default function STLViewer({ src, autoRotate = true, interactive = true }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current || !src) return;

    setLoading(true);
    setError(null);

    const container = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0b0e14"); // Fond sombre

    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      2000
    );

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7); // Lumière directionnelle pour mieux voir les reliefs
    scene.add(dirLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // ✅ LOGIQUE D'INTERACTION
    if (interactive) {
      // Mode Page Produit : On active tout
      controls.enabled = true;
      controls.autoRotate = autoRotate;
      controls.enableZoom = true;
    } else {
      // Mode Catalogue : On fige tout
      controls.enabled = false;
      controls.autoRotate = false;
      controls.enableZoom = false;
      controls.enableRotate = false;
      controls.enablePan = false;
    }

    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    const loader = new STLLoader();
    (loader as any).crossOrigin = "anonymous";

    loader.load(
      src,
      (geometry) => {
        setLoading(false);
        geometry.rotateX(-Math.PI / 2);
        geometry.center();

        const material = new THREE.MeshStandardMaterial({
          color: 0x60a5fa,
          metalness: 0.5,
          roughness: 0.2,
        });

        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        // Cadrage de la caméra
        geometry.computeBoundingSphere();
        const radius = geometry.boundingSphere?.radius || 50;
        // On recule un peu plus la caméra si c'est interactif pour avoir de l'espace
        const dist = interactive ? radius * 2 : radius * 1.7; 
        camera.position.set(dist, dist, dist);
        
        controls.target.set(0, 0, 0);
        controls.update();
      },
      undefined,
      (err) => {
        setLoading(false);
        setError("Erreur"); // Message court pour le catalogue
        console.error("ERREUR STL :", err);
      }
    );

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      // On met à jour les contrôles seulement si c'est interactif ou si ça tourne
      if (interactive || autoRotate) controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      controls.dispose();
    };
  }, [src, autoRotate, interactive]);

  return (
    <div style={{ width: "100%", height: "100%", minHeight: "100%", position: "relative" }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
      {loading && <div style={msgStyle}>Chargement...</div>}
      {error && <div style={{ ...msgStyle, color: "#ff4444" }}>{error}</div>}
    </div>
  );
}

const msgStyle: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  fontSize: "12px",
  color: "rgba(255,255,255,0.6)",
};