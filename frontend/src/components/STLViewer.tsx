import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

type Props = {
  src?: string;
  autoRotate?: boolean;
};

export default function STLViewer({ src, autoRotate = true }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mountRef.current || !src) return;

    setLoading(true);
    setError(null);

    const container = mountRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0b0e14");

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

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.autoRotate = autoRotate;
    controls.enableDamping = true;

    // ✅ FONCTION DE REDIMENSIONNEMENT (Le fix pour ton problème)
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

        geometry.computeBoundingBox();
        if (geometry.boundingBox) {
          const height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
          mesh.position.y = height / 2;
        }

        scene.add(mesh);

        geometry.computeBoundingSphere();
        const radius = geometry.boundingSphere?.radius || 50;
        camera.position.set(radius * 2, radius * 2, radius * 2);
        controls.target.set(0, mesh.position.y, 0);
        controls.update();
      },
      undefined,
      (err) => {
        setLoading(false);
        setError("Impossible de charger le modèle 3D.");
        console.error("ERREUR STL :", err);
      }
    );

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      // ✅ NETTOYAGE
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      controls.dispose();
    };
  }, [src, autoRotate]);

  return (
    <div style={{ width: "100%", height: "100%", minHeight: "500px", position: "relative" }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
      {loading && <div style={msgStyle}>Chargement du modèle...</div>}
      {error && <div style={{ ...msgStyle, color: "#ff4444" }}>{error}</div>}
    </div>
  );
}

const msgStyle: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  background: "rgba(0,0,0,0.8)",
  padding: "12px 20px",
  borderRadius: "20px",
  color: "white",
  zIndex: 10,
};