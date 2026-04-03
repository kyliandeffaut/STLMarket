import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { requireAuth, requireAdmin } from "../middlewares/auth";
import PrintRequest from "../models/PrintRequest";

const router = Router();

// Dossier de stockage
const uploadDir = path.join(__dirname, "../../public/print_requests");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ 
    storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        // Vérification stricte du nom de fichier
        if (!file.originalname.toLowerCase().endsWith(".stl")) {
            return cb(new Error("Seuls les fichiers .stl sont acceptés"));
        }
        cb(null, true);
    }
});

// 1. [USER] Envoyer une demande AVEC DESCRIPTION
router.post("/request", requireAuth, upload.single("stl"), async (req: any, res: any) => {
  try {
    if (!req.file) return res.status(400).json({ error: "Fichier .stl invalide ou manquant" });

    // Multer met les champs texte dans req.body
    const { description } = req.body;

    const newRequest = await PrintRequest.create({
      userId: req.auth.id || req.user.userId,
      originalName: req.file.originalname,
      storedName: req.file.filename,
      description: description || "Aucune précision.", // On sauvegarde la description
      status: "pending"
    });

    res.json({ ok: true, request: newRequest });
  } catch (e) {
    console.error("Erreur upload:", e);
    res.status(500).json({ error: "Erreur serveur lors de l'upload" });
  }
});

router.get("/my", requireAuth, async (req: any, res: any) => {
  try {
    const requests = await PrintRequest.find({ userId: req.auth.id || req.user.userId }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (e) { res.status(500).json({ error: "Erreur" }); }
});

router.get("/all", requireAuth, requireAdmin, async (req: any, res: any) => {
  try {
    const requests = await PrintRequest.find({ status: { $ne: "paid" } })
      .populate("userId", "email firstName")
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (e) { res.status(500).json({ error: "Erreur admin" }); }
});

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