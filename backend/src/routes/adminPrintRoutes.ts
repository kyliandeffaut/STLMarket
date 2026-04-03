import { Router } from "express";
import PrintRequest from "../models/PrintRequest";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const r = Router();

// je récupère toutes les demandes d'impression pour l'interface administrateur
r.get("/", requireAuth, requireAdmin, async (_req, res) => {
  const requests = await PrintRequest.find().sort({ createdAt: -1 });
  res.json({ ok: true, requests });
});

// je permets à l'admin d'envoyer un devis pour une demande d'impression
r.patch("/:id/quote", requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const price = Number(req.body?.price);
  const adminMessage = String(req.body?.adminMessage ?? "");

  if (!Number.isFinite(price) || price <= 0) {
    return res.status(400).json({ error: "invalid_price" });
  }

  // je mets à jour le statut de la demande en "devis envoyé"
  const doc = await PrintRequest.findByIdAndUpdate(
    id,
    { status: "quoted", quotePrice: price, adminMessage },
    { new: true }
  );

  if (!doc) return res.status(404).json({ error: "not_found" });
  res.json({ ok: true, request: doc });
});

// je donne la possibilité à l'admin de supprimer ou refuser une demande
r.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const deleted = await PrintRequest.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ error: "not_found" });
  res.json({ ok: true });
});

export default r;