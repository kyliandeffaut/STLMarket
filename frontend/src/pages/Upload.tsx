import { useState } from "react";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");

  return (
    <section className="container">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Demande d'impression 3D</h2>
        <label className="label">Votre fichier STL</label>
        <input className="file" type="file" accept=".stl" onChange={e => setFile(e.target.files?.[0] ?? null)} />
        <div className="spacer"></div>
        <label className="label">Notes (dimensions, matériaux, couleur…)</label>
        <textarea className="input" rows={5} value={notes} onChange={e => setNotes(e.target.value)} />
        <div className="spacer"></div>
        <button className="btn primary" onClick={() => alert(`Fichier: ${file?.name ?? "aucun"}\nNotes: ${notes}`)}>
          Envoyer la demande
        </button>
      </div>
    </section>
  );
}
