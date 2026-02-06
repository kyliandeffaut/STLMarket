import { useContext, useState } from "react";
import { AuthAPI } from "../lib/api";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { login } = useContext(AuthContext);
  const nav = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { token, user } = await AuthAPI.register({ firstName, lastName, email, password });
    login(token, user);
    nav("/catalogue");
  };

  return (
    <div className="container" style={{ padding: "24px 16px" }}>
      <div className="card" style={{ padding: 20, maxWidth: 520, margin: "0 auto" }}>
        <h1 style={{ marginTop: 0 }}>S’inscrire</h1>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
          <div>
            <label>Prénom :</label>
            <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </div>
          <div>
            <label>Nom :</label>
            <input className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>
          <div>
            <label>Email :</label>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label>Mot de passe :</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>

          <button className="btn primary" type="submit">Créer le compte</button>
        </form>
      </div>
    </div>
  );
}
