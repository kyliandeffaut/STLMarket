import { Link } from "react-router-dom";

export default function Home() {
  return (
    <section className="container">
      <div className="card" style={{ padding: 24 }}>
        <h1 style={{ marginTop: 0 }}>Bienvenue sur STLMarket</h1>
        <p>Vendez, achetez et faites imprimer vos fichiers STL. Interface réactive, panier, suivi de commandes.</p>
        <div className="spacer"></div>
        <div className="row" style={{ gap: 12 }}>
          <Link className="btn primary" to="/catalogue">Parcourir le catalogue</Link>
          <Link className="btn" to="/upload">Demander une impression</Link>
        </div>
      </div>
    </section>
  );
}
