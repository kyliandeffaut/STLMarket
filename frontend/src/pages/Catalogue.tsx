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
    addItem(
      {
        _id: f._id,
        kind: "file",
        title: f.title,
        price: f.price,
        category: f.category,
        filename: f.filename,
      },
      1
    );
    setAddedId(f._id);
    window.setTimeout(() => setAddedId(null), 900);
  };

  return (
    <section className="container" style={{ padding: "24px 16px" }}>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Catalogue</h2>
        <input className="input" placeholder="Rechercher…" value={q}
          onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 280 }} />
      </div>

      <div className="grid cols-2" style={{ gap: 16 }}>
        {filtered.map((f) => (
          <article className="card" key={f._id} style={{ padding: 16 }}>
            <div style={{ fontWeight: 800 }}>{f.title}</div>
            <div style={{ color: "var(--muted)", fontSize: 14, marginTop: 6 }}>
              {f.category} • {f.downloads} téléchargements
            </div>

            <div className="spacer"></div>

            <div className="row" style={{ justifyContent: "space-between", alignItems: "center", gap: 10 }}>
              <span style={{ fontWeight: 900 }}>{f.price.toFixed(2)} €</span>

              <div className="row" style={{ gap: 10 }}>
                <button className="btn primary" type="button" onClick={() => onAdd(f)}>
                  {addedId === f._id ? "Ajouté ✅" : "Ajouter au panier"}
                </button>

                <Link className="btn" to={`/product/${encodeURIComponent(f.title)}`} state={{ item: f }}>
                  Voir
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
