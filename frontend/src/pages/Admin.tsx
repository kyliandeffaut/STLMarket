import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { AdminPrintAPI, PrintRequestDTO } from "../lib/api";

export default function Admin() {
  const { isAdmin } = useContext(AuthContext);
  const [list, setList] = useState<PrintRequestDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [price, setPrice] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    try {
      const { requests } = await AdminPrintAPI.list();
      setList(requests);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(console.error);
  }, []);

  if (!isAdmin) {
    return (
      <div className="container" style={{ padding: "24px 16px" }}>
        <div className="card" style={{ padding: 20 }}>
          <h1>Admin</h1>
          <p style={{ opacity: 0.9 }}>Erreur: vérifie que tu es admin + token.</p>
        </div>
      </div>
    );
  }

  const onQuote = async (id: string) => {
    const p = Number(price[id]);
    if (!Number.isFinite(p) || p <= 0) return alert("Prix invalide");
    await AdminPrintAPI.quote(id, p, msg[id] ?? "");
    await load();
  };

  const onReject = async (id: string) => {
    await AdminPrintAPI.reject(id, msg[id] ?? "");
    await load();
  };

  const onRemove = async (id: string) => {
    await AdminPrintAPI.remove(id);
    await load();
  };

  return (
    <div className="container" style={{ padding: "24px 16px" }}>
      <div className="card" style={{ padding: 20 }}>
        <h1 style={{ marginTop: 0 }}>Admin</h1>
        <p style={{ opacity: 0.85 }}>Commandes d’impression 3D</p>

        {loading ? <p>Chargement…</p> : null}

        {list.length === 0 ? (
          <p style={{ opacity: 0.85 }}>Aucune demande.</p>
        ) : (
          <div style={{ display: "grid", gap: 10 }}>
            {list.map((r) => (
              <div key={r._id} className="card" style={{ padding: 14 }}>
                <div style={{ fontWeight: 800 }}>{r.originalName}</div>
                <div style={{ opacity: 0.85, fontSize: 14 }}>
                  Statut: <b>{r.status}</b> • userId: {r.userId}
                </div>
                <div style={{ marginTop: 6, opacity: 0.85, fontSize: 14 }}>
                  {r.notes}
                </div>

                <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <input
                    className="input"
                    placeholder="Prix (€)"
                    value={price[r._id] ?? ""}
                    onChange={(e) => setPrice((s) => ({ ...s, [r._id]: e.target.value }))}
                    style={{ width: 140 }}
                  />
                  <input
                    className="input"
                    placeholder="Message admin (optionnel)"
                    value={msg[r._id] ?? ""}
                    onChange={(e) => setMsg((s) => ({ ...s, [r._id]: e.target.value }))}
                    style={{ minWidth: 240 }}
                  />

                  <button className="btn primary" onClick={() => onQuote(r._id)}>
                    Valider prix
                  </button>
                  <button className="btn" onClick={() => onReject(r._id)}>
                    Refuser
                  </button>
                  <button className="btn" onClick={() => onRemove(r._id)}>
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
