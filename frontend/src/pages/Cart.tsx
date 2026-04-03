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
      // 2. Préparation des données
      const payload: OrderItemDTO[] = items.map((it) => {
        
        // NETTOYAGE : On enlève le préfixe "print_" ou "file_"
        const realId = it._id.replace(/^(file_|print_)/, "");

        // CAS 1 : C'est un FICHIER 3D
        if (it.kind === "file") {
          return {
            kind: "file",
            fileId: realId,
            title: it.title,
            price: it.price,
            quantity: it.quantity,
            filename: it.filename,
          };
        }

        // CAS 2 : C'est une IMPRESSION 3D
        return {
          kind: "print",
          requestId: realId,
          title: it.title,
          price: it.price,
          quantity: it.quantity,
        };
      });

      console.log("Envoi de la commande au serveur...", payload);

      // 3. Envoi de la commande
      await OrdersAPI.create(payload);

      // 4. Succès
      clear(); // On vide le panier
      alert("Paiement validé avec succès !");
      navigate("/profile"); // On redirige vers le profil

    } catch (e: any) {
      console.error("Erreur paiement:", e);
      const msg = e.response?.data?.message || e.response?.data?.error || "Erreur de connexion au serveur";
      alert(`Échec du paiement : ${msg}`);
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="container">
      {/* ENVELOPPE GLOBALE POUR LA LISIBILITÉ */}
      <div className="main-content-panel">
        
        <h1 style={{ marginTop: 0, marginBottom: "30px" }}>Mon Panier 🛒</h1>

        {items.length === 0 ? (
          // PANIER VIDE
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ fontSize: "1.2rem", color: "var(--muted)", marginBottom: "20px" }}>
              Votre panier est vide pour le moment.
            </p>
            <button className="btn primary" onClick={() => navigate("/catalogue")}>
              Parcourir le catalogue
            </button>
          </div>
        ) : (
          // CONTENU DU PANIER
          <>
            <div style={{ display: "grid", gap: "15px" }}>
              {items.map((it) => (
                <div
                  key={it._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "20px",
                    background: "rgba(255,255,255,0.03)", // Carte translucide
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.05)",
                    flexWrap: "wrap",
                    gap: "15px"
                  }}
                >
                  {/* Info Produit */}
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <div style={{ fontWeight: 700, fontSize: "1.1rem", marginBottom: "4px" }}>
                      {it.title}
                    </div>
                    <div style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
                      {it.kind === "print" ? "Impression 3D" : "Fichier STL"} • {it.price.toFixed(2)} € / unité
                    </div>
                  </div>

                  {/* Contrôles (Quantité + Supprimer) */}
                  <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                    
                    {/* Selecteur Quantité */}
                    <div style={{ display: "flex", alignItems: "center", background: "rgba(0,0,0,0.3)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.1)" }}>
                      <button 
                        className="btn" 
                        style={{ border: "none", padding: "5px 12px", background: "transparent", color: "var(--text)" }} 
                        onClick={() => decreaseItem(it._id)}
                      >
                        −
                      </button>
                      <span style={{ fontWeight: "bold", minWidth: "30px", textAlign: "center" }}>
                        {it.quantity}
                      </span>
                      <button 
                        className="btn" 
                        style={{ border: "none", padding: "5px 12px", background: "transparent", color: "var(--text)" }} 
                        onClick={() => addItem(it, 1)}
                      >
                        +
                      </button>
                    </div>

                    {/* Prix total ligne */}
                    <span style={{ fontWeight: "bold", minWidth: "70px", textAlign: "right", fontSize: "1.1rem" }}>
                        {(it.price * it.quantity).toFixed(2)} €
                    </span>

                    {/* Bouton Supprimer */}
                    <button
                      className="btn"
                      style={{ color: "#ff6b6b", borderColor: "rgba(255, 107, 107, 0.3)", padding: "8px 12px" }}
                      onClick={() => removeItem(it._id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* FOOTER DU PANIER*/}
            <div
              style={{
                marginTop: "40px",
                paddingTop: "30px",
                borderTop: "1px solid rgba(255,255,255,0.1)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "20px",
              }}
            >
              <div>
                <div style={{ fontSize: "14px", color: "var(--muted)", marginBottom: "5px" }}>Total de la commande</div>
                <div style={{ fontSize: "36px", fontWeight: "900", color: "var(--accent)", textShadow: "0 0 20px rgba(34, 211, 238, 0.3)" }}>
                  {subtotal.toFixed(2)} €
                </div>
              </div>

              <div style={{ display: "flex", gap: "15px" }}>
                <button 
                  className="btn" 
                  onClick={clear} 
                  disabled={paying}
                  style={{ background: "rgba(255,255,255,0.05)" }}
                >
                  Vider le panier
                </button>
                <button
                  className="btn primary"
                  onClick={onPay}
                  disabled={paying}
                  style={{ padding: "14px 32px", fontSize: "1.1rem" }}
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