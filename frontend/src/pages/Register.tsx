import { useState } from "react";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    try {
      const res = await axios.post("http://localhost:3000/api/users/register", form);

      if (res.data.ok) {
        setMessage({ type: "success", text: "✅ Inscription validée !" });
        setForm({ firstName: "", lastName: "", email: "", password: "" });
      }
    } catch (err: any) {
      console.error(err);
      if (err.response?.data?.error === "email_already_used")
        setMessage({ type: "error", text: "❌ Cette adresse e-mail est déjà utilisée." });
      else
        setMessage({ type: "error", text: "⚠️ Erreur lors de l’inscription." });
    }
  }

  return (
    <div className="card" style={{ maxWidth: 400, margin: "60px auto", padding: 24 }}>
      <h2 style={{ marginBottom: 16 }}>Créer un compte</h2>

      {/* ✅ disposition verticale */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <label>
          Prénom :
          <input
            type="text"
            placeholder="Votre prénom"
            value={form.firstName}
            onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            required
            style={{ width: "100%", marginTop: 4 }}
          />
        </label>

        <label>
          Nom :
          <input
            type="text"
            placeholder="Votre nom"
            value={form.lastName}
            onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            required
            style={{ width: "100%", marginTop: 4 }}
          />
        </label>

        <label>
          Adresse e-mail :
          <input
            type="email"
            placeholder="exemple@email.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
            style={{ width: "100%", marginTop: 4 }}
          />
        </label>

        <label>
          Mot de passe :
          <input
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
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
          Créer un compte
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
