import { useEffect, useState } from "react";
import { OrdersAPI, OrderDTO, PrintAPI, PrintRequestDTO } from "../lib/api";
import { useCart } from "../context/CartContext";

export default function Profile() {
  const [orders, setOrders] = useState<OrderDTO[]>([]);
  const [prints, setPrints] = useState<PrintRequestDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  const load = async () => {
    setLoading(true);
    try {
      const [o, p] = await Promise.all([OrdersAPI.my(), PrintAPI.my()]);
      setOrders(o.orders);
      setPrints(p.requests);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load().catch(console.error); }, []);

  const removeOrder = async (id: string) => {
    await OrdersAPI.remove(id);
    await load();
  };

  const addPrintQuoteToCart = (r: PrintRequestDTO) => {
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
    <div className="container" style={{ padding: "24px 16px" }}>
      <div className="card" style={{ padding: 20 }}>
        <h1 style={{ marginTop: 0 }}>Mon espace</h1>

        {loading ? <p>Chargement…</p> : null}

        <div className="card" style={{ padding: 16, marginTop: 16 }}>
          <h2 style={{ marginTop: 0 }}>Historique d’achats</h2>

          {orders.length === 0 ? (
            <p style={{ opacity: 0.8 }}>Aucun achat pour l’instant.</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {orders.map((o) => (
                <div key={o._id} className="card" style={{ padding: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>
                        Commande • {new Date(o.createdAt).toLocaleString()}
                      </div>
                      <div style={{ opacity: 0.8, fontSize: 14 }}>
                        Total: {o.totalPrice.toFixed(2)} € • {o.items.length} item(s)
                      </div>
                    </div>
                    <button className="btn" onClick={() => removeOrder(o._id)}>
                      Supprimer
                    </button>
                  </div>

                  <div style={{ marginTop: 10, display: "grid", gap: 6 }}>
                    {o.items.map((it, idx) => (
                      <div key={idx} style={{ opacity: 0.9, fontSize: 14 }}>
                        • {it.title} × {it.quantity} — {it.price.toFixed(2)} €
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card" style={{ padding: 16, marginTop: 16 }}>
          <h2 style={{ marginTop: 0 }}>Demandes d’impression 3D</h2>

          {prints.length === 0 ? (
            <p style={{ opacity: 0.8 }}>Aucune demande.</p>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {prints.map((r) => (
                <div key={r._id} className="card" style={{ padding: 14 }}>
                  <div style={{ fontWeight: 800 }}>{r.originalName}</div>
                  <div style={{ opacity: 0.8, fontSize: 14 }}>
                    Statut: <b>{r.status}</b>
                    {r.quotePrice != null ? ` • Prix: ${r.quotePrice.toFixed(2)} €` : ""}
                  </div>
                  {r.adminMessage ? (
                    <div style={{ marginTop: 6, opacity: 0.85, fontSize: 14 }}>
                      Message admin: {r.adminMessage}
                    </div>
                  ) : null}
                  {r.notes ? (
                    <div style={{ marginTop: 6, opacity: 0.85, fontSize: 14 }}>
                      Notes: {r.notes}
                    </div>
                  ) : null}

                  {r.status === "quoted" ? (
                    <div style={{ marginTop: 10 }}>
                      <button className="btn primary" onClick={() => addPrintQuoteToCart(r)}>
                        Ajouter au panier
                      </button>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
