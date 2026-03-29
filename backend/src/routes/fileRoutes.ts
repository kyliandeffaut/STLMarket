import { Router } from "express";
import File from "../models/File";
import Order from "../models/Order"; 
import { requireAuth } from "../middlewares/auth"; 
import { v2 as cloudinary } from 'cloudinary';
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

const r = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req: any, file: any) => {
    return {
      folder: 'stl_market',
      resource_type: 'raw',
      format: 'stl',
      public_id: `${file.originalname.split('.')[0]}_${Date.now()}`,
    };
  },
});

const upload = multer({ storage: storage });

r.get("/", async (_req, res) => {
  const files = await File.find().sort({ createdAt: -1 });
  res.json(files);
});

r.post("/", requireAuth, upload.single("file"), async (req: any, res) => {
  try {
    const { title, category, price, description } = req.body;
    if (!req.file) return res.status(400).json({ error: "Fichier STL manquant" });

    const newFile = new File({
      title,
      category,
      price: parseFloat(price),
      description,
      // ✅ On extrait juste le nom final (ex: fichier_123.stl) pour MongoDB
      filename: req.file.filename.split('/').pop(), 
      ownerId: req.auth.id
    });

    await newFile.save();
    res.status(201).json(newFile);
  } catch (error: any) {
    if (error.code === 11000) return res.status(400).json({ error: "Ce titre existe déjà." });
    res.status(500).json({ error: "Erreur lors de la mise en vente" });
  }
});

r.get("/download/:fileId", requireAuth, async (req: any, res) => {
  try {
    const file = await File.findById(req.params.fileId);
    if (!file) return res.status(404).json({ message: "Fichier introuvable" });

    const order = await Order.findOne({ userId: req.auth.id, "items.fileId": req.params.fileId });
    if (!order && req.auth.role !== 'admin') return res.status(403).json({ message: "Achat requis" });

    // ✅ On rajoute le dossier pour que Cloudinary trouve le fichier
    const downloadUrl = cloudinary.url(`stl_market/${file.filename}`, {
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