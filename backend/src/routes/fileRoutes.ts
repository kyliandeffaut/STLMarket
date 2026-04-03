import { Router } from "express";
import File from "../models/File";
import Order from "../models/Order"; 
import { requireAuth } from "../middlewares/auth"; 
import { v2 as cloudinary } from 'cloudinary';
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const r = Router();

// configuration de cloudinary pour le stockage des fichiers stl
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// paramétrage du stockage cloud pour accepter les fichiers raw (stl)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => {
    return {
      folder: 'stl_market',
      resource_type: 'raw',
      format: 'stl',
      public_id: `${file.originalname.split('.')[0]}_${Date.now()}.stl`,
    };
  },
});

const upload = multer({ storage: storage });

// récupération de tous les fichiers disponibles à la vente
r.get("/", async (_req, res) => {
  const files = await File.find().sort({ createdAt: -1 });
  res.json(files);
});

// route pour ajouter un nouveau produit avec upload sur cloudinary
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
    // gestion du doublon si le titre est déjà pris
    if (error.code === 11000) {
        return res.status(400).json({ error: "Ce titre existe déjà." });
    }
    res.status(500).json({ error: "Erreur lors de la mise en vente" });
  }
});

// génération d'un lien de téléchargement sécurisé après vérification de l'achat
r.get("/download/:fileId", requireAuth, async (req: any, res) => {
  try {
    const fileId = req.params.fileId;
    const userId = req.auth.id; 
    const userRole = req.auth.role;

    const file = await File.findById(fileId);
    if (!file) return res.status(404).json({ message: "Fichier introuvable" });

    // je vérifie si l'utilisateur a bien payé le fichier ou s'il est admin
    const order = await Order.findOne({ userId, "items.fileId": fileId });
    if (!order && userRole !== 'admin') {
      return res.status(403).json({ message: "Achat requis" });
    }

    // création de l'url cloudinary signée pour le téléchargement
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