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
    <div className="container" style={{ padding: "40px 20px" }}>
      <h1 style={{ marginBottom: "30px" }}>Panneau Administrateur 🛡️</h1>

      {/* Onglets style Cults */}
      <div style={{ display: "flex", gap: 15, marginBottom: "40px" }}>
        <button className={`btn ${tab === "prints" ? "primary" : ""}`} onClick={() => setTab("prints")}>
          Gestion Impressions 🖨️
        </button>
        <button className={`btn ${tab === "catalog" ? "primary" : ""}`} onClick={() => setTab("catalog")}>
          Ajouter au Catalogue 📦
        </button>
      </div>

      {tab === "prints" ? (
        <div className="card" style={{ padding: "30px" }}>
          <h2>Demandes de devis</h2>
          <div style={{ display: "grid", gap: "20px", marginTop: "20px" }}>
            {requests.map(r => (
              <div key={r._id} className="product-card" style={{ padding: "20px", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: "bold" }}>{r.originalName}</div>
                  <div style={{ fontSize: "14px", color: "var(--muted)" }}>Client: {r.userId?.email}</div>
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
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
        </div>
      ) : (
        <div className="auth-container" style={{ margin: "0", maxWidth: "600px" }}>
          <h2>Nouveau produit</h2>
          <form onSubmit={handleUploadCatalog} className="auth-form-group" style={{ marginTop: "20px" }}>
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
            <button type="submit" className="btn-auth-submit">Mettre en vente</button>
          </form>
        </div>
      )}
    </div>
  );
}