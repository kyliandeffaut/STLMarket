import { Router } from "express";
import File from "../models/File";
import Order from "../models/Order"; 
import { requireAuth } from "../middlewares/auth"; 
import { v2 as cloudinary } from 'cloudinary';
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const r = Router();

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuration du stockage Cloudinary pour Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => {
    // On nettoie le nom du fichier
    const cleanName = file.originalname.split('.')[0]
      .replace(/\s+/g, '_')
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

    return {
      folder: 'stl_market',
      resource_type: 'raw', // Indispensable pour le .stl
      public_id: `${cleanName}_${Date.now()}`,
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
// C'est cette route qui manquait pour que l'upload fonctionne vers Cloudinary
r.post("/", requireAuth, upload.single("file"), async (req: any, res) => {
  try {
    const { title, category, price, description } = req.body;
    
    if (!req.file) return res.status(400).json({ error: "Fichier STL manquant" });

    const newFile = new File({
      title,
      category,
      price: parseFloat(price),
      description,
      // On enregistre le 'filename' Cloudinary (ex: stl_market/nom_fichier)
      filename: req.file.path || req.file.filename, 
      ownerId: req.auth.id
    });

    await newFile.save();
    res.status(201).json(newFile);
  } catch (error) {
    console.error("Erreur Upload:", error);
    res.status(500).json({ error: "Erreur lors de la mise en vente" });
  }
});

// 3. TÉLÉCHARGEMENT
r.get("/download/:fileId", requireAuth, async (req: any, res) => {
  try {
    const fileId = req.params.fileId;
    const userId = req.auth.id; 
    const userRole = req.auth.role;

    const file = await File.findById(fileId);
    if (!file) return res.status(404).json({ message: "Fichier introuvable" });

    const order = await Order.findOne({ userId, "items.fileId": fileId });
    if (!order && userRole !== 'admin') {
      return res.status(403).json({ message: "Achat requis" });
    }

    // On génère l'URL Cloudinary
    // Si 'file.filename' est une URL complète, on l'utilise, sinon on génère
    let downloadUrl = file.filename;
    
    if (!downloadUrl.startsWith('http')) {
        downloadUrl = cloudinary.url(file.filename, {
            resource_type: 'raw',
            flags: 'attachment',
            sign_url: true
        });
    }

    res.json({ downloadUrl });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

export default r;