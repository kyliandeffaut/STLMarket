import { useContext, useState } from "react";
import { Link, NavLink } from "react-router-dom"; // ✅ Ajouté pour corriger l'erreur NavLink
import { AuthContext } from "../context/AuthContext"; // ✅ Vérifie que le chemin vers ton context est bon

// ✅ Ajouté pour corriger l'erreur activeClass
const activeClass = ({ isActive }: { isActive: boolean }) => 
  isActive ? "nav-item active" : "nav-item";

export default function Navbar() {
  const { token, user, logout } = useContext(AuthContext);
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
          <NavLink to="/profile" className={activeClass} onClick={() => setIsOpen(false)}>Mon espace</NavLink>

          {token ? (
            <div className="nav-auth-mobile">
              <span className="user-name-display">{user?.firstName}</span>
              <button onClick={logout} className="btn logout-style">Déconnexion</button>
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