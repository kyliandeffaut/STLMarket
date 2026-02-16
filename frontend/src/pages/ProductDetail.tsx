import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { FilesAPI, FileDTO } from "../lib/api";
import { useCart } from "../context/CartContext";
import STLViewer from "../components/STLViewer";

type LocationState = { item?: FileDTO } | null;

export default function ProductDetail() {
  const { title = "" } = useParams();
  const decodedTitle = useMemo(() => decodeURIComponent(title), [title]);

  const { state } = useLocation() as { state: LocationState };
  const stateItem = state?.item;

  const [item, setItem] = useState<FileDTO | null>(stateItem ?? null);
  const [loading, setLoading] = useState(!stateItem);
  const [added, setAdded] = useState(false);

  const { addItem } = useCart();

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (stateItem) return;
      setLoading(true);
      try {
        const data = await FilesAPI.detailByTitle(decodedTitle);
        if (mounted) setItem(data);
      } catch (e) {
        console.error(e);
        if (mounted) setItem(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [decodedTitle, stateItem]);

  const onAdd = () => {
    if (!item) return;
    addItem({
        _id: item._id,
        kind: "file",
        title: item.title,
        price: item.price,
        category: item.category,
        filename: item.filename,
      }, 1
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 900);
  };

  if (loading) return <div className="container" style={{ textAlign: "center", padding: "100px" }}>Chargement...</div>;
  if (!item) return <div className="container" style={{ textAlign: "center", padding: "100px" }}>Produit introuvable.</div>;

  // --- LOGIQUE CLOUDINARY ---
  const CLOUD_NAME = "dvgdc8bq0";
  // On s'assure de ne pas avoir de double extension ou de problème d'encodage
  const cleanPublicId = item.filename.replace(/\.[^/.]+$/, "");
  const stlUrl = `https://res.cloudinary.com/${CLOUD_NAME}/raw/upload/v1/${cleanPublicId}.stl`;

  return (
    <div className="container" style={{ marginTop: "20px" }}>
      <div className="detail-grid">
        
        {/* CORRECTION ICI : 
          On force une min-height et un aspect-ratio pour que le CSS ne l'écrase pas.
          Le position relative aide Three.js à calculer sa taille.
        */}
        <div className="card" style={{ 
          padding: 0, 
          overflow: "hidden", 
          background: "#000", 
          minHeight: "500px", 
          height: "100%",
          position: "relative",
          display: "block" // Assure que c'est un bloc
        }}>
          <STLViewer src={stlUrl} />
        </div>

        {/* INFORMATIONS PRODUIT */}
        <div className="card" style={{ display: "flex", flexDirection: "column", padding: "30px" }}>
          <h1 style={{ margin: "0 0 15px 0" }}>{item.title}</h1>
          
          <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <span style={{ 
                background: "rgba(99, 102, 241, 0.2)", 
                color: "var(--primary)",
                fontSize: "12px", 
                padding: "5px 12px",
                borderRadius: "20px",
                fontWeight: "bold"
              }}>
                📂 {item.category}
              </span>
              <span style={{ color: "var(--muted)", fontSize: "14px", alignSelf: "center" }}>
                ⬇️ {item.downloads} téléchargements
              </span>
          </div>

          <p style={{ color: "var(--muted)", flexGrow: 1, lineHeight: "1.7", fontSize: "16px" }}>
            {item.description || "Aucune description fournie pour ce modèle 3D."}
          </p>
          
          <div style={{ marginTop: "30px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "25px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "32px", fontWeight: "900", color: "var(--accent)" }}>
                {item.price.toFixed(2)} €
              </span>
              
              <button 
                className={`btn ${added ? "" : "primary"}`} 
                onClick={onAdd} 
                disabled={added}
                style={{ minWidth: "200px", padding: "14px" }}
              >
                {added ? "Ajouté ! ✅" : "Ajouter au panier 🛒"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}