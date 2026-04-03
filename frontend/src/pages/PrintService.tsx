import { useState, useEffect } from "react";
import api from "../lib/api";
import { useCart } from "../context/CartContext";

export default function PrintService() {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [requests, setRequests] = useState<any[]>([]);
  const { addItem } = useCart();

  useEffect(() => {
    api.get("/api/print/my")
      .then(res => setRequests(Array.isArray(res.data) ? res.data : []))
      .catch(err => console.error("Erreur chargement prints", err));
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Veuillez choisir un fichier.");

    const formData = new FormData();
    formData.append("stl", file); 
    formData.append("description", description);

    try {
      await api.post("/api/print/request", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Demande envoyée avec succès !");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Erreur d'envoi. Vérifiez que vous êtes connecté.");
    }
  };

  const addToCart = (req: any) => {
    addItem({
      _id: `print_${req._id}`,
      kind: "print",
      title: "Impression 3D : " + req.originalName,
      price: req.quotePrice,
      category: "Service",
      filename: req.storedName
    }, 1);
    alert("Ajouté au panier !");
  };

  return (
    <div className="container">
      <div className="main-content-panel">
        
        <h1 style={{ marginTop: 0, marginBottom: "30px" }}>🖨️ Service d'Impression à la demande</h1>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "40px" }}>
          
          {/* ZONE 1 : FORMULAIRE */}
          <div>
            <h2 style={{ fontSize: "1.2rem", marginBottom: "15px", color: "var(--accent)" }}>1. Nouvelle demande</h2>
            
            <div style={{ 
              padding: "30px", 
              border: "2px dashed var(--primary)", 
              borderRadius: "16px", 
              background: "rgba(99, 102, 241, 0.05)" 
            }}>
              <form onSubmit={handleUpload} style={{ display: "grid", gap: 20 }}>
                
                <div>
                  <label className="auth-label">Votre fichier STL</label>
                  <input 
                    type="file" 
                    className="auth-input"
                    style={{ padding: "10px" }}
                    accept=".stl"
                    onChange={(e) => setFile(e.target.files?.[0] || null)} 
                    required 
                  />
                  <small style={{ color: "var(--muted)", marginTop: "5px", display: "block" }}>Format .stl uniquement (Max 50Mo)</small>
                </div>

                <div>
                  <label className="auth-label">Détails de l'impression</label>
                  <textarea 
                    className="auth-input" 
                    rows={4}
                    placeholder="Ex: En PLA Noir, remplissage 20%, hauteur de couche 0.2mm..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ resize: "vertical", fontFamily: "inherit" }}
                    required
                  />
                </div>

                <button type="submit" className="btn primary" style={{ justifySelf: "start", minWidth: "200px" }}>
                  Envoyer la demande 🚀
                </button>
              </form>
            </div>
          </div>

          {/* ZONE 2 : LISTE DES DEMANDES */}
          <div>
            <h2 style={{ fontSize: "1.2rem", marginBottom: "15px", color: "var(--accent)" }}>2. Suivi de mes demandes</h2>
            
            {requests.length === 0 ? (
              <p style={{ color: "var(--muted)", fontStyle: "italic" }}>Aucune demande en cours.</p>
            ) : (
              <div style={{ display: "grid", gap: "15px" }}>
                {requests.map(r => (
                  <div key={r._id} style={{ 
                    padding: "20px", 
                    background: "rgba(255,255,255,0.03)", 
                    borderRadius: "12px", 
                    border: "1px solid rgba(255,255,255,0.08)",
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "20px"
                  }}>
                    <div style={{ flex: 1, minWidth: "250px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
                        <strong style={{ fontSize: "1.1rem" }}>{r.originalName}</strong>
                        {/* BADGES DE STATUT */}
                        {r.status === "pending" && <span style={badgeStyle("#f59e0b")}>⏳ En attente</span>}
                        {r.status === "quoted" && <span style={badgeStyle("#10b981")}>✅ Devis prêt</span>}
                        {r.status === "paid" && <span style={badgeStyle("#6366f1")}>🚀 En production</span>}
                      </div>
                      
                      <p style={{ margin: "5px 0", fontSize: "0.9rem", color: "var(--muted)" }}>
                         {new Date(r.createdAt).toLocaleDateString()} • {r.description || "Pas de description"}
                      </p>
                    </div>

                    {/* ACTION SI DEVIS PRÊT */}
                    {r.status === "quoted" && (
                      <div style={{ display: "flex", alignItems: "center", gap: "15px", background: "rgba(16, 185, 129, 0.1)", padding: "10px 15px", borderRadius: "10px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: "12px", color: "#10b981", display: "block" }}>Prix proposé</span>
                          <span style={{ fontSize: "20px", fontWeight: "900", color: "#fff" }}>{r.quotePrice} €</span>
                        </div>
                        <button className="btn primary" onClick={() => addToCart(r)}>
                           Payer
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}

// Petit helper pour le style des badges
const badgeStyle = (color: string) => ({
  fontSize: "12px",
  fontWeight: "bold",
  color: color,
  background: `${color}20`, // 20% d'opacité
  padding: "4px 8px",
  borderRadius: "6px",
  border: `1px solid ${color}40`
});