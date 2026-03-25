import logo from "../assets/logo.png"; 

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-content">
        
        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: 800, fontSize: "16px", color: "var(--text)" }}>
          <img src={logo} alt="Logo STLMarket" style={{ height: "30px", width: "auto", borderRadius: "6px" }} />
          <span>STL Market</span>
        </div>

        <div style={{ color: "var(--muted)" }}>
          © {new Date().getFullYear()} STLMarket • Propulsé par <a href="https://threejs.org/" target="_blank" rel="noreferrer" style={{ color: "var(--primary)", textDecoration: "none" }}>Three.js</a>
        </div>

        <div className="footer-links">
          <a href="#">Mentions Légales</a>
          <a href="#">CGV</a>
          <a href="#">Contact</a>
        </div>

      </div>
    </footer>
  );
}