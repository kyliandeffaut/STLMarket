import { Router } from "express";
import File from "../models/File";
import Order from "../models/Order"; 
import { requireAuth } from "../middlewares/auth"; 
import { v2 as cloudinary } from 'cloudinary';

const r = Router();

// Configuration Cloudinary (utilise les variables d'environnement de Render)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 1. Liste des fichiers
r.get("/", async (_req, res) => {
  const files = await File.find().sort({ createdAt: -1 });
  res.json(files);
});

// 2. Détail d'un fichier
r.get("/:title", async (req, res) => {
  const title = decodeURIComponent(req.params.title);
  const file = await File.findOne({ title });
  if (!file) return res.status(404).json({ error: "not_found" });
  res.json(file);
});

// 3. NOUVELLE ROUTE DE TÉLÉCHARGEMENT (Via Cloudinary)
r.get("/download/:fileId", requireAuth, async (req: any, res) => {
  try {
    const fileId = req.params.fileId;
    const userId = req.auth.id; 
    const userRole = req.auth.role;

    const file = await File.findById(fileId);
    if (!file) return res.status(404).json({ message: "Fichier introuvable" });

    // Vérification de l'achat (Admin ou Acheteur)
    const order = await Order.findOne({
      userId: userId,
      "items.fileId": fileId
    });

    if (!order && userRole !== 'admin') {
      return res.status(403).json({ message: "Vous devez acheter ce fichier pour le télécharger." });
    }

    // --- LOGIQUE CLOUDINARY ---
    // Au lieu de res.download (local), on génère un lien de téléchargement sécurisé
    // On force le téléchargement avec 'attachment'
    const downloadUrl = cloudinary.utils.private_download_url(file.filename, 'stl', {
      resource_type: 'raw',
      attachment: true
    });

    // On redirige l'utilisateur vers le lien Cloudinary
    // ou on lui renvoie l'URL pour que le frontend gère
    res.json({ downloadUrl });

  } catch (error) {
    console.error("Erreur download:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default r;