import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link, NavLink } from "react-router-dom";

// On s'assure que la classe "nav-item" est toujours présente
const activeClass = ({ isActive }: { isActive: boolean }) => 
  isActive ? "nav-item active" : "nav-item";

export default function Navbar() {
  const { token, user, logout } = useContext(AuthContext);
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

        {/* Le conteneur nav-links gère l'alignement flex */}
        <nav className={`nav-links ${isOpen ? "open" : ""}`}>
          <div className="nav-main">
            <NavLink to="/catalogue" className={activeClass} onClick={() => setIsOpen(false)}>Catalogue</NavLink>
            <NavLink to="/print" className={activeClass} onClick={() => setIsOpen(false)}>Impression 3D</NavLink>
            <NavLink to="/cart" className={activeClass} onClick={() => setIsOpen(false)}>Panier</NavLink>
            <NavLink to="/profile" className={activeClass} onClick={() => setIsOpen(false)}>Mon espace</NavLink>
          </div>

          <div className="nav-auth">
            {token ? (
              <div className="user-section">
                <span className="user-name">{user?.firstName}</span>
                <button onClick={logout} className="btn-logout">Déconnexion</button>
              </div>
            ) : (
              <div className="auth-buttons">
                <NavLink to="/login" className="btn-login" onClick={() => setIsOpen(false)}>Connexion</NavLink>
                <NavLink to="/register" className="btn-register" onClick={() => setIsOpen(false)}>S'inscrire</NavLink>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}