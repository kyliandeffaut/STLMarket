// src/components/STLViewer.tsx
import { useEffect, useRef } from "react";
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
  
  useEffect(() => {
    if (!mountRef.current) return;
    
    // --- 1. CONFIGURATION SCÈNE ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(background);

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
    
    // On attache le canvas au div
    const container = mountRef.current;
    // On vide le conteneur au cas où (re-render)
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Caméra
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2000);
    camera.position.set(0, 50, 100); // Position par défaut

    // Contrôles
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 2.0;

    // --- 2. FONCTION DE CHARGEMENT ---
    const loader = new STLLoader();

    if (src) {
      loader.load(
        src,
        (geometry) => {
          // A. Centrage de la géométrie
          geometry.computeBoundingBox();
          geometry.center(); // ✅ Méthode native Three.js pour centrer parfaitement

          // B. Calcul de l'échelle pour que l'objet ait une taille standard
          geometry.computeBoundingSphere();
          const boundingSphere = geometry.boundingSphere;
          const radius = boundingSphere ? boundingSphere.radius : 1;
          
          // On veut que l'objet fasse environ 50 unités de large à l'écran
          const targetSize = 50; 
          const scaleFactor = targetSize / radius;

          // C. Création du Mesh
          const material = new THREE.MeshStandardMaterial({
            color: 0x60a5fa, // Bleu joli
            metalness: 0.2,
            roughness: 0.5,
            wireframe: wireframe,
          });
          
          const mesh = new THREE.Mesh(geometry, material);
          
          // On applique l'échelle
          mesh.scale.set(scaleFactor, scaleFactor, scaleFactor);
          
          // On le remonte un peu pour qu'il ne soit pas "dans" le sol
          // (Puisqu'on l'a centré, la moitié est en dessous de 0)
          if (geometry.boundingBox) {
             const height = (geometry.boundingBox.max.y - geometry.boundingBox.min.y) * scaleFactor;
             mesh.position.y = height / 2; 
          }

          mesh.castShadow = true;
          mesh.receiveShadow = true;
          scene.add(mesh);

          // D. Sol (Optionnel)
          if (showGround) {
            const planeGeometry = new THREE.PlaneGeometry(500, 500);
            const planeMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x111827, 
                depthWrite: false 
            });
            const plane = new THREE.Mesh(planeGeometry, planeMaterial);
            plane.rotation.x = -Math.PI / 2;
            plane.receiveShadow = true;
            scene.add(plane);
            
            // Grille pour faire joli
            const grid = new THREE.GridHelper(500, 50, 0x444444, 0x222222);
            grid.position.y = 0.1;
            grid.material.opacity = 0.4;
            grid.material.transparent = true;
            scene.add(grid);
          }
        },
        undefined,
        (error) => {
          console.error("Erreur chargement STL:", error);
        }
      );
    }

    // --- 3. ANIMATION & RESIZE ---
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Gestion du redimensionnement (Responsive)
    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    // On écoute le resize
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize(); // Appel initial

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
      ref={mountRef} 
      style={{ 
        width: "100%", 
        height: "100%", 
        minHeight: "400px", // Hauteur minimale garantie
        background: background,
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative"
      }} 
    />
  );
}