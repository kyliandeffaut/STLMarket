import express from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import mongoose from "mongoose";
import "dotenv/config"; // Toujours charger les variables d'env en premier

// --- Imports des routes ---
import authRoutes from "./routes/authRoutes";
import fileRoutes from "./routes/fileRoutes";
import orderRoutes from "./routes/orderRoutes";
import printRoutes from "./routes/printRoutes";
import adminPrintRoutes from "./routes/adminPrintRoutes";

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
// 2. MIDDLEWARES (Sécurité & Parsing)
// ==========================================

// Configuration CORS (Une seule fois, propre)
const corsOptions: cors.CorsOptions = {
  origin: "http://localhost:5173", // Ton Frontend
  credentials: true, // Autorise les cookies/sessions
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json()); // Permet de lire les JSON envoyés par le frontend

// ==========================================
// 3. FICHIERS STATIQUES (STL & Images)
// ==========================================

// On définit les chemins par rapport à la racine du projet (process.cwd)
// Structure attendue : backend/public/files
const publicDir = path.join(process.cwd(), "public");
const filesDir = path.join(publicDir, "files");
const printsDir = path.join(publicDir, "print_requests");

// Création automatique des dossiers s'ils manquent
[publicDir, filesDir, printsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Dossier créé : ${dir}`);
  }
});

// Logs pour vérifier que le chemin est bon au démarrage
console.log(`📂 Dossier Fichiers publics : ${filesDir}`);

// EXPOSITION DES DOSSIERS
// -> http://localhost:3000/files/monfichier.stl
app.use("/files", express.static(filesDir));
// -> http://localhost:3000/print_requests/monfichier.stl
app.use("/print_requests", express.static(printsDir));

// ==========================================
// 4. ROUTES API
// ==========================================
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/prints", printRoutes);
app.use("/api/admin/prints", adminPrintRoutes);

// Route de test (Page d'accueil de l'API)
app.get("/", (_req, res) => {
  res.send(`
    <h1>API STL Marketplace</h1>
    <p>Statut: En ligne 🟢</p>
    <p>Dossier fichiers: ${filesDir}</p>
  `);
});

// ==========================================
// 5. LANCEMENT DU SERVEUR
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});