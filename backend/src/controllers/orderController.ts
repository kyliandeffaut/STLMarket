// backend/src/controllers/orderController.ts
import { Request, Response } from "express";
import mongoose from "mongoose";

// ✅ adapte les chemins si besoin
import Order from "../models/Order";
import File from "../models/File";
import PrintRequest from "../models/PrintRequest";

// Types attendus côté API (comme ton frontend)
type OrderItemDTO = {
  kind: "file" | "print";
  fileId?: string;
  requestId?: string;
  title: string;
  price: number;
  quantity: number;
  filename?: string;
};

export async function createOrder(req: Request, res: Response) {
  try {
    const auth = (req as any).auth; // requireAuth doit mettre req.auth = { id, role, ... }
    const userId = auth?.id;

    const items = (req.body?.items ?? []) as OrderItemDTO[];

    if (!userId) return res.status(401).json({ error: "unauthorized" });
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "invalid_items" });
    }

    // ✅ validation basique
    for (const it of items) {
      if (!it.kind) return res.status(400).json({ error: "missing_kind" });
      if (!it.title || typeof it.title !== "string") return res.status(400).json({ error: "invalid_title" });
      if (typeof it.price !== "number") return res.status(400).json({ error: "invalid_price" });
      if (typeof it.quantity !== "number" || it.quantity <= 0) return res.status(400).json({ error: "invalid_quantity" });

      if (it.kind === "file" && !it.fileId) return res.status(400).json({ error: "missing_fileId" });
      if (it.kind === "print" && !it.requestId) return res.status(400).json({ error: "missing_requestId" });
    }

    const totalPrice = items.reduce((s, it) => s + it.price * it.quantity, 0);

    // ✅ créer en DB
    const order = await Order.create({
      userId: new mongoose.Types.ObjectId(userId),
      items,
      totalPrice,
      status: "paid",
    });

    // ✅ incrémenter downloads pour chaque fichier acheté
    const fileItems = items.filter((it) => it.kind === "file" && it.fileId);
    for (const it of fileItems) {
      await File.updateOne(
        { _id: it.fileId },
        { $inc: { downloads: it.quantity } }
      );
    }

    // ✅ marquer les prints "paid" si tu utilises PrintRequest
    const printItems = items.filter((it) => it.kind === "print" && it.requestId);
    for (const it of printItems) {
      await PrintRequest.updateOne(
        { _id: it.requestId, userId: new mongoose.Types.ObjectId(userId) },
        { $set: { status: "paid" } }
      );
    }

    return res.json({ ok: true, orderId: order._id });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "server_error" });
  }
}

export async function myOrders(req: Request, res: Response) {
  try {
    const auth = (req as any).auth;
    const userId = auth?.id;
    if (!userId) return res.status(401).json({ error: "unauthorized" });

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.json({ ok: true, orders });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "server_error" });
  }
}

export async function deleteOrder(req: Request, res: Response) {
  try {
    const auth = (req as any).auth;
    const userId = auth?.id;
    if (!userId) return res.status(401).json({ error: "unauthorized" });

    const { id } = req.params;

    // ✅ on ne laisse supprimer que ses propres commandes
    const deleted = await Order.deleteOne({ _id: id, userId });

    if (deleted.deletedCount === 0) {
      return res.status(404).json({ error: "not_found" });
    }

    return res.json({ ok: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: "server_error" });
  }
}
