import { useState } from "react";
import { PrintAPI } from "@lib/api";

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
      setMsg({ type: "err", text: "Seuls les fichiers .stl sont acceptés." });
      return;
    }
    setFile(f);
  };

  const onSend = async () => {
    setMsg(null);
    if (!file) return setMsg({ type: "err", text: "Choisis un fichier .stl." });

    setLoading(true);
    try {
      await PrintAPI.create(file, notes);
      setFile(null);
      setNotes("");
      setMsg({ type: "ok", text: "Demande envoyée ✅ Elle apparaît dans « Mon espace »." });
    } catch (e) {
      console.error(e);
      setMsg({ type: "err", text: "Erreur : connecte-toi ou vérifie le serveur." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "24px 16px" }}>
      <div className="card" style={{ padding: 20 }}>
        <h1 style={{ marginTop: 0 }}>Demande d'impression 3D</h1>

        <label style={{ display: "block", marginTop: 12, marginBottom: 6, opacity: 0.9 }}>
          Votre fichier STL
        </label>

        <input
          className="input"
          type="file"
          accept=".stl"
          onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        />

        <label style={{ display: "block", marginTop: 16, marginBottom: 6, opacity: 0.9 }}>
          Notes (dimensions, matériaux, couleur...)
        </label>

        <textarea
          className="input"
          style={{ minHeight: 140, resize: "vertical" }}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Ex: PLA noir, 12cm, 30% infill..."
        />

        <div style={{ marginTop: 16 }}>
          <button className="btn primary" onClick={onSend} disabled={loading}>
            {loading ? "Envoi..." : "Envoyer la demande"}
          </button>
        </div>

        {msg && (
          <div style={{ marginTop: 12 }}>
            <span style={{ color: msg.type === "ok" ? "#57d38c" : "#ff6b6b", fontWeight: 700 }}>
              {msg.type === "ok" ? "✅ " : "❌ "}
              {msg.text}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
