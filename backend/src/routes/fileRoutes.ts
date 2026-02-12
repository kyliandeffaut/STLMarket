import { Router } from "express";
import File from "../models/File";
import Order from "../models/Order"; 
import { requireAuth } from "../middlewares/auth"; 
import path from "path";
import fs from "fs";

const r = Router();

// 1. Liste
r.get("/", async (_req, res) => {
  const files = await File.find().sort({ createdAt: -1 });
  res.json(files);
});

// 2. Détail
r.get("/:title", async (req, res) => {
  const title = decodeURIComponent(req.params.title);
  const file = await File.findOne({ title });
  if (!file) return res.status(404).json({ error: "not_found" });
  res.json(file);
});

// 👇 3. LA ROUTE QUE TU AS OUBLIÉE DANS VS CODE 👇
r.get("/download/:fileId", requireAuth, async (req: any, res) => {
  try {
    const fileId = req.params.fileId;
    const userId = req.auth.id; 
    const userRole = req.auth.role;

    // A. Trouver le fichier
    const file = await File.findById(fileId);
    if (!file) return res.status(404).json({ message: "Fichier introuvable en base." });

    // B. Vérifier l'achat
    const order = await Order.findOne({ userId: userId, "items.fileId": fileId });
    
    // Si pas acheté et pas admin -> Stop
    if (!order && userRole !== 'admin') {
      return res.status(403).json({ message: "Achat requis." });
    }

    // C. Télécharger
    const filePath = path.join(__dirname, "../../uploads", file.filename);
    if (fs.existsSync(filePath)) {
      res.download(filePath, `${file.title}.stl`);
    } else {
      res.status(404).json({ message: "Fichier physique manquant (Render a redémarré ?)." });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default r;