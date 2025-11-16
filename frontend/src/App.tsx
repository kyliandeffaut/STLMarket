import { Routes, Route } from "react-router-dom";
import Navbar from "@components/Navbar";
import Footer from "@components/Footer";
import Home from "@pages/Home";
import Catalogue from "@pages/Catalogue";
import ProductDetail from "@pages/ProductDetail";
import Cart from "@pages/Cart";
import Upload from "@pages/Upload";
import Profile from "@pages/Profile";
import Admin from "@pages/Admin";
import Register from "@/pages/Register";
import Login from "@/pages/Login";
import Account from "@/pages/Account";

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogue" element={<Catalogue />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/mon-espace" element={<Account />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
