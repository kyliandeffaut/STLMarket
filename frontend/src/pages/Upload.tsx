import { useState } from "react";
// Assure-toi d'utiliser ton instance 'api' qui contient le token d'auth
import api from "../lib/api"; 

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const onPick = (f: File | null) => {
    setMsg(null);
    if (!f) return setFile(null);

    const ext = f.name.toLowerCase().endsWith(".stl");
    if (!ext) {
      setFile(null);
      setMsg({ type: "err", text: "⚠️ Seuls les fichiers .stl sont acceptés." });
      return;
    }
    setFile(f);
  };

  const onSend = async () => {
    setMsg(null);
    if (!file) return setMsg({ type: "err", text: "Veuillez choisir un fichier .stl." });

    setLoading(true);
    
    const formData = new FormData();
    formData.append("stl", file);
    formData.append("description", notes);

    try {
      // On utilise l'appel API direct pour profiter des headers d'authentification auto
      await api.post("/api/print/request", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      setFile(null);
      setNotes("");
      setMsg({ type: "ok", text: "Demande envoyée avec succès ! Elle apparaît dans « Mon espace »." });
    } catch (e) {
      console.error(e);
      setMsg({ type: "err", text: "Erreur lors de l'envoi. Vérifiez votre connexion." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      {/* ✅ Intégration dans le panneau principal */}
      <div className="main-content-panel">
        <h1 style={{ marginTop: 0, marginBottom: "30px" }}>Nouvelle impression 3D 🖨️</h1>

        {/* CONTENEUR DU FORMULAIRE */}
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
          
          {/* ZONE FICHIER STYLE */}
          <div style={{ marginBottom: "20px" }}>
            <label className="auth-label">Votre fichier STL</label>
            <div style={{ 
              padding: "30px", 
              border: "2px dashed var(--primary)", 
              borderRadius: "12px", 
              background: "rgba(99, 102, 241, 0.05)",
              textAlign: "center"
            }}>
              <input
                type="file"
                accept=".stl"
                onChange={(e) => onPick(e.target.files?.[0] ?? null)}
                style={{ display: "none" }}
                id="file-upload"
              />
              <label htmlFor="file-upload" className="btn" style={{ cursor: "pointer", display: "inline-block", marginBottom: "10px" }}>
                📂 Choisir un fichier
              </label>
              
              <div style={{ marginTop: "10px", fontSize: "14px", color: file ? "var(--accent)" : "var(--muted)" }}>
                {file ? `Fichier sélectionné : ${file.name}` : "Aucun fichier sélectionné (Max 50Mo)"}
              </div>
            </div>
          </div>

          {/* ZONE NOTES */}
          <div style={{ marginBottom: "25px" }}>
            <label className="auth-label">Notes (Matériau, dimensions, couleur...)</label>
            <textarea
              className="auth-input"
              style={{ minHeight: 140, resize: "vertical", fontFamily: "inherit" }}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: PLA noir, 12cm de haut, remplissage solide..."
            />
          </div>

          {/* BOUTON D'ENVOI */}
          <button 
            className="btn-auth-submit" 
            onClick={onSend} 
            disabled={loading}
            style={{ opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Envoi en cours..." : "Envoyer la demande 🚀"}
          </button>

          {/* MESSAGES DE FEEDBACK */}
          {msg && (
            <div style={{ 
              marginTop: "20px", 
              padding: "15px", 
              borderRadius: "10px", 
              background: msg.type === "ok" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
              border: `1px solid ${msg.type === "ok" ? "#10b981" : "#ef4444"}`,
              color: msg.type === "ok" ? "#10b981" : "#ef4444",
              fontWeight: "bold",
              textAlign: "center"
            }}>
              {msg.type === "ok" ? "✅ " : "❌ "}
              {msg.text}
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
}