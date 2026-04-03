import { Router } from "express";
import PrintRequest from "../models/PrintRequest";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const r = Router();

// GET /api/admin/prints
r.get("/", requireAuth, requireAdmin, async (_req, res) => {
  const requests = await PrintRequest.find().sort({ createdAt: -1 });
  res.json({ ok: true, requests });
});

// PATCH /api/admin/prints/:id/quote
r.patch("/:id/quote", requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const price = Number(req.body?.price);
  const adminMessage = String(req.body?.adminMessage ?? "");

  if (!Number.isFinite(price) || price <= 0) {
    return res.status(400).json({ error: "invalid_price" });
  }

  const doc = await PrintRequest.findByIdAndUpdate(
    id,
    { status: "quoted", quotePrice: price, adminMessage },
    { new: true }
  );

  if (!doc) return res.status(404).json({ error: "not_found" });
  res.json({ ok: true, request: doc });
});

// DELETE /api/admin/prints/:id  (Refuser = supprimer)
r.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const { id } = req.params;
  const deleted = await PrintRequest.findByIdAndDelete(id);
  if (!deleted) return res.status(404).json({ error: "not_found" });
  res.json({ ok: true });
});

export default r;
