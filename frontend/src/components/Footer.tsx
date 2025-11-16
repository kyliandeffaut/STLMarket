export default function Footer() {
  return (
    <footer style={{ opacity: .8, fontSize: 14, padding: "24px 0" }}>
      <div className="container">
        © {new Date().getFullYear()} STLMarket . |
        &nbsp;<a href="https://threejs.org/" target="_blank">three.js</a> .
      </div>
    </footer>
  );
}
