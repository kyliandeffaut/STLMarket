// src/components/STLViewer.tsx
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
  
  useEffect(() => {
    if (!mountRef.current || !src) return;
    
    setLoading(true);

    // --- 1. CONFIGURATION SCÈNE ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(background);

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Caméra : On calcule l'aspect ratio immédiatement pour éviter les distorsions
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 2000);

    // Lumières
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.8);
    hemiLight.position.set(0, 20, 0);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    scene.add(dirLight);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.setSize(width, height);
    
    // Nettoyage du container avant ajout
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Contrôles
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 2.0;

    // --- 2. CONFIGURATION LOADER AVEC CORRECTIF CORS ---
    const loader = new STLLoader();
    
    // ✅ CORRECTIF CRUCIAL : Autorise le chargement depuis Cloudinary
    loader.setPath(""); 
    (loader as any).crossOrigin = 'anonymous'; 

    loader.load(
      src,
      (geometry) => {
        setLoading(false);
        
        // A. Centrage de la géométrie
        geometry.computeBoundingBox();
        geometry.center(); 

        // B. Calcul de la sphère englobante
        geometry.computeBoundingSphere();
        const boundingSphere = geometry.boundingSphere;
        const radius = boundingSphere ? boundingSphere.radius : 1;

        // C. Création du Mesh
        const material = new THREE.MeshStandardMaterial({
          color: 0x60a5fa,
          metalness: 0.2,
          roughness: 0.5,
          wireframe: wireframe,
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        let objectCenterY = 0;
        if (geometry.boundingBox) {
           const h = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
           mesh.position.y = h / 2;
           objectCenterY = mesh.position.y;
        }

        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);

        // D. AJUSTEMENT CAMÉRA (FIT)
        const fov = camera.fov * (Math.PI / 180);
        let distance = Math.abs(radius / Math.sin(fov / 2));
        distance *= 1.6; // Marge

        const target = new THREE.Vector3(0, objectCenterY, 0);
        const direction = new THREE.Vector3(1, 0.8, 1).normalize();
        const cameraPos = target.clone().add(direction.multiplyScalar(distance));
        
        camera.position.copy(cameraPos);
        controls.target.copy(target);
        
        controls.minDistance = radius * 0.5; 
        controls.maxDistance = distance * 10;
        controls.update();

        // E. Sol et Grille
        if (showGround) {
          const groundSize = Math.max(200, radius * 20);
          const planeGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
          const planeMaterial = new THREE.MeshPhongMaterial({ 
              color: 0x111827, 
              depthWrite: false 
          });
          const plane = new THREE.Mesh(planeGeometry, planeMaterial);
          plane.rotation.x = -Math.PI / 2;
          plane.receiveShadow = true;
          scene.add(plane);
          
          const grid = new THREE.GridHelper(groundSize, 40, 0x444444, 0x222222);
          grid.material.opacity = 0.3;
          grid.material.transparent = true;
          scene.add(grid);
        }
      },
      undefined,
      (error) => {
        setLoading(false);
        console.error("Erreur chargement STL:", error);
      }
    );

    // --- 3. ANIMATION & RESIZE ---
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Nettoyage
    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [src, autoRotate, background, showGround, wireframe]);

  return (
    <div 
      style={{ 
        width: "100%", 
        height: "100%", 
        minHeight: "400px",
        background: background,
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative"
      }} 
    >
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />
      
      {loading && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color: "white",
          fontFamily: "sans-serif",
          background: "rgba(0,0,0,0.5)",
          padding: "10px 20px",
          borderRadius: "20px"
        }}>
          Chargement du modèle 3D...
        </div>
      )}
    </div>
  );
}