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

  // --- LOGIQUE CLOUDINARY AMÉLIORÉE ---
  const CLOUD_NAME = "dvgdc8bq0";
  
  // 1. On retire l'extension .stl (ou autre) du nom de fichier via Regex
  const cleanPublicId = item.filename.replace(/\.[^/.]+$/, "");
  
  // 2. On construit l'URL avec un cache-buster (timestamp) pour forcer la mise à jour
  const stlUrl = `https://res.cloudinary.com/${CLOUD_NAME}/raw/upload/v1/${encodeURIComponent(cleanPublicId)}?t=${Date.now()}`;

  return (
    <div className="container">
      {/* On utilise .detail-grid pour la structure responsive */}
      <div className="detail-grid">
        
        {/* VISUALISEUR 3D - Dans une .card spécialisée */}
        <div className="card detail-card" style={{ padding: 0, background: "#000" }}>
          <STLViewer src={stlUrl} />
        </div>

        {/* INFORMATIONS PRODUIT */}
        <div className="card" style={{ display: "flex", flexDirection: "column" }}>
          <h1>{item.title}</h1>
          
          <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <span className="nav-item active" style={{ fontSize: "12px", padding: "4px 10px" }}>
                📂 {item.category}
              </span>
              <span style={{ color: "var(--muted)", fontSize: "14px" }}>
                ⬇️ {item.downloads} téléchargements
              </span>
          </div>

          <p style={{ color: "var(--muted)", flexGrow: 1, lineHeight: "1.6" }}>
            {item.description || "Aucune description fournie pour ce modèle 3D."}
          </p>
          
          <div style={{ marginTop: "30px", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "25px" }}>
            <div className="row" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "32px", fontWeight: "900", color: "var(--primary)" }}>
                {item.price.toFixed(2)} €
              </span>
              
              <button 
                className={`btn ${added ? "" : "primary"}`} 
                onClick={onAdd} 
                disabled={added}
                style={{ minWidth: "180px" }}
              >
                {added ? "Dans le panier ✅" : "Ajouter au panier 🛒"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}