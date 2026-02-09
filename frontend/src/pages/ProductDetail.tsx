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
    addItem(
      {
        _id: item._id,
        kind: "file",
        title: item.title,
        price: item.price,
        category: item.category,
        filename: item.filename,
      },
      1
    );
    setAdded(true);
    window.setTimeout(() => setAdded(false), 900);
  };

  if (loading) return (
    <div className="container" style={{ padding: 40, textAlign: "center" }}>
      <div className="card">Chargement du produit...</div>
    </div>
  );

  if (!item) return (
    <div className="container" style={{ padding: 40, textAlign: "center" }}>
      <div className="card">Produit introuvable.</div>
    </div>
  );

  // 👇 LA CORRECTION EST ICI
  // On pointe directement vers ton serveur Render pour récupérer le fichier 3D
  const stlUrl = `https://stlmarket.onrender.com/files/${encodeURIComponent(item.filename)}`;

  return (
    <section className="container">
      
      {/* Utilisation de la classe CSS responsive */}
      <div className="detail-grid">
        
        {/* --- VISUALISEUR 3D --- */}
        <div 
          className="card detail-card" 
          style={{ 
            padding: 0, 
            overflow: "hidden", 
            position: "relative",
            background: "#0b0e14" // Fond sombre pour la 3D
          }}
        >
          <STLViewer src={stlUrl} />
          <div style={{ 
            position: "absolute", bottom: 8, right: 12, 
            fontSize: 11, color: "rgba(255,255,255,0.3)", 
            pointerEvents: "none"
          }}>
            {item.filename}
          </div>
        </div>

        {/* --- INFORMATIONS --- */}
        <div 
          className="card detail-card" 
          style={{ 
            padding: "30px", 
            display: "flex", 
            flexDirection: "column"
          }}
        >
          <h1 style={{ marginTop: 0, fontSize: "clamp(1.5rem, 4vw, 2rem)", lineHeight: 1.1 }}>
            {item.title}
          </h1>
          
          <div style={{ margin: "10px 0 20px 0", display: "flex", flexWrap: "wrap", gap: 10, fontSize: 14, color: "var(--text-muted)" }}>
            <span style={{ background: "rgba(255,255,255,0.05)", padding: "4px 8px", borderRadius: 6 }}>
              📂 {item.category}
            </span>
            <span style={{ padding: "4px 0" }}>⬇️ {item.downloads} téléchargements</span>
          </div>

          <p style={{ color: "var(--text-muted)", lineHeight: 1.6, flexGrow: 1, fontSize: "1rem" }}>
            {item.description || "Description indisponible."}
          </p>

          <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, marginTop: "auto" }}>
            {/* Zone Prix + Bouton responsive */}
            <div className="action-row">
              <div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Prix unitaire</div>
                <div style={{ fontSize: "28px", fontWeight: "bold", color: "var(--primary)" }}>
                  {item.price.toFixed(2)} €
                </div>
              </div>
              
              <button 
                className={`btn ${added ? "" : "primary"}`} 
                onClick={onAdd}
                style={{ padding: "12px 24px", fontSize: "1rem", flexGrow: 1, maxWidth: "200px" }}
                disabled={added}
              >
                {added ? "Dans le panier ✅" : "Ajouter au panier 🛒"}
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}