import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [orders, setOrders] = useState<any[]>([]);
  const [prints, setPrints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    try {
      const [ordersRes, printsRes] = await Promise.all([
        api.get("/api/orders/my"),
        api.get("/api/print/my")
      ]);
      setOrders(ordersRes.data.orders || []); 
      setPrints(Array.isArray(printsRes.data) ? printsRes.data : []);
    } catch (e) {
      console.error("Erreur chargement profil", e);
      if ((e as any).response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Fonction de téléchargement
  const downloadFile = async (fileId: string) => {
    try {
      const response = await api.get(`/api/files/download/${fileId}`);
      
      if (response.data.downloadUrl) {
        // Déclenche le téléchargement
        const link = document.createElement('a');
        link.href = response.data.downloadUrl;
        link.setAttribute('target', '_blank'); 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error("URL introuvable");
      }
    } catch (error) {
      alert("Erreur de téléchargement. Vérifiez vos accès.");
    }
  };

  const removeOrder = async (id: string) => {
    if(!window.confirm("Supprimer cette commande ?")) return;
    try {
        await api.delete(`/api/orders/${id}`);
        await load(); 
    } catch (e) {
        alert("Erreur lors de la suppression");
    }
  };

  const addPrintQuoteToCart = (r: any) => {
    if (r.status !== "quoted" || r.quotePrice == null) return;
    addItem({
        _id: `print_${r._id}`, 
        kind: "print",
        title: `Impression 3D: ${r.originalName}`,
        price: r.quotePrice,
        category: "Impression 3D",
        filename: r.storedName,
      }, 1 
    );
    alert("Ajouté au panier ✅");
  };

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <div className="card" style={{ padding: 24 }}>
        <h1>Mon espace</h1>
        {loading ? <p>Chargement...</p> : (
            <>
                <div className="card" style={{ padding: 16, marginTop: 24, border: "1px solid var(--border)" }}>
                <h2>📦 Historique d'achats</h2>
                {orders.length === 0 ? <p>Aucun achat.</p> : (
                    <div style={{ display: "grid", gap: 16 }}>
                    {orders.map((o) => (
                        <div key={o._id} className="card" style={{ padding: 16, background: "rgba(255,255,255,0.02)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <div>
                                <div style={{ fontWeight: 800 }}>Commande du {new Date(o.createdAt).toLocaleDateString()}</div>
                                <div style={{ opacity: 0.8, fontSize: 14 }}>Total: {o.totalPrice.toFixed(2)} €</div>
                            </div>
                            <button className="btn" style={{color: "var(--danger)"}} onClick={() => removeOrder(o._id)}>✕</button>
                        </div>
                        <div style={{ marginTop: 12, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                            {o.items.map((it: any, idx: number) => (
                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                                <span>• {it.title}</span>
                                {it.kind === 'file' && it.fileId && (
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
            </>
        )}
      </div>
    </div>
  );
}