import { useState, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    try {
      const res = await axios.post("http://localhost:3000/api/users/login", {
        email,
        password,
      });

      if (res.data.ok) {
        login(res.data.token);
        setMessage({ type: "success", text: "✅ Connexion validée !" });
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 401)
        setMessage({ type: "error", text: "❌ Email ou mot de passe incorrect." });
      else
        setMessage({ type: "error", text: "⚠️ Erreur de connexion au serveur." });
    }
  }

  return (
    <div className="card" style={{ maxWidth: 400, margin: "60px auto", padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>Se connecter</h2>

      {/* ✅ disposition en colonne */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <label>
          Adresse e-mail :
          <input
            type="email"
            placeholder="exemple@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: "100%", marginTop: 4 }}
          />
        </label>

        <label>
          Mot de passe :
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: "100%", marginTop: 4 }}
          />
        </label>

        <button
          type="submit"
          className="btn-primary"
          style={{
            marginTop: 12,
            padding: "8px 0",
            borderRadius: 6,
            background: "var(--primary)",
            color: "white",
            fontWeight: 500,
            cursor: "pointer",
            border: "none",
          }}
        >
          Se connecter
        </button>
      </form>

      {/* ✅ message sous le formulaire */}
      {message && (
        <p
          style={{
            marginTop: 14,
            color: message.type === "error" ? "#ff5c5c" : "#3cb371",
            fontWeight: 500,
          }}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
