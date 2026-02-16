import { useContext, useState } from "react";
import { AuthAPI } from "../lib/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const { login } = useContext(AuthContext);
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { token, user } = await AuthAPI.login({ email, password });
      login(token, user);
      nav("/catalogue");
    } catch (err) { alert("Erreur de connexion"); }
  };

  return (
    <div className="container">
      <div className="auth-container">
        <h1>Se connecter</h1>
        <p style={{ color: "var(--muted)", marginBottom: "30px" }}>Bon retour parmi nous !</p>
        <form onSubmit={onSubmit}>
          <div className="auth-form-group">
            <label className="auth-label">Adresse e-mail</label>
            <input className="auth-input" type="email" placeholder="votre@email.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="auth-form-group">
            <label className="auth-label">Mot de passe</label>
            <input className="auth-input" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="btn-auth-submit" type="submit">Se connecter</button>
        </form>
        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "var(--muted)" }}>
          Pas encore de compte ? <Link to="/register" style={{ color: "var(--primary)", textDecoration: "none" }}>S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}