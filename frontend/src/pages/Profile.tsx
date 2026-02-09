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
    // On n'a plus besoin de récupérer le token manuellement ici, 
    // l'intercepteur dans api.ts le fait déjà !
    
    try {
      // 👇 On utilise api.get et on enlève le début de l'URL
      const [ordersRes, printsRes] = await Promise.all([
        api.get("/api/orders/my"),
        api.get("/api/print/my")
      ]);

      setOrders(ordersRes.data.orders || []); 
      setPrints(Array.isArray(printsRes.data) ? printsRes.data : []);

    } catch (e) {
      console.error("Erreur chargement profil", e);
      // Si erreur 401 (Non autorisé), on redirige
      if ((e as any).response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const removeOrder = async (id: string) => {
    if(!window.confirm("Supprimer cette commande de l'historique ?")) return;
    try {
       // 👇 Correction ici aussi
        await api.delete(`/api/orders/${id}`);
        await load(); 
    } catch (e) {
        alert("Erreur lors de la suppression");
    }
  };

  const addPrintQuoteToCart = (r: any) => {
    if (r.status !== "quoted" || r.quotePrice == null) return;

    addItem(
      {
        _id: `print_${r._id}`, 
        kind: "print",
        title: `Impression 3D: ${r.originalName}`,
        price: r.quotePrice,
        category: "Impression 3D",
        filename: r.storedName,
      },
      1 
    );
    alert("Ajouté au panier ✅");
  };

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <div className="card" style={{ padding: 24 }}>
        <h1 style={{ marginTop: 0 }}>Mon espace</h1>

        {loading ? <p>Chargement des données...</p> : (
            <>
                {/* SECTION COMMANDES */}
                <div className="card" style={{ padding: 16, marginTop: 24, border: "1px solid var(--border)" }}>
                <h2 style={{ marginTop: 0 }}>📦 Historique d’achats</h2>

                {orders.length === 0 ? (
                    <p style={{ opacity: 0.6 }}>Aucun achat pour l’instant.</p>
                ) : (
                    <div style={{ display: "grid", gap: 16 }}>
                    {orders.map((o) => (
                        <div key={o._id} className="card" style={{ padding: 16, background: "rgba(255,255,255,0.02)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                            <div>
                            <div style={{ fontWeight: 800, marginBottom: 4 }}>
                                Commande du {new Date(o.createdAt).toLocaleDateString()}
                            </div>
                            <div style={{ opacity: 0.8, fontSize: 14 }}>
                                Total: <span style={{color: "var(--primary)"}}>{o.totalPrice.toFixed(2)} €</span> • {o.items.length} article(s)
                            </div>
                            </div>
                            <button 
                                className="btn" 
                                style={{color: "var(--danger)", borderColor: "rgba(248,81,73,0.3)", background: "transparent"}}
                                onClick={() => removeOrder(o._id)}
                            >
                            Supprimer
                            </button>
                        </div>

                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid rgba(255,255,255,0.1)", fontSize: 14 }}>
                            {o.items.map((it: any, idx: number) => (
                            <div key={idx} style={{ opacity: 0.8, marginBottom: 4 }}>
                                • {it.title} × {it.quantity} — {it.price.toFixed(2)} €
                            </div>
                            ))}
                        </div>
                        </div>
                    ))}
                    </div>
                )}
                </div>

                {/* SECTION IMPRESSIONS */}
                <div className="card" style={{ padding: 16, marginTop: 24, border: "1px solid var(--border)" }}>
                <h2 style={{ marginTop: 0 }}>🖨️ Demandes d’impression 3D</h2>

                {prints.length === 0 ? (
                    <p style={{ opacity: 0.6 }}>Aucune demande en cours.</p>
                ) : (
                    <div style={{ display: "grid", gap: 16 }}>
                    {prints.map((r) => (
                        <div key={r._id} className="card" style={{ padding: 16, background: "rgba(255,255,255,0.02)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>{r.originalName}</div>
                            {r.status === "quoted" && (
                                <button className="btn primary" onClick={() => addPrintQuoteToCart(r)}>
                                    Ajouter au panier 🛒
                                </button>
                            )}
                        </div>
                        
                        <div style={{ opacity: 0.8, fontSize: 14, marginTop: 8 }}>
                            Statut: 
                            {r.status === "pending" && <span style={{color: "orange", marginLeft: 6}}>En attente ⏳</span>}
                            {r.status === "quoted" && <span style={{color: "#4ade80", marginLeft: 6}}>Devis reçu ! ✅</span>}
                            {r.status === "paid" && <span style={{color: "var(--primary)", marginLeft: 6}}>Payé 🚀</span>}
                            
                            {r.quotePrice != null && (
                                <span style={{ marginLeft: 10, fontWeight: "bold" }}>• Prix: {r.quotePrice.toFixed(2)} €</span>
                            )}
                        </div>

                        {r.adminMessage && (
                            <div style={{ marginTop: 8, padding: 8, background: "rgba(255,255,0,0.1)", borderRadius: 4, fontSize: 14 }}>
                            👮 Admin: {r.adminMessage}
                            </div>
                        )}
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