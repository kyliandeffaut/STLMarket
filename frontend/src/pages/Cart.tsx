import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { OrdersAPI, OrderItemDTO } from "../lib/api";

export default function Cart() {
  const { items, subtotal, addItem, decreaseItem, removeItem, clear } = useCart();
  const [paying, setPaying] = useState(false);
  const navigate = useNavigate();

  const onPay = async () => {
    // 1. Vérifications de base
    if (items.length === 0 || paying) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Tu dois être connecté pour passer commande !");
      navigate("/login");
      return;
    }

    setPaying(true);
    try {
      // 2. Préparation des données (LE CORRECTIF EST ICI)
      const payload: OrderItemDTO[] = items.map((it) => {
        
        // 🧹 NETTOYAGE CRITIQUE : On enlève le préfixe "print_" ou "file_" s'il existe
        // Le serveur attend "697b..." et non "print_697b..."
        const realId = it._id.replace(/^(file_|print_)/, "");

        // --- CAS 1 : C'est un FICHIER 3D ---
        if (it.kind === "file") {
          return {
            kind: "file",
            fileId: realId, // ✅ ID propre
            title: it.title,
            price: it.price,
            quantity: it.quantity,
            filename: it.filename,
          };
        }

        // --- CAS 2 : C'est une IMPRESSION 3D ---
        return {
          kind: "print",
          requestId: realId, // ✅ ID propre
          title: it.title,
          price: it.price,
          quantity: it.quantity,
          // Pas besoin de filename ici
        };
      });

      console.log("Envoi de la commande au serveur...", payload);

      // 3. Envoi de la commande
      await OrdersAPI.create(payload);

      // 4. Succès
      clear(); // On vide le panier
      alert("Paiement validé avec succès ! 🎉");
      navigate("/profile"); // On redirige vers le profil

    } catch (e: any) {
      console.error("Erreur paiement:", e);
      // On récupère le message d'erreur précis du serveur
      const msg = e.response?.data?.message || e.response?.data?.error || "Erreur de connexion au serveur";
      alert(`Échec du paiement : ${msg}`);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <div className="card" style={{ padding: 24 }}>
        <h1 style={{ marginTop: 0, fontSize: "2rem" }}>Panier</h1>

        {items.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", opacity: 0.6 }}>
            <p style={{ fontSize: "1.2rem" }}>Votre panier est vide.</p>
            <button className="btn" onClick={() => navigate("/")}>Retourner au catalogue</button>
          </div>
        ) : (
          <>
            {/* Liste des produits */}
            <div style={{ display: "grid", gap: 16 }}>
              {items.map((it) => (
                <div
                  key={it._id}
                  className="card"
                  style={{
                    padding: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 16,
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.05)"
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: 4 }}>
                      {it.title}
                    </div>
                    <div style={{ opacity: 0.6, fontSize: 14 }}>
                      {it.kind === "print" ? "🖨️ Impression 3D" : "💾 Fichier STL"} • {it.price.toFixed(2)} € / unité
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    {/* Contrôles Quantité */}
                    <div className="row" style={{ background: "rgba(0,0,0,0.3)", borderRadius: 8, padding: 2 }}>
                      <button className="btn ghost" style={{ padding: "6px 12px" }} onClick={() => decreaseItem(it._id)}>−</button>
                      <span style={{ fontWeight: "bold", minWidth: 24, textAlign: "center" }}>{it.quantity}</span>
                      <button className="btn ghost" style={{ padding: "6px 12px" }} onClick={() => addItem(it, 1)}>+</button>
                    </div>

                    <button
                      className="btn"
                      style={{ color: "var(--danger)", borderColor: "rgba(248, 81, 73, 0.4)", background: "transparent" }}
                      onClick={() => removeItem(it._id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Total et Bouton Payer */}
            <div
              style={{
                marginTop: 30,
                paddingTop: 20,
                borderTop: "1px solid var(--border)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 20,
              }}
            >
              <div>
                <div style={{ fontSize: 14, opacity: 0.6 }}>Total de la commande</div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "var(--primary)" }}>
                  {subtotal.toFixed(2)} €
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button className="btn" onClick={clear} disabled={paying}>
                  Vider le panier
                </button>
                <button
                  className="btn primary"
                  onClick={onPay}
                  disabled={paying}
                  style={{ padding: "12px 32px", fontSize: "1.1rem" }}
                >
                  {paying ? "Traitement..." : "Payer la commande"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}