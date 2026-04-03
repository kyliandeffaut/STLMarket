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

// SÉCURITÉ : Masque la technologie utilisée (Information Disclosure / WhatWeb)
app.disable('x-powered-by');

// 1. BASE DE DONNÉES
console.log("⏳ Tentative de connexion à MongoDB...");
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => console.log("✅ MongoDB Connecté avec succès !"))
  .catch((err) => {
    console.error("❌ ERREUR MONGODB :", err);
  });

// 2. CONFIGURATION CORS AVEC LA LIBRAIRIE
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Liste des origines locales acceptées
    const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"];

    // 1. Si pas d'origine (ex: appel serveur à serveur ou Postman), on accepte
    if (!origin) return callback(null, true);

    // 2. Si c'est Localhost, on accepte
    if (allowedOrigins.includes(origin)) return callback(null, true);

    // 3. Si c'est un site Vercel, on accepte
    if (origin.endsWith(".vercel.app")) {
      return callback(null, true);
    }

    // Sinon, on refuse (et on loggue pour comprendre pourquoi)
    console.log("CORS bloqué pour l'origine :", origin);
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Appliquer la configuration
app.use(cors(corsOptions));
// Force la gestion des requêtes "Pre-flight" pour toutes les routes
app.options(/(.*)/, cors(corsOptions));

app.use(express.json());

// 3. FICHIERS STATIQUES
const publicDir = path.join(process.cwd(), "public");
const filesDir = path.join(publicDir, "files");
const printsDir = path.join(publicDir, "print_requests");

[publicDir, filesDir, printsDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Dossier créé : ${dir}`);
  }
});

app.use("/files", express.static(filesDir));
app.use("/print_requests", express.static(printsDir)); 

// 4. ROUTES API
app.use("/api/auth", authRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/print", printRoutes); 

app.get("/", (_req, res) => {
  res.send("API en ligne (CORS Vercel activé)");
});

// 5. LANCEMENT
app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
});