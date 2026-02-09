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
// import adminPrintRoutes from "./routes/adminPrintRoutes"; // ❌ Plus besoin si tu as utilisé mon code unifié

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
// 2. MIDDLEWARES
// ==========================================
const corsOptions: cors.CorsOptions = {
  origin: ["http://localhost:5173", "https://TON-LIEN-VERCEL.vercel.app"], 
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(express.json());

// ==========================================
// 3. FICHIERS STATIQUES
// ==========================================
const publicDir = path.join(process.cwd(), "public");
const filesDir = path.join(publicDir, "files");
const printsDir = path.join(publicDir, "print_requests"); // C'est ici que sont tes images uploadées

// Création automatique
[publicDir, filesDir, printsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Dossier créé : ${dir}`);
  }
});

// EXPOSITION DES DOSSIERS
app.use("/files", express.static(filesDir));
app.use("/print_requests", express.static(printsDir)); // ✅ Important pour télécharger le STL

// ==========================================
// 4. ROUTES API
// ==========================================
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/orders", orderRoutes);

// 👇 C'EST ICI LA CORRECTION IMPORTANTE 👇
// On enlève le "s" pour matcher le frontend (/api/print/request)
app.use("/api/print", printRoutes); 

// Si tu utilisais l'ancienne route admin, on peut la retirer car printRoutes gère tout maintenant
// app.use("/api/admin/prints", adminPrintRoutes);

// Route de test
app.get("/", (_req, res) => {
  res.send(`
    <h1>API STL Marketplace</h1>
    <p>Statut: En ligne 🟢</p>
  `);
});

// ==========================================
// 5. LANCEMENT DU SERVEUR
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});