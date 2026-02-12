import { Router } from "express";
import File from "../models/File";
import Order from "../models/Order"; 
import { requireAuth } from "../middlewares/auth"; 
import path from "path";
import fs from "fs";

const r = Router();

r.get("/", async (_req, res) => {
  const files = await File.find().sort({ createdAt: -1 });
  res.json(files);
});

r.get("/:title", async (req, res) => {
  const title = decodeURIComponent(req.params.title);
  const file = await File.findOne({ title });
  if (!file) return res.status(404).json({ error: "not_found" });
  res.json(file);
});

// ROUTE DE TÉLÉCHARGEMENT
// On utilise 'requireAuth' au lieu de 'checkToken'
r.get("/download/:fileId", requireAuth, async (req: any, res) => {
  try {
    const fileId = req.params.fileId;
    
    // Et ton token contient 'id', pas 'userId'
    const userId = req.auth.id; 
    const userRole = req.auth.role;

    // 1. Récupérer le fichier
    const file = await File.findById(fileId);
    if (!file) return res.status(404).json({ message: "Fichier introuvable" });

    // 2. SÉCURITÉ : Vérifier l'achat
    const order = await Order.findOne({
      userId: userId,
      "items.fileId": fileId
    });

    // Si pas de commande (et que l'utilisateur n'est pas admin), on bloque
    if (!order && userRole !== 'admin') {
      return res.status(403).json({ message: "Vous devez acheter ce fichier pour le télécharger." });
    }

    // 3. Envoyer le fichier
    // On remonte de 2 dossiers (routes -> src -> backend -> uploads)
    // Assure-toi que le dossier 'uploads' est bien à la racine du backend
    const filePath = path.join(__dirname, "../../uploads", file.filename);

    if (fs.existsSync(filePath)) {
      // On donne un nom propre au fichier téléchargé (Titre du produit + .stl)
      const downloadName = `${file.title}.stl`; 
      res.download(filePath, downloadName);
    } else {
      console.error("Fichier manquant :", filePath);
      res.status(404).json({ message: "Fichier physique introuvable sur le serveur." });
    }

  } catch (error) {
    console.error("Erreur download:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default r;