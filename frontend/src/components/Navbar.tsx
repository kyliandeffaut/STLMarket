import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, NavLink } from "react-router-dom";

// Gestion simplifiée des classes actives
const activeClass = ({ isActive }: { isActive: boolean }) => 
  isActive ? "nav-item active" : "nav-item";

export default function Navbar() {
  const { token, user, isAdmin, logout } = useContext(AuthContext);
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => setIsOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        
        {/* --- LOGO --- */}
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          🧩 STLMarket
        </Link>

        {/* --- BOUTON BURGER --- */}
        <button className="mobile-menu-btn" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "✕" : "☰"}
        </button>

        {/* --- NAVIGATION --- */}
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

          <div className="nav-auth-section">
            {!token ? (
              <div className="row">
                <NavLink to="/login" className="btn ghost" onClick={closeMenu}>
                  Connexion
                </NavLink>
                <NavLink to="/register" className="btn primary" onClick={closeMenu}>
                  S’inscrire
                </NavLink>
              </div>
            ) : (
              <div className="user-menu">
                <span className="user-name">{user?.firstName}</span>
                <button onClick={handleLogout} className="btn logout-btn">
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}