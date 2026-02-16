import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, NavLink } from "react-router-dom";

const activeClass = ({ isActive }: { isActive: boolean }) => 
  isActive ? "nav-item active" : "nav-item";

export default function Navbar() {
  const { token, user, isAdmin, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="navbar-container">
        <Link to="/" className="nav-logo" onClick={() => setIsOpen(false)}>
          🧩 STLMarket
        </Link>

        <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "✕" : "☰"}
        </button>

        <nav className={`nav-links ${isOpen ? "open" : ""}`}>
          <NavLink to="/catalogue" className={activeClass} onClick={() => setIsOpen(false)}>Catalogue</NavLink>
          <NavLink to="/print" className={activeClass} onClick={() => setIsOpen(false)}>Impression 3D</NavLink>
          <NavLink to="/cart" className={activeClass} onClick={() => setIsOpen(false)}>Panier</NavLink>
          <NavLink to="/profile" className={activeClass} onClick={() => setIsOpen(false)}>Mon espace</NavLink>

          {token ? (
            <div style={{ display: "flex", alignItems: "center", gap: 15 }}>
              <span style={{ fontSize: 14, opacity: 0.8 }}>{user?.firstName}</span>
              <button onClick={logout} className="btn" style={{ background: "rgba(255,0,0,0.1)", color: "#ff6b6b" }}>Déconnexion</button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 10 }}>
              <NavLink to="/login" className="btn ghost" onClick={() => setIsOpen(false)}>Connexion</NavLink>
              <NavLink to="/register" className="btn primary" onClick={() => setIsOpen(false)}>S'inscrire</NavLink>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}