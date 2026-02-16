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
    FilesAPI.list().then(setItems).catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return items.filter((f) => f.title.toLowerCase().includes(query));
  }, [items, q]);

  const onAdd = (f: FileDTO) => {
    addItem({ ...f, kind: "file" }, 1);
    setAddedId(f._id);
    window.setTimeout(() => setAddedId(null), 900);
  };

  return (
    <div className="container" style={{paddingTop: '40px'}}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{margin: 0}}>Catalogue STL</h1>
        <input 
          className="search-input-fancy" 
          placeholder="🔍 Rechercher..." 
          value={q}
          onChange={(e) => setQ(e.target.value)} 
        />
      </div>

      <div className="catalogue-grid">
        {filtered.map((f) => (
          <article className="product-card" key={f._id}>
            <div className="card-preview">📦</div>
            <div className="card-content">
              <h3 style={{ margin: 0 }}>{f.title}</h3>
              <p style={{ color: "var(--muted)", fontSize: 13 }}>📂 {f.category}</p>
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 20 }}>
                <span style={{ fontWeight: 900, fontSize: 20, color: 'var(--accent)' }}>{f.price.toFixed(2)} €</span>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn primary" onClick={() => onAdd(f)}>
                    {addedId === f._id ? "Ajouté ✅" : "Ajouter"}
                  </button>
                  <Link className="btn" to={`/product/${encodeURIComponent(f.title)}`} state={{ item: f }}>Voir</Link>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}