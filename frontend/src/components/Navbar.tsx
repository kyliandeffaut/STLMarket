import { useContext } from "react";
import { AuthContext } from "../context/AuthContext"; // adapte le chemin
import { Link, NavLink } from "react-router-dom";

const active = ({ isActive }: { isActive: boolean }) =>
  ({ className: isActive ? "navlink active" : "navlink" });

export default function Navbar() {
  const { token, logout } = useContext(AuthContext);

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "rgba(10,12,18,.75)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(255,255,255,.06)",
      }}
    >
      <div
        className="container row"
        style={{
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
        }}
      >
        <Link to="/" style={{ fontWeight: 700, letterSpacing: 0.5 }}>
          🧩 STL<span style={{ color: "var(--primary)" }}>Market</span>
        </Link>

        <nav className="row" style={{ gap: 18, alignItems: "center" }}>
          <NavLink to="/catalogue" {...active}>Catalogue</NavLink>
          <NavLink to="/upload" {...active}>Uploader</NavLink>
          <NavLink to="/cart" {...active}>Panier</NavLink>
          <NavLink to="/profile" {...active}>Mon espace</NavLink>
          <NavLink to="/admin" {...active}>Admin</NavLink>

          {!token ? (
            <>
              <NavLink
                to="/login"
                {...active}
                style={{
                  color: "var(--primary)",
                  fontWeight: 500,
                  marginLeft: 10,
                }}
              >
                Se connecter
              </NavLink>
              <NavLink
                to="/register"
                {...active}
                style={{
                  color: "var(--primary)",
                  fontWeight: 500,
                }}
              >
                S’inscrire
              </NavLink>
            </>
          ) : (
            <button
              onClick={logout}
              style={{
                background: "transparent",
                border: "1px solid var(--primary)",
                borderRadius: 6,
                padding: "4px 10px",
                color: "var(--primary)",
                cursor: "pointer",
                marginLeft: 8,
              }}
            >
              Déconnexion
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
