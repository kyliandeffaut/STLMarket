import { Router } from "express";
import File from "../models/File";
import Order from "../models/Order"; 
import { requireAuth } from "../middlewares/auth"; 
import { v2 as cloudinary } from 'cloudinary';
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const r = Router();

// Configuration Cloudinary (utilise tes variables Render)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuration du stockage Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => {
    return {
      folder: 'stl_market',
      resource_type: 'raw', 
      public_id: `${file.originalname.split('.')[0]}_${Date.now()}.stl`,
    };
  },
});

const upload = multer({ storage: storage });

// --- ROUTES ---

// 1. Liste des fichiers
r.get("/", async (_req, res) => {
  const files = await File.find().sort({ createdAt: -1 });
  res.json(files);
});

// 2. AJOUTER UN FICHIER (Route POST pour l'Admin)
r.post("/", requireAuth, upload.single("file"), async (req: any, res) => {
  try {
    const { title, category, price, description } = req.body;
    if (!req.file) return res.status(400).json({ error: "Fichier STL manquant" });

    const newFile = new File({
      title,
      category,
      price: parseFloat(price),
      description,
      filename: req.file.filename, 
      ownerId: req.auth.id
    });

    await newFile.save();
    res.status(201).json(newFile);
  } catch (error: any) {
    if (error.code === 11000) {
        return res.status(400).json({ error: "Ce titre existe déjà." });
    }
    res.status(500).json({ error: "Erreur lors de la mise en vente" });
  }
});

// 3. TÉLÉCHARGEMENT (Génère le lien Cloudinary)
r.get("/download/:fileId", requireAuth, async (req: any, res) => {
  try {
    const fileId = req.params.fileId;
    const userId = req.auth.id; 
    const userRole = req.auth.role;

    const file = await File.findById(fileId);
    if (!file) return res.status(404).json({ message: "Fichier introuvable" });

    // Vérification de l'achat
    const order = await Order.findOne({ userId, "items.fileId": fileId });
    if (!order && userRole !== 'admin') {
      return res.status(403).json({ message: "Achat requis" });
    }

    const downloadUrl = cloudinary.url(file.filename, {
      resource_type: 'raw',
      flags: 'attachment',
      sign_url: true
    });

    res.json({ downloadUrl });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default r;