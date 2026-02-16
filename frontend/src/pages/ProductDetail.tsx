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

  // ✅ TA LOGIQUE QUI MARCHE : URL directe avec l'extension complète
  const CLOUD_NAME = "dvgdc8bq0";
  const stlUrl = `https://res.cloudinary.com/${CLOUD_NAME}/raw/upload/v1/${encodeURIComponent(item.filename)}`;

  return (
    <div className="container" style={{ marginTop: "40px" }}>
      {/* On utilise .detail-grid de ton CSS pour le placement */}
      <div className="detail-grid">
        
        {/* VISUALISEUR 3D - On garde ton height: 500px pour éviter l'écran noir */}
        <div className="card" style={{ padding: 0, overflow: "hidden", background: "#0b0e14", height: "500px" }}>
          <STLViewer src={stlUrl} />
        </div>

        {/* INFORMATIONS PRODUIT */}
        <div className="card" style={{ padding: "30px", display: "flex", flexDirection: "column" }}>
          <h1 style={{ marginTop: 0 }}>{item.title}</h1>
          
          <div style={{ marginBottom: 20, fontSize: 14, color: "var(--muted)" }}>
              📂 {item.category} • ⬇️ {item.downloads} téléchargements
          </div>

          <p style={{ color: "var(--muted)", flexGrow: 1, lineHeight: "1.6" }}>
            {item.description || "Description indisponible."}
          </p>
          
          <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "32px", fontWeight: "900", color: "var(--accent)" }}>
                {item.price.toFixed(2)} €
              </span>
              
              <button 
                className={`btn ${added ? "" : "primary"}`} 
                onClick={onAdd} 
                disabled={added}
                style={{ minWidth: "180px" }}
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