import { useContext, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

// ✅ 1. Import du nouveau logo (assure-toi qu'il est bien dans src/assets/)
import logo from "../assets/logo.png"; 

// Fonction pour gérer la classe active
const activeClass = ({ isActive }: { isActive: boolean }) => 
  isActive ? "nav-item active" : "nav-item";

export default function Navbar() {
  const { token, isAdmin, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  // Fonction pour fermer le menu quand on clique sur un lien
  const close = () => setIsOpen(false);

  return (
    <header className="navbar">
      <div className="container navbar-container">
        
        {/* ✅ 2. REMPLACEMENT DU LOGO ICI */}
        <Link 
          to="/" 
          className="nav-logo" 
          onClick={close} 
          style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <img 
            src={logo} 
            alt="Logo STLMarket" 
            style={{ height: '40px', width: 'auto', borderRadius: '8px' }} 
          />
        </Link>

        {/* BOUTON BURGER POUR MOBILE */}
        <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "✕" : "☰"}
        </button>

        <nav className={`nav-links ${isOpen ? "open" : ""}`}>
          <NavLink to="/catalogue" className={activeClass} onClick={close}>Catalogue</NavLink>
          <NavLink to="/print" className={activeClass} onClick={close}>Impression 3D</NavLink>
          <NavLink to="/cart" className={activeClass} onClick={close}>Panier</NavLink>

          {/* LIEN ADMIN */}
          {isAdmin && (
            <NavLink 
              to="/admin" 
              className={activeClass} 
              onClick={close}
              style={{ color: "var(--accent)", fontWeight: "800", textShadow: "0 0 10px rgba(34, 211, 238, 0.4)" }}
            >
              Admin 🛡️
            </NavLink>
          )}

          <NavLink to="/profile" className={activeClass} onClick={close}>Mon espace</NavLink>

          {/* SECTION AUTH */}
          {token ? (
            <div className="nav-auth-mobile">
              <button 
                onClick={() => { logout(); close(); }} 
                className="btn logout-style"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <div className="nav-auth-mobile">
              <NavLink to="/login" className="btn ghost" onClick={close}>Connexion</NavLink>
              <NavLink to="/register" className="btn primary" onClick={close}>S'inscrire</NavLink>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}