import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function Account() {
  const [me, setMe] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/users/me")
      .then((res) => setMe(res.data.user))
      .catch(() => setError("Vous n'êtes pas connecté."));
  }, []);

  if (error) {
    return (
      <div className="card">
        <h2>Mon espace</h2>
        <p>{error}</p>
        <a className="btn" href="/login">Se connecter</a>
      </div>
    );
  }

  if (!me) return <div className="card">Chargement…</div>;

  return (
    <div className="card">
      <h2>Bonjour, {me.firstName}</h2>
      <p>Email : {me.email}</p>
      <p>Rôle : {me.role}</p>
      <button
        className="btn"
        onClick={() => { localStorage.removeItem("token"); location.reload(); }}
      >
        Se déconnecter
      </button>
    </div>
  );
}
