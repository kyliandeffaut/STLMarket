import { useContext, useState } from "react";
import { AuthAPI } from "../lib/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const { login } = useContext(AuthContext);
  const nav = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { token, user } = await AuthAPI.register({ firstName, lastName, email, password });
      login(token, user);
      nav("/catalogue");
    } catch (err) {
      alert("Erreur lors de l'inscription");
    }
  };

  return (
    <div className="container">
      <div className="auth-container">
        <h1>S’inscrire</h1>
        <p style={{ color: "var(--muted)", marginBottom: "30px" }}>Rejoignez la communauté STLMarket.</p>

        <form onSubmit={onSubmit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <div className="auth-form-group">
              <label className="auth-label">Prénom</label>
              <input 
                className="auth-input" 
                placeholder="Jean"
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                required
              />
            </div>
            <div className="auth-form-group">
              <label className="auth-label">Nom</label>
              <input 
                className="auth-input" 
                placeholder="Dupont"
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
                required
              />
            </div>
          </div>

          <div className="auth-form-group">
            <label className="auth-label">Email</label>
            <input 
              className="auth-input" 
              type="email"
              placeholder="jean@exemple.fr"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
            />
          </div>

          <div className="auth-form-group">
            <label className="auth-label">Mot de passe</label>
            <input 
              className="auth-input" 
              type="password" 
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
            />
          </div>

          <button className="btn-auth-submit" type="submit">
            Créer mon compte
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "var(--muted)" }}>
          Déjà inscrit ? <Link to="/login" style={{ color: "var(--primary)" }}>Se connecter</Link>
        </p>
      </div>
    </div>
  );
}