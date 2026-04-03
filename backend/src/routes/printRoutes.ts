import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import PrintRequest from "../models/PrintRequest";

const router = Router();

// je m'assure que le dossier de stockage local existe pour les fichiers d'impression
const uploadDir = path.join(__dirname, "../../public/print_requests");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// configuration du stockage local avec des noms de fichiers uniques
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// filtrage pour n'accepter que les fichiers au format .stl
const upload = multer({ 
    storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!file.originalname.toLowerCase().endsWith(".stl")) {
            return cb(new Error("Seuls les fichiers .stl sont acceptés"));
        }
        cb(null, true);
    }
});

// route pour permettre à un utilisateur d'envoyer son fichier stl
router.post("/request", requireAuth, upload.single("stl"), async (req: any, res: any) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Fichier .stl invalide ou manquant" });

    const { description } = req.body;
    const newRequest = await PrintRequest.create({
      userId: req.auth.id || req.user.userId,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      description: description || "Aucune précision.",
      status: "pending"
    });

    res.json({ ok: true, request: newRequest });
  } catch (e) {
    res.status(500).json({ error: "Erreur serveur lors de l'upload" });
  }
});

// récupération des demandes personnelles de l'utilisateur
router.get("/my", requireAuth, async (req: any, res: any) => {
  try {
    const requests = await PrintRequest.find({ userId: req.auth.id || req.user.userId }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (e) { res.status(500).json({ error: "Erreur" }); }
});

// accès administrateur pour voir toutes les demandes non payées
router.get("/all", requireAuth, requireAdmin, async (req: any, res: any) => {
  try {
    const requests = await PrintRequest.find({ status: { $ne: "paid" } })
      .populate("userId", "email firstName")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (e) { res.status(500).json({ error: "Erreur admin" }); }
});

// route admin pour fixer un prix (devis) sur une demande
router.post("/:id/quote", requireAuth, requireAdmin, async (req: any, res: any) => {
  try {
    const updated = await PrintRequest.findByIdAndUpdate(
      req.params.id, 
      { status: "quoted", quotePrice: Number(req.body.price) },
      { new: true }
    );
    res.json({ ok: true, request: updated });
  } catch (e) { res.status(500).json({ error: "Erreur prix" }); }
});

export default router;