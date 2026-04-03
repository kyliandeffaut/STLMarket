import { Request, Response } from "express";
import PrintRequest from "../models/PrintRequest";
import mongoose from "mongoose";

// cette fonction permet à l'utilisateur d'envoyer son propre fichier pour une demande d'impression
export async function createPrintRequest(req: Request, res: Response) {
  try {
    const auth = (req as any).auth;
    const file = req.file;
    const { notes } = req.body;

    // je vérifie qu'un fichier a bien été joint à la requête
    if (!file) return res.status(400).json({ error: "missing_file" });

    // je convertis le nom du fichier pour bien gérer les accents et caractères spéciaux
    const originalName = Buffer.from(file.originalname, "latin1").toString("utf8");

    // je crée la demande dans la base de données avec le statut en attente par défaut
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

// je récupère toutes les demandes d'impression faites par l'utilisateur connecté
export async function myPrintRequests(req: Request, res: Response) {
  try {
    const auth = (req as any).auth;
    // je trie les demandes pour afficher les plus récentes en premier
    const list = await PrintRequest.find({ userId: auth.id }).sort({ createdAt: -1 });
    res.json({ ok: true, requests: list });
  } catch (e) {
    res.status(500).json({ error: "server_error" });
  }
}