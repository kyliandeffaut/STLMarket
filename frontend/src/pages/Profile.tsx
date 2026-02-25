import { useEffect, useState, useContext } from "react"; // ✅ Ajout de useContext
import { useCart } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext"; // ✅ Ajout du AuthContext
import api from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  // ✅ On récupère le statut Admin pour afficher le bouton secret
  const { isAdmin } = useContext(AuthContext);

  const load = async () => {
    setLoading(true);
    try {
      // On charge uniquement les commandes (l'historique des impressions est dans /print)
      const res = await api.get("/api/orders/my");
      setOrders(res.data.orders || []);
    } catch (e) {
      console.error("Erreur chargement profil", e);
      // Si non connecté, on redirige
      if ((e as any).response?.status === 401) navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // ✅ FONCTION DE SUPPRESSION (Seulement pour toi)
  const removeOrder = async (id: string) => {
    if (!window.confirm("🛠️ MODE ADMIN : Supprimer définitivement cette commande de la base de données ?")) return;
    try {
      await api.delete(`/api/orders/${id}`);
      await load(); // On recharge la liste après suppression
    } catch (e) {
      alert("Erreur lors de la suppression. Vérifie ta route d'API.");
    }
  };

  // Fonction de téléchargement corrigée
  const downloadFile = async (fileId: string, filename: string) => {
    try {
      const response = await api.get(`/api/files/download/${fileId}`);
      
      if (response.data.downloadUrl) {
        const link = document.createElement('a');
        link.href = response.data.downloadUrl;
        link.setAttribute('download', filename || 'fichier.stl'); // Nom par défaut
        link.setAttribute('target', '_blank');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert("Lien de téléchargement introuvable.");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur lors du téléchargement. Vérifiez que vous avez bien acheté ce fichier.");
    }
  };

  return (
    <div className="container">
      {/* PANNEAU STYLE CULTS */}
      <div className="main-content-panel">
        <h1 style={{ marginTop: 0, marginBottom: "30px" }}>Mon Espace Personnel 👤</h1>

        {loading ? (
          <p style={{ textAlign: "center", padding: "40px", color: "var(--muted)" }}>Chargement de vos données...</p>
        ) : (
          <div>
            
            {/* SECTION HISTORIQUE ACHATS */}
            <div>
              <h2 style={{ fontSize: "1.4rem", marginBottom: "20px", color: "var(--accent)" }}>📦 Mes Commandes</h2>
              
              {orders.length === 0 ? (
                <div style={{ padding: "30px", textAlign: "center", border: "1px dashed rgba(255,255,255,0.2)", borderRadius: "12px" }}>
                  <p style={{ color: "var(--muted)" }}>Vous n'avez pas encore passé de commande.</p>
                  <button className="btn primary" onClick={() => navigate("/catalogue")} style={{ marginTop: "10px" }}>
                    Voir le catalogue
                  </button>
                </div>
              ) : (
                <div style={{ display: "grid", gap: "20px" }}>
                  {orders.map((o) => (
                    <div key={o._id} style={{ 
                      padding: "20px", 
                      background: "rgba(255,255,255,0.03)", 
                      borderRadius: "16px", 
                      border: "1px solid rgba(255,255,255,0.08)" 
                    }}>
                      
                      {/* En-tête de la commande */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px", borderBottom: "1px solid rgba(255,255,255,0.05)", paddingBottom: "10px", flexWrap: "wrap", gap: "10px" }}>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: "1.1rem" }}>Commande #{o._id.slice(-6).toUpperCase()}</div>
                          <div style={{ fontSize: "13px", color: "var(--muted)" }}>
                            Du {new Date(o.createdAt).toLocaleDateString()} à {new Date(o.createdAt).toLocaleTimeString()}
                          </div>
                        </div>
                        
                        {/* ✅ AFFICHAGE DU PRIX ET DU BOUTON ADMIN */}
                        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                          <span style={{ fontSize: "18px", fontWeight: "900", color: "#fff" }}>{o.totalPrice.toFixed(2)} €</span>
                          
                          {isAdmin && (
                            <button 
                              className="btn" 
                              style={{ padding: "5px 10px", color: "#ff6b6b", background: "rgba(255, 107, 107, 0.1)", border: "1px dashed rgba(255, 107, 107, 0.4)" }}
                              onClick={() => removeOrder(o._id)}
                              title="Mode Admin : Supprimer de la BDD"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Liste des articles */}
                      <div style={{ display: "grid", gap: "10px" }}>
                        {o.items.map((it: any, idx: number) => (
                          <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
                            
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                              {it.kind === 'file' ? (
                                <span style={{ fontSize: "20px" }}>💾</span>
                              ) : (
                                <span style={{ fontSize: "20px" }}>🖨️</span>
                              )}
                              <div>
                                <div style={{ fontWeight: "600" }}>{it.title}</div>
                                <div style={{ fontSize: "12px", color: "var(--muted)" }}>{it.price.toFixed(2)} €</div>
                              </div>
                            </div>

                            {/* BOUTON TÉLÉCHARGER (Seulement pour les fichiers) */}
                            {it.kind === 'file' && it.fileId && (
                              <button 
                                className="btn" 
                                style={{ padding: "6px 12px", fontSize: "13px", display: "flex", alignItems: "center", gap: "5px" }}
                                onClick={() => downloadFile(it.fileId, it.filename)}
                              >
                                📥 Télécharger
                              </button>
                            )}
                            
                            {it.kind === 'print' && (
                                <span style={{ fontSize: "12px", color: "var(--accent)", border: "1px solid var(--accent)", padding: "2px 6px", borderRadius: "4px" }}>
                                    Service Impression
                                </span>
                            )}

                          </div>
                        ))}
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}