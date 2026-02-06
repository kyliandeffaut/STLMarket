import { Request, Response } from "express";
import PrintRequest from "../models/PrintRequest";
import mongoose from "mongoose";

// Fonction AJOUTÉE pour permettre l'upload
export async function createPrintRequest(req: Request, res: Response) {
  try {
    const auth = (req as any).auth;
    const file = req.file;
    const { notes } = req.body;

    if (!file) return res.status(400).json({ error: "missing_file" });

    const originalName = Buffer.from(file.originalname, "latin1").toString("utf8");

    const request = await PrintRequest.create({
      userId: new mongoose.Types.ObjectId(auth.id),
      originalName: originalName,
      storedName: file.filename,
      notes: notes || "",
      status: "pending"
    });

    res.json({ ok: true, id: request._id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
}

// Liste des demandes
export async function myPrintRequests(req: Request, res: Response) {
  try {
    const auth = (req as any).auth;
    const list = await PrintRequest.find({ userId: auth.id }).sort({ createdAt: -1 });
    res.json({ ok: true, requests: list });
  } catch (e) {
    res.status(500).json({ error: "server_error" });
  }
}