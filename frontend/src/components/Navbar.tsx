import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, NavLink } from "react-router-dom";

const activeClass = ({ isActive }: { isActive: boolean }) => 
  isActive ? "nav-item active" : "nav-item";

export default function Navbar() {
  const { token, user, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="nav-logo">
          🧩 STLMarket
        </Link>

        <nav className={`nav-links ${isOpen ? "open" : ""}`}>
          <NavLink to="/catalogue" className={activeClass}>Catalogue</NavLink>
          <NavLink to="/print" className={activeClass}>Impression 3D</NavLink>
          <NavLink to="/cart" className={activeClass}>Panier</NavLink>
          <NavLink to="/profile" className={activeClass}>Mon espace</NavLink>

          {token ? (
            <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
              <span style={{ fontSize: 14, opacity: 0.8 }}>{user?.firstName}</span>
              <button onClick={logout} className="btn" style={{ color: "#ff6b6b" }}>Déconnexion</button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <NavLink to="/login" className="btn ghost">Connexion</NavLink>
              <NavLink to="/register" className="btn primary">S'inscrire</NavLink>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}