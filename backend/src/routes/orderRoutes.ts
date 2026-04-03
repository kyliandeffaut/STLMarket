import { Router } from "express";
import { requireAuth } from "../middlewares/auth";
import Order from "../models/Order";
import File from "../models/File";
import PrintRequest from "../models/PrintRequest";

const r = Router();

// traitement du tunnel d'achat et validation du panier
r.post("/", requireAuth, async (req: any, res: any) => {
  try {
    const auth = req.auth || req.user;
    if (!auth || !auth.id) return res.status(401).json({ error: "unauthorized" });

    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) return res.status(400).json({ error: "Le panier est vide" });

    let totalPrice = 0;
    const finalItems = [];

    // je boucle sur les articles pour vérifier les prix et l'existence des produits
    for (const it of items) {
      if (it.kind === "file") {
        const file = await File.findById(it.fileId);
        if (!file) return res.status(404).json({ error: `Fichier introuvable: ${it.title}` });

        finalItems.push({
          kind: "file",
          fileId: file._id,
          title: file.title,
          price: file.price,
          quantity: 1,
          filename: file.filename
        });
        totalPrice += file.price;
      } 
      else if (it.kind === "print") {
        const printReq = await PrintRequest.findById(it.requestId);
        if (!printReq || printReq.quotePrice === null) {
          return res.status(400).json({ error: "Devis non validé" });
        }

        finalItems.push({
          kind: "print",
          requestId: printReq._id,
          title: `Impression : ${printReq.originalName}`,
          price: printReq.quotePrice,
          quantity: it.quantity || 1,
          filename: printReq.storedName
        });
        totalPrice += printReq.quotePrice * (it.quantity || 1);
      }
    }

    // enregistrement définitif de la commande avec statut payé
    const order = await Order.create({
      userId: auth.id,
      items: finalItems,
      totalPrice,
      status: "paid",
    });

    // mise à jour des compteurs de téléchargement et des statuts d'impression
    for (const item of finalItems.filter((i:any) => i.kind === "file")) {
        await File.findByIdAndUpdate(item.fileId, { $inc: { downloads: 1 } });
    }
    for (const item of finalItems.filter((i:any) => i.kind === "print")) {
        await PrintRequest.findByIdAndUpdate(item.requestId, { status: "paid" });
    }

    res.json({ ok: true, orderId: order._id.toString() });
  } catch (error) {
    res.status(500).json({ error: "Erreur serveur interne" });
  }
});

// historique personnel des commandes
r.get("/my", requireAuth, async (req: any, res: any) => {
    try {
        const auth = req.auth || req.user;
        const orders = await Order.find({ userId: auth.id }).sort({ createdAt: -1 });
        res.json({ ok: true, orders });
    } catch (e) { res.status(500).json({ error: "server_error" }); }
});

// suppression d'une commande de l'historique par l'utilisateur
r.delete("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const auth = req.auth || req.user;
    const deleted = await Order.findOneAndDelete({ _id: req.params.id, userId: auth.id });
    if (!deleted) return res.status(404).json({ error: "Commande introuvable" });
    res.json({ ok: true });
  } catch (error) { res.status(500).json({ error: "Erreur serveur" }); }
});

export default r;