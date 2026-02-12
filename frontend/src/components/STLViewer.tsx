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
    
    const container = mountRef.current;
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // Caméra
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2000);
    // La position initiale n'est pas importante, elle sera recalculée

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
          geometry.center(); // ✅ L'objet est parfaitement centré en (0,0,0)

          // B. Calcul de la sphère englobante pour le cadrage
          geometry.computeBoundingSphere();
          const boundingSphere = geometry.boundingSphere;
          const radius = boundingSphere ? boundingSphere.radius : 1;

          // C. Création du Mesh (SANS mise à l'échelle)
          const material = new THREE.MeshStandardMaterial({
            color: 0x60a5fa,
            metalness: 0.2,
            roughness: 0.5,
            wireframe: wireframe,
          });
          
          const mesh = new THREE.Mesh(geometry, material);
          
          // On calcule la hauteur pour poser l'objet sur le sol (Y=0)
          let objectCenterY = 0;
          if (geometry.boundingBox) {
             const height = geometry.boundingBox.max.y - geometry.boundingBox.min.y;
             mesh.position.y = height / 2;
             objectCenterY = mesh.position.y;
          }

          mesh.castShadow = true;
          mesh.receiveShadow = true;
          scene.add(mesh);

          // D. AJUSTEMENT AUTOMATIQUE DE LA CAMÉRA (LE "FIT") 📸
          // On calcule la distance idéale pour que l'objet rentre dans le champ de vision
          const fov = camera.fov * (Math.PI / 180); // Conversion en radians
          // Formule magique pour trouver la distance : distance = rayon / sin(fov/2)
          let distance = Math.abs(radius / Math.sin(fov / 2));

          // On ajoute une marge de sécurité (x1.5) pour que l'objet "respire"
          distance *= 1.5;

          // Le point que la caméra doit regarder (le centre de l'objet)
          const target = new THREE.Vector3(0, objectCenterY, 0);

          // On place la caméra. Une vue isométrique (en diagonale) est souvent jolie.
          // On la place à la bonne distance de la cible.
          const direction = new THREE.Vector3(1, 0.8, 1).normalize(); // Vecteur direction
          const cameraPos = target.clone().add(direction.multiplyScalar(distance));
          
          camera.position.copy(cameraPos);

          // On dit aux contrôles de regarder le centre de l'objet
          controls.target.copy(target);
          
          // On définit les limites de zoom pour éviter les problèmes
          controls.minDistance = radius * 1.1; // Impossible de rentrer dans l'objet
          controls.maxDistance = distance * 5;  // Impossible d'aller trop loin
          
          controls.update();

          // E. Sol (Optionnel)
          if (showGround) {
            // Le sol doit être proportionnel à la taille de l'objet
            const groundSize = Math.max(200, radius * 15);
            const planeGeometry = new THREE.PlaneGeometry(groundSize, groundSize);
            const planeMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x111827, 
                depthWrite: false 
            });
            const plane = new THREE.Mesh(planeGeometry, planeMaterial);
            plane.rotation.x = -Math.PI / 2;
            plane.receiveShadow = true;
            scene.add(plane);
            
            // Grille
            const grid = new THREE.GridHelper(groundSize, 20, 0x444444, 0x222222);
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

    const handleResize = () => {
      if (!container) return;
      const width = container.clientWidth;
      const height = container.clientHeight;
      
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();

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
        minHeight: "400px",
        background: background,
        borderRadius: "12px",
        overflow: "hidden",
        position: "relative"
      }} 
    />
  );
}