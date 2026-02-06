import { Router } from "express";
import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";
import fs from "node:fs";

// Import correct des fonctions
import { createPrintRequest, myPrintRequests } from "../controllers/printController";
import { requireAuth } from "../middlewares/auth";

const r = Router();

// --- Configuration Multer (Upload) ---
const uploadDir = path.join(__dirname, "../../public/print_requests");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = crypto.randomBytes(16).toString("hex") + ext;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    if (!file.originalname.toLowerCase().endsWith(".stl")) {
      return cb(new Error("only_stl"));
    }
    cb(null, true);
  },
});

// --- Routes ---
r.post("/", requireAuth, upload.single("stl"), createPrintRequest);
r.get("/my", requireAuth, myPrintRequests);

export default r;