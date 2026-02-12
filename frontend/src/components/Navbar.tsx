import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, NavLink } from "react-router-dom";

// Petite modification pour combiner tes classes avec celles du responsive
const activeClass = ({ isActive }: { isActive: boolean }) => 
  isActive ? "nav-item active" : "nav-item";

export default function Navbar() {
  const { token, user, isAdmin, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false); // État pour ouvrir/fermer le menu

  // Fonction pour fermer le menu quand on clique sur un lien
  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  return (
    // On utilise la classe CSS .navbar définie dans index.css
    <header className="navbar">
      <div className="navbar-container">
        
        {/* --- LOGO --- */}
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          🧩 <span style={{ color: "var(--primary)" }}>STLMarket</span>
        </Link>

        {/* --- BOUTON BURGER (Visible uniquement sur mobile) --- */}
        <button 
          className="mobile-menu-btn"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? "✕" : "☰"}
        </button>

        {/* --- LIENS DE NAVIGATION --- */}
        {/* La classe 'open' active l'affichage sur mobile via le CSS */}
        <nav className={`nav-links ${isOpen ? "open" : ""}`}>
          
          <NavLink to="/catalogue" className={activeClass} onClick={closeMenu}>
            Catalogue
          </NavLink>
          
          <NavLink to="/print" className={activeClass} onClick={closeMenu}>
            Impression 3D
          </NavLink>

          <NavLink to="/cart" className={activeClass} onClick={closeMenu}>
            Panier
          </NavLink>

          <NavLink to="/profile" className={activeClass} onClick={closeMenu}>
            Mon espace
          </NavLink>

          {isAdmin && (
            <NavLink to="/admin" className={activeClass} onClick={closeMenu} style={{ color: "var(--accent)" }}>
              Admin
            </NavLink>
          )}

          {/* --- GESTION CONNEXION / DÉCONNEXION --- */}
          {!token ? (
            <div className="row" style={{ gap: 10, marginTop: 5 }}>
                <NavLink to="/login" className="btn ghost" onClick={closeMenu}>
                    Se connecter
                </NavLink>
                <NavLink to="/register" className="btn primary" onClick={closeMenu}>
                    S’inscrire
                </NavLink>
            </div>
          ) : (
            <div className="user-menu" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ opacity: 0.7, fontSize: 14 }}>
                {user?.firstName}
              </span>
              <button 
                onClick={handleLogout} 
                className="btn" 
                style={{ padding: "6px 12px", fontSize: 13, background: "rgba(255,50,50,0.1)", color: "#ff6b6b", border: "1px solid rgba(255,50,50,0.2)" }}
              >
                Déconnexion
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}