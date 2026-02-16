import { useEffect, useState } from "react";
import api from "../lib/api";

export default function Admin() {
  const [tab, setTab] = useState<"catalog" | "prints">("prints");
  const [requests, setRequests] = useState<any[]>([]);
  const [quotePrices, setQuotePrices] = useState<{ [key: string]: number }>({});

  // États Catalogue
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Divers");

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    try {
      const res = await api.get("/api/print/all");
      setRequests(res.data);
    } catch (e) { console.error(e); }
  };

  const handleUploadCatalog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return alert("Fichier manquant");
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("price", price);
    formData.append("category", category);

    try {
      await api.post("/api/files", formData);
      alert("Produit ajouté !");
      setTitle(""); setPrice(""); setFile(null);
    } catch (error) { alert("Erreur upload"); }
  };

  const handleQuote = async (id: string) => {
    const p = quotePrices[id];
    if (!p) return alert("Prix invalide");
    try {
      await api.post(`/api/print/${id}/quote`, { price: p });
      alert("Devis envoyé ! ✅");
      loadRequests();
    } catch (e) { alert("Erreur envoi prix"); }
  };

  return (
    <div className="container">
      {/* ✅ AJOUT DU PANNEAU GLOBAL (Fond sombre + flou) */}
      <div className="main-content-panel">
        
        <h1 style={{ marginBottom: "30px" }}>Panneau Administrateur 🛡️</h1>

        {/* Onglets */}
        <div style={{ display: "flex", gap: 15, marginBottom: "40px" }}>
          <button className={`btn ${tab === "prints" ? "primary" : ""}`} onClick={() => setTab("prints")}>
            Gestion Impressions 🖨️
          </button>
          <button className={`btn ${tab === "catalog" ? "primary" : ""}`} onClick={() => setTab("catalog")}>
            Ajouter au Catalogue 📦
          </button>
        </div>

        {tab === "prints" ? (
          <div>
            <h2>Demandes de devis</h2>
            {requests.length === 0 ? <p style={{opacity: 0.7}}>Aucune demande en attente.</p> : (
              <div style={{ display: "grid", gap: "15px", marginTop: "20px" }}>
                {requests.map(r => (
                  // ✅ Carte allégée pour aller dans le panneau
                  <div key={r._id} style={{ 
                      padding: "20px", 
                      background: "rgba(255,255,255,0.05)", // Légèrement plus clair que le fond
                      borderRadius: "12px", 
                      border: "1px solid rgba(255,255,255,0.1)",
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "15px"
                  }}>
                    <div>
                      <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{r.originalName}</div>
                      <div style={{ fontSize: "14px", color: "var(--muted)" }}>Client: {r.userId?.email}</div>
                      {/* Lien de téléchargement (utile pour l'admin) */}
                      <a 
                        href={`https://stlmarket.onrender.com/print_requests/${r.storedName}`} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ fontSize: "13px", color: "var(--accent)", textDecoration: "none", marginTop: "5px", display: "inline-block" }}
                      >
                        📥 Télécharger le fichier
                      </a>
                    </div>
                    
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <input 
                        type="number" 
                        className="auth-input" 
                        style={{ width: "120px", margin: 0 }} 
                        placeholder="Prix €"
                        onChange={(e) => setQuotePrices({...quotePrices, [r._id]: parseFloat(e.target.value)})}
                      />
                      <button className="btn primary" onClick={() => handleQuote(r._id)}>Valider</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          // ✅ Formulaire centré et propre (plus de "auth-container" en double)
          <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <h2>Nouveau produit</h2>
            <form onSubmit={handleUploadCatalog} style={{ marginTop: "20px" }}>
              <div className="auth-form-group">
                <label className="auth-label">Fichier STL</label>
                <input type="file" className="auth-input" onChange={e => setFile(e.target.files?.[0] || null)} />
              </div>
              <div className="auth-form-group">
                <label className="auth-label">Titre</label>
                <input className="auth-input" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="auth-form-group">
                <label className="auth-label">Prix (€)</label>
                <input type="number" className="auth-input" value={price} onChange={e => setPrice(e.target.value)} />
              </div>
              <div className="auth-form-group">
                <label className="auth-label">Catégorie</label>
                <select className="auth-input" value={category} onChange={e => setCategory(e.target.value)}>
                    <option>Divers</option>
                    <option>Figurines</option>
                    <option>Mécanique</option>
                    <option>Déco</option>
                </select>
              </div>
              <button type="submit" className="btn-auth-submit">Mettre en vente</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}