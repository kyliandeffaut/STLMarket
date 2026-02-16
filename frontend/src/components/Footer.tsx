export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        
        {/* Logo ou Titre discret */}
        <div style={{ fontWeight: 800, fontSize: "16px", color: "var(--text)" }}>
          🧩 STLMarket
        </div>

        {/* Copyright */}
        <div style={{ color: "var(--muted)" }}>
          © {new Date().getFullYear()} STLMarket • Propulsé par <a href="https://threejs.org/" target="_blank" style={{ color: "var(--primary)", textDecoration: "none" }}>Three.js</a>
        </div>

        {/* Liens légaux (pour le style) */}
        <div className="footer-links">
          <a href="#">Mentions Légales</a>
          <a href="#">CGV</a>
          <a href="#">Contact</a>
        </div>

      </div>
    </footer>
  );
}