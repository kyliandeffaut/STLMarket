import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader.js";

type Props = {
  src?: string;
  autoRotate?: boolean;
  background?: string;
  showGround?: boolean;
  wireframe?: boolean;
};

export default function STLViewer({
  src,
  autoRotate = true,
  background = "#0e1220",
  showGround = true,
  wireframe = false,
}: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!mountRef.current || !src) return;
    
    setLoading(true);
    setError(null);

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(background);
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    
    while (container.firstChild) { container.removeChild(container.firstChild); }
    container.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 0.8));
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.autoRotate = autoRotate;

    const loader = new STLLoader();
    // ✅ INDISPENSABLE : Autorise Three.js à lire le fichier sur Cloudinary
    loader.setPath(""); 
    (loader as any).crossOrigin = 'anonymous'; 

    loader.load(src, (geometry) => {
      setLoading(false);
      geometry.center(); 
      const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x60a5fa, wireframe }));
      scene.add(mesh);

      geometry.computeBoundingSphere();
      const radius = geometry.boundingSphere?.radius || 1;
      camera.position.set(radius * 2, radius * 2, radius * 2);
      controls.target.set(0, 0, 0);
      controls.update();
    }, undefined, (err) => {
      setLoading(false);
      setError("Impossible de charger le modèle 3D.");
      console.error(err);
    });

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      renderer.dispose();
    };
  }, [src, autoRotate, background, showGround, wireframe]);

  return (
    <div style={{ width: "100%", height: "100%", minHeight: "400px", position: "relative", background }}>
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
      {loading && <div style={overlayStyle}>Chargement 3D...</div>}
      {error && <div style={{...overlayStyle, color: "#f87171"}}>{error}</div>}
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
  background: "rgba(0,0,0,0.7)", padding: "10px 20px", borderRadius: "20px", color: "white"
};