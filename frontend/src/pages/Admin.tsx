import { useEffect, useState } from "react";
import api from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function Admin() {
  const [tab, setTab] = useState<"catalog" | "prints">("prints");
  
  // --- ÉTATS CATALOGUE ---
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Divers");
  
  // --- ÉTATS IMPRESSIONS ---
  const [requests, setRequests] = useState<any[]>([]);
  const [quotePrices, setQuotePrices] = useState<{ [key: string]: number }>({});

  const navigate = useNavigate();

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    try {
      // 👇 Correction URL
      const res = await api.get("/api/print/all");
      setRequests(res.data);
    } catch (e) {
      console.error("Erreur chargement demandes", e);
    }
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
      // 👇 Correction URL
      await api.post("/api/files", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Produit ajouté au catalogue !");
      setTitle(""); setPrice(""); setFile(null);
    } catch (error) {
      alert("Erreur upload catalogue");
    }
  };

  const handleQuote = async (id: string) => {
    const p = quotePrices[id];
    if (!p || p <= 0) return alert("Prix invalide");

    try {
      // 👇 Correction URL
      await api.post(`/api/print/${id}/quote`, { price: p });
      alert("Devis envoyé au client ! ✅");
      loadRequests();
    } catch (e) {
      alert("Erreur lors de l'envoi du prix");
    }
  };

  // ... (Le reste du return reste identique à ton code visuel)
  // Je ne remets que le début pour économiser de la place,
  // garde ton JSX (return ...) tel quel, il est très bien !
  return (
    <div className="container" style={{ padding: "40px 20px" }}>
      <h1>Panneau Administrateur 🛡️</h1>

      {/* Navigation Onglets */}
      <div style={{ display: "flex", gap: 10, marginBottom: 30 }}>
        <button 
            className={`btn ${tab === "prints" ? "primary" : ""}`} 
            onClick={() => setTab("prints")}
        >
            Gestion Impressions 🖨️
        </button>
        <button 
            className={`btn ${tab === "catalog" ? "primary" : ""}`} 
            onClick={() => setTab("catalog")}
        >
            Ajouter au Catalogue 📦
        </button>
      </div>

      {/* --- ONGLET 1 : DEMANDES D'IMPRESSION --- */}
      {tab === "prints" && (
        <div className="card" style={{ padding: 24 }}>
            <h2>Demandes de devis en attente</h2>
            {requests.length === 0 ? (
                <p style={{ opacity: 0.6 }}>Aucune demande en attente.</p>
            ) : (
                <div style={{ display: "grid", gap: 16 }}>
                    {requests.map((r) => (
                        <div key={r._id} style={{ 
                            border: "1px solid var(--border)", 
                            padding: 16, 
                            borderRadius: 8,
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            background: "rgba(255,255,255,0.02)"
                        }}>
                            <div style={{ maxWidth: "60%" }}>
                                <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>{r.originalName}</div>
                                <div style={{ margin: "10px 0", padding: "10px", background: "rgba(255, 255, 255, 0.05)", borderRadius: "6px", borderLeft: "4px solid var(--primary)", fontSize: "0.95rem", lineHeight: "1.4" }}>
                                    📝 <strong>Demande client :</strong> <br/>
                                    <span style={{ opacity: 0.9 }}>{r.description || "Aucune précision."}</span>
                                </div>
                                <div style={{ fontSize: 13, opacity: 0.7 }}>
                                    Client : {r.userId?.email || "Anonyme"} • {new Date(r.createdAt).toLocaleDateString()}
                                </div>
                                {/* 👇 LIEN DE TÉLÉCHARGEMENT CORRIGÉ (POINTE VERS RENDER) 👇 */}
                                <div style={{ marginTop: 8 }}>
                                    <a 
                                        href={`https://stlmarket.onrender.com/print_requests/${r.storedName}`} 
                                        target="_blank" 
                                        style={{ color: "var(--primary)", textDecoration: "underline" }}
                                    >
                                        📥 Télécharger le STL pour analyse
                                    </a>
                                </div>
                            </div>

                            <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 5 }}>
                                <input 
                                    type="number" 
                                    placeholder="Prix du devis (€)"
                                    style={{ width: 120, padding: 8, borderRadius: 4, border: "1px solid #444", background: "#222", color: "white" }}
                                    onChange={(e) => setQuotePrices({...quotePrices, [r._id]: parseFloat(e.target.value)})}
                                />
                                <button className="btn primary" onClick={() => handleQuote(r._id)}>
                                    Valider
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
      )}

      {/* --- ONGLET 2 : AJOUT CATALOGUE --- */}
      {tab === "catalog" && (
        <div className="card" style={{ padding: 24, maxWidth: 600 }}>
            <h2>Ajouter un fichier STL au catalogue</h2>
            <form onSubmit={handleUploadCatalog} style={{ display: "grid", gap: 16 }}>
                <div>
                    <label>Fichier STL</label>
                    <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
                </div>
                <div>
                    <label>Titre du produit</label>
                    <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div>
                    <label>Prix (€)</label>
                    <input className="input" type="number" step="0.5" value={price} onChange={(e) => setPrice(e.target.value)} required />
                </div>
                <div>
                    <label>Catégorie</label>
                    <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option>Divers</option>
                        <option>Figurines</option>
                        <option>Mécanique</option>
                        <option>Déco</option>
                    </select>
                </div>
                <button type="submit" className="btn primary">Mettre en vente</button>
            </form>
        </div>
      )}
    </div>
  );
}