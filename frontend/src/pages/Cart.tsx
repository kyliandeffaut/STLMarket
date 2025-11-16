export default function Cart() {
  return (
    <section className="container">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Panier</h2>
        <p>Simulation de paiement (pas de vrai paiement en ligne demandé par le cahier des charges).</p>
        <div className="spacer"></div>
        <button className="btn primary">Procéder à la commande</button>
      </div>
    </section>
  );
}
