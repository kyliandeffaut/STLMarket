import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import STLViewer from "@components/STLViewer";
import { FilesAPI, FileDTO } from "@lib/api";

type LocationState = { item?: FileDTO } | null;

export default function ProductDetail() {
  const { id } = useParams(); // titre encodé
  const { state } = useLocation() as { state: LocationState };
  const [item, setItem] = useState<FileDTO | null>(state?.item ?? null);

  useEffect(() => {
    if (item) return; // déjà passé depuis le catalogue
    const title = decodeURIComponent(id ?? "");
    FilesAPI.detailByTitle(title).then(setItem).catch(() => setItem(null));
  }, [id]);

  if (!item) {
    return (
      <section className="container">
        <div className="card">
          <h2>Fichier introuvable</h2>
          <p>“{decodeURIComponent(id ?? "")}”</p>
        </div>
      </section>
    );
  }

  // ⚠️ Charger le STL via l’API statique du backend
  const stlUrl = `${(import.meta.env.VITE_API_URL as string).replace(/\/api$/, "")}/files/${encodeURIComponent(item.filename)}`;

  return (
    <section className="container" style={{ display: "grid", gap: 20 }}>
      <div className="product-grid" style={{ display: "grid", gap: 20, gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr)" }}>
        <STLViewer src={stlUrl} showGround />

        <div className="card">
          <h2 style={{ marginTop: 0 }}>{item.title}</h2>
          <div style={{ color: "var(--muted)", fontSize: 14 }}>
            {item.category} • {item.downloads} téléchargements
          </div>
          <div className="spacer"></div>
          <p style={{ color: "var(--muted)" }}>
            {item.description ?? "Aucune description fournie."}
          </p>
          <div className="spacer"></div>
          <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 700, fontSize: 22 }}>{item.price.toFixed(2)} €</span>
            <button className="btn primary">Ajouter au panier</button>
          </div>
        </div>
      </div>

      <style>{`@media (max-width:980px){.product-grid{grid-template-columns:1fr;}}`}</style>
    </section>
  );
}
