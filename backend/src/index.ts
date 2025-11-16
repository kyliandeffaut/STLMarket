import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "node:path";
import { connectMongo } from "./config/db_mongo"; // garde-le
import fileRoutes from "./routes/fileRoutes";     // garde-le
import userRoutes from "./routes/userRoutes";


console.log("✅ Serveur Express démarré depuis", __filename);

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 1) routes minimales pour vérifier que le serveur écoute
app.get("/api/ping", (_req, res) => res.json({ ok: true, ts: Date.now() }));
app.get("/", (_req, res) => res.send("API STL Marketplace OK ✅"));

// 2) servir les STL (facultatif)
app.use("/files", express.static(path.join(__dirname, "../public/files")));

// 3) monter les routes métier (même si Mongo plante, ça doit s’enregistrer)
app.use("/api/files", fileRoutes);
app.use("/api/users", userRoutes);

// 4) LANCER D’ABORD LE SERVEUR, PUIS CONNECTER MONGO (Safe-Start)
const PORT = Number(process.env.PORT || 3000);
const server = app.listen(PORT, () => {
  console.log(`🚀 API en écoute sur http://localhost:${PORT}`);
  console.log(`➡️ Test ping:     http://localhost:${PORT}/api/ping`);
  console.log(`➡️ Liste fichiers: http://localhost:${PORT}/api/files`);
});

// 5) tenter la connexion Mongo EN ARRIÈRE-PLAN (sans bloquer l’écoute)
(async () => {
  const uri = process.env.MONGO_URL || "mongodb://127.0.0.1:27017/stlmarket?directConnection=true";
  try {
    console.log("🔌 Tentative connexion Mongo →", uri);
    await connectMongo(uri);
    console.log("✅ Mongo connecté");
  } catch (err) {
    console.error("❌ Échec Mongo (le serveur REST reste UP) :", (err as Error).message);
  }
})();

// (facultatif) gestion d’erreurs globales
process.on("unhandledRejection", (e) => console.error("UnhandledRejection:", e));
process.on("uncaughtException", (e) => console.error("UncaughtException:", e));
