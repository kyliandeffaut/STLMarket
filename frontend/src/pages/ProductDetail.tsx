import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      // ✅ Cache-busting sur l'API aussi
      const ordersRes = await api.get(`/api/orders/my?t=${Date.now()}`);
      setOrders(ordersRes.data.orders || []); 
    } catch (e) {
      if ((e as any).response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const downloadFile = async (fileId: string) => {
    try {
      const response = await api.get(`/api/files/download/${fileId}`);
      if (response.data.downloadUrl) {
        // ✅ MÉTHODE FORCE : Ouvre le lien de téléchargement directement
        window.location.assign(response.data.downloadUrl);
      }
    } catch (error) {
      alert("Erreur lors du téléchargement.");
    }
  };

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <div className="card" style={{ padding: 24 }}>
        <h1>Mon espace</h1>
        {loading ? <p>Chargement...</p> : (
          <div className="card" style={{ padding: 16, marginTop: 24, border: "1px solid var(--border)" }}>
            <h2>📦 Historique d'achats</h2>
            {orders.length === 0 ? <p>Aucun achat.</p> : (
              <div style={{ display: "grid", gap: 16 }}>
                {orders.map((o) => (
                  <div key={o._id} className="card" style={{ padding: 16, background: "rgba(255,255,255,0.02)" }}>
                    <div style={{ fontWeight: 800 }}>Commande du {new Date(o.createdAt).toLocaleDateString()}</div>
                    <div style={{ marginTop: 12, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                      {o.items.map((it: any, idx: number) => (
                        <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                          <span>• {it.title}</span>
                          {it.kind === 'file' && (
                            <button className="btn primary" onClick={() => downloadFile(it.fileId)}>📥 Télécharger</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}