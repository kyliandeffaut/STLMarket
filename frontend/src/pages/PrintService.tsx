import { useState, useEffect } from "react";

import api from "../lib/api";
import { useCart } from "../context/CartContext";

export default function PrintService() {
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [requests, setRequests] = useState<any[]>([]);
  const { addItem } = useCart();

  useEffect(() => {
      // 👇 Utilisation de api.get (URL propre)
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
      // 👇 Utilisation de api.post (URL propre + header token auto)
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
    <div className="container" style={{ padding: "40px 20px" }}>
      <h1>🖨️ Service d'Impression à la demande</h1>
      
      {/* ZONE D'UPLOAD */}
      <div className="card" style={{ padding: 30, marginTop: 20, border: "2px dashed var(--primary)" }}>
        <h3>1. Nouvelle demande</h3>
        <form onSubmit={handleUpload} style={{ display: "grid", gap: 15, maxWidth: 600 }}>
          
          <div>
            <label style={{display: "block", marginBottom: 5}}>Votre fichier STL :</label>
            <input 
                type="file" 
                accept=".stl"
                onChange={(e) => setFile(e.target.files?.[0] || null)} 
                required 
            />
          </div>

          <div>
            <label style={{display: "block", marginBottom: 5}}>Détails (Taille, couleur, matériau, remplissage...) :</label>
            <textarea 
                className="input" 
                rows={3}
                placeholder="Ex: En noir, environ 10cm de haut, remplissage solide..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ width: "100%", fontFamily: "inherit" }}
                required
            />
          </div>

          <button type="submit" className="btn primary" style={{justifySelf: "start"}}>
            Envoyer la demande
          </button>
        </form>
      </div>

      {/* LISTE DES DEMANDES */}
      <h3 style={{ marginTop: 40 }}>2. Suivi de mes demandes</h3>
      <div style={{ display: "grid", gap: 15 }}>
        {requests.map(r => (
            <div key={r._id} className="card" style={{ padding: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                        <strong style={{fontSize: "1.1rem"}}>{r.originalName}</strong>
                        <p style={{ margin: "5px 0", fontSize: "0.9rem", opacity: 0.8, background: "rgba(255,255,255,0.05)", padding: 8, borderRadius: 4 }}>
                            📝 {r.description}
                        </p>
                        <div style={{ fontSize: 14, marginTop: 5 }}>
                            Statut : 
                            {r.status === "pending" && <span style={{color: "orange"}}> En attente ⏳</span>}
                            {r.status === "quoted" && <span style={{color: "#4ade80"}}> Devis prêt ! ✅</span>}
                            {r.status === "paid" && <span style={{color: "var(--primary)"}}> Payé 🚀</span>}
                        </div>
                    </div>

                    {r.status === "quoted" && (
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                            <span style={{ fontSize: 24, fontWeight: "bold" }}>{r.quotePrice} €</span>
                            <button className="btn primary" onClick={() => addToCart(r)}>Ajouter au panier 🛒</button>
                        </div>
                    )}
                </div>
            </div>
        ))}
      </div>
    </div>
  );
}