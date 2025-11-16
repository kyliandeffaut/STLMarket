export default function Admin() {
  return (
    <section className="container grid cols-3">
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Utilisateurs</h3>
        <button className="btn">Ajouter</button>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Catalogue STL</h3>
        <button className="btn">Nouveau fichier</button>
      </div>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Commandes d’impression</h3>
        <button className="btn">Rafraîchir</button>
      </div>
    </section>
  );
}
