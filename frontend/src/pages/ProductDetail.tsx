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

  if (loading) return <div className="container" style={{ padding: 40, textAlign: "center" }}>Chargement...</div>;
  if (!item) return <div className="container" style={{ padding: 40, textAlign: "center" }}>Produit introuvable.</div>;

  // ✅ CONFIGURATION CLOUDINARY (dvgdc8bq0 est ton Cloud Name)
  const CLOUD_NAME = "dvgdc8bq0";
  const stlUrl = `https://res.cloudinary.com/${CLOUD_NAME}/raw/upload/v1/stl_market/${encodeURIComponent(item.filename)}.stl`;

  return (
    <section className="container">
      <div className="detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}>
        
        {/* VISUALISEUR */}
        <div className="card" style={{ padding: 0, overflow: "hidden", background: "#0b0e14", borderRadius: "12px", height: "500px" }}>
          <STLViewer src={stlUrl} />
        </div>

        {/* INFOS */}
        <div className="card" style={{ padding: "30px", display: "flex", flexDirection: "column" }}>
          <h1>{item.title}</h1>
          <p style={{ color: "var(--text-muted)", flexGrow: 1 }}>{item.description || "Aucune description."}</p>
          
          <div style={{ marginTop: "auto", borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "24px", fontWeight: "bold" }}>{item.price.toFixed(2)} €</span>
              <button className={`btn ${added ? "" : "primary"}`} onClick={onAdd} disabled={added}>
                {added ? "Ajouté !" : "Ajouter au panier"}
              </button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}