import { useEffect, useMemo, useState } from "react";
import { FilesAPI, FileDTO } from "../lib/api";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Catalogue() {
  const [items, setItems] = useState<FileDTO[]>([]);
  const [q, setQ] = useState("");
  const [addedId, setAddedId] = useState<string | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    (async () => {
      const data = await FilesAPI.list();
      setItems(data);
    })().catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((f) => f.title.toLowerCase().includes(query));
  }, [items, q]);

  const onAdd = (f: FileDTO) => {
    addItem({
      _id: f._id,
      kind: "file",
      title: f.title,
      price: f.price,
      category: f.category,
      filename: f.filename,
    }, 1);
    setAddedId(f._id);
    window.setTimeout(() => setAddedId(null), 900);
  };

  return (
    <div className="container">
      <h1>Catalogue STL</h1>
      
      {/* Barre de recherche "Pilule" */}
      <div className="search-wrapper">
        <input 
          className="search-input-fancy" 
          placeholder="🔍 Rechercher un modèle..." 
          value={q}
          onChange={(e) => setQ(e.target.value)} 
        />
      </div>

      <div className="catalogue-grid">
        {filtered.map((f) => (
          <article className="product-card" key={f._id}>
            {/* Zone visuelle */}
            <div className="card-preview">📦</div>

            <div className="card-content">
              <h3 style={{ margin: 0 }}>{f.title}</h3>
              <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 8 }}>
                📂 {f.category} • ⬇️ {f.downloads} dl
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 25 }}>
                <span className="price-text">{f.price.toFixed(2)} €</span>

                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn primary" onClick={() => onAdd(f)}>
                    {addedId === f._id ? "Ajouté ✅" : "Ajouter"}
                  </button>

                  <Link className="btn" to={`/product/${encodeURIComponent(f.title)}`} state={{ item: f }}>
                    Voir
                  </Link>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}