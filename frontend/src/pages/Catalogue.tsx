import { useEffect, useState } from "react";
import { FilesAPI, FileDTO } from "@lib/api";
import { Link } from "react-router-dom";

export default function Catalogue() {
  const [items, setItems] = useState<FileDTO[]>([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      const data = await FilesAPI.list();
      setItems(data);
    })().catch(console.error);
  }, []);

  const filtered = items.filter((f) =>
    f.title.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <section className="container">
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Catalogue</h2>
        <input className="input" placeholder="Rechercher…" value={q}
          onChange={(e) => setQ(e.target.value)} style={{ maxWidth: 280 }} />
      </div>

      <div className="grid cols-3">
        {filtered.map((f) => (
          <article className="card" key={f._id}>
            <div style={{ fontWeight: 600 }}>{f.title}</div>
            <div style={{ color: "var(--muted)", fontSize: 14 }}>
              {f.category} • {f.downloads} téléchargements
            </div>
            <div className="spacer"></div>
            <div className="row" style={{ justifyContent: "space-between" }}>
              <span style={{ fontWeight: 700 }}>{f.price.toFixed(2)} €</span>
              <Link className="btn" to={`/product/${encodeURIComponent(f.title)}`} state={{ item: f }}>
                Voir
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
