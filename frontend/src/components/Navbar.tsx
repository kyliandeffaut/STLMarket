import { useContext, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// Gestion de la classe active pour le style
const activeClass = ({ isActive }: { isActive: boolean }) => 
  isActive ? "nav-item active" : "nav-item";

export default function Navbar() {
  // ✅ On ajoute isAdmin ici pour savoir si l'utilisateur a les droits
  const { token, user, isAdmin, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="nav-logo" onClick={() => setIsOpen(false)}>
          🧩 STLMarket
        </Link>

        {/* BOUTON BURGER POUR MOBILE */}
        <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "✕" : "☰"}
        </button>

        <nav className={`nav-links ${isOpen ? "open" : ""}`}>
          <NavLink to="/catalogue" className={activeClass} onClick={() => setIsOpen(false)}>Catalogue</NavLink>
          <NavLink to="/print" className={activeClass} onClick={() => setIsOpen(false)}>Impression 3D</NavLink>
          <NavLink to="/cart" className={activeClass} onClick={() => setIsOpen(false)}>Panier</NavLink>

          {/* ✅ LIEN ADMIN : Apparaît uniquement si l'utilisateur est admin */}
          {isAdmin && (
            <NavLink 
              to="/admin" 
              className={activeClass} 
              onClick={() => setIsOpen(false)}
              style={{ color: "var(--accent)", fontWeight: "bold" }}
            >
              Admin 🛡️
            </NavLink>
          )}

          <NavLink to="/profile" className={activeClass} onClick={() => setIsOpen(false)}>Mon espace</NavLink>

          {token ? (
            <div className="nav-auth-mobile">
              <span className="user-name-display">{user?.firstName}</span>
              <button 
                onClick={logout} 
                className="btn" 
                style={{ background: "rgba(255, 107, 107, 0.1)", color: "#ff6b6b", border: "1px solid rgba(255, 107, 107, 0.2)" }}
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="nav-auth-mobile">
              <NavLink to="/login" className="btn ghost" onClick={() => setIsOpen(false)}>Connexion</NavLink>
              <NavLink to="/register" className="btn primary" onClick={() => setIsOpen(false)}>S'inscrire</NavLink>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}