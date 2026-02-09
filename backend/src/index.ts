import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import mongoose from "mongoose";
import "dotenv/config"; 

// --- Imports des routes ---
import authRoutes from "./routes/authRoutes";
import fileRoutes from "./routes/fileRoutes";
import orderRoutes from "./routes/orderRoutes";
import printRoutes from "./routes/printRoutes"; 

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// 1. BASE DE DONNÉES (MongoDB)
// ==========================================
console.log("⏳ Tentative de connexion à MongoDB...");

mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("✅ MongoDB Connecté avec succès !"))
  .catch((err) => {
    console.error("❌ ERREUR MONGODB :", err);
  });

// ==========================================
// 2. MIDDLEWARES (CORS & JSON)
// ==========================================
const corsOptions: cors.CorsOptions = {
  origin: [
    "http://localhost:5173", // Ton PC (Frontend dev)
    "http://localhost:3000", // Ton PC (Backend dev)
    "https://stl-market.vercel.app", // Frontend en prod
  ], 
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

// ==========================================
// 3. FICHIERS STATIQUES (Stockage physique)
// ==========================================
// Render utilise process.cwd() pour trouver la racine
const publicDir = path.join(process.cwd(), "public");
const filesDir = path.join(publicDir, "files"); // Pour les STL du catalogue
const printsDir = path.join(publicDir, "print_requests"); // Pour les uploads utilisateurs

// Création automatique des dossiers s'ils n'existent pas
[publicDir, filesDir, printsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Dossier créé : ${dir}`);
  }
});

// EXPOSITION DES DOSSIERS
// URL pour télécharger : https://ton-backend.onrender.com/files/monfichier.stl
app.use("/files", express.static(filesDir));
app.use("/print_requests", express.static(printsDir)); 

// ==========================================
// 4. ROUTES API (Données JSON)
// ==========================================
// Toutes les routes API commencent par /api pour éviter les conflits
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes); // Renvoie le JSON des produits
app.use("/api/orders", orderRoutes);
app.use("/api/print", printRoutes); 

// Route de test (Page d'accueil du backend)
app.get("/", (_req, res) => {
  res.send(`
    <div style="font-family: sans-serif; text-align: center; padding: 20px;">
      <h1>API STL Marketplace</h1>
      <p>Statut: En ligne 🟢</p>
      <p>Base de données: ${mongoose.connection.readyState === 1 ? "Connectée 🟢" : "Déconnectée 🔴"}</p>
    </div>
  `);
});

// ==========================================
// 5. LANCEMENT DU SERVEUR
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});