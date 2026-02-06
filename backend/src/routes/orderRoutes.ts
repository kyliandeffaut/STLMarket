import { Router } from "express";
import { requireAuth } from "../middlewares/auth"; // Ton middleware
import Order from "../models/Order";
import File from "../models/File"; // J'ai remis "File" (ton nom d'origine)
import PrintRequest from "../models/PrintRequest";

const r = Router();

// ==========================================
// 1. CRÉER UNE COMMANDE (PAIEMENT)
// ==========================================
r.post("/", requireAuth, async (req: any, res: any) => {
  try {
    console.log("📥 Nouvelle commande reçue !");

    // 1. Récupération de l'utilisateur (Compatible avec ta méthode req.auth)
    const auth = req.auth || req.user;
    if (!auth || !auth.id) {
      console.log("⛔ Utilisateur non identifié");
      return res.status(401).json({ error: "unauthorized" });
    }

    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Le panier est vide" });
    }

    let totalPrice = 0;
    const finalItems = [];

    // 2. Traitement des articles
    for (const it of items) {
      console.log(`🔍 Vérification item: ${it.kind} - ${it.title}`);

      // --- CAS 1 : FICHIER STL ---
      if (it.kind === "file") {
        if (!it.fileId) return res.status(400).json({ error: "missing_file_id" });

        const file = await File.findById(it.fileId);
        if (!file) {
          console.error(`❌ Fichier introuvable ID: ${it.fileId}`);
          return res.status(404).json({ error: `Fichier introuvable: ${it.title}` });
        }

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
      
      // --- CAS 2 : IMPRESSION 3D ---
      else if (it.kind === "print") {
        if (!it.requestId) return res.status(400).json({ error: "missing_request_id" });

        const printReq = await PrintRequest.findById(it.requestId);
        if (!printReq) {
          console.error(`❌ Demande d'impression introuvable ID: ${it.requestId}`);
          return res.status(404).json({ error: "Demande d'impression introuvable" });
        }

        // Vérification du prix
        if (printReq.quotePrice === null || printReq.quotePrice === undefined) {
          return res.status(400).json({ error: "Devis non validé pour cette impression" });
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

    // 3. Création de la commande
    const order = await Order.create({
      userId: auth.id,
      items: finalItems,
      totalPrice,
      status: "paid",
    });

    // 4. Mise à jour des statuts (Optionnel mais recommandé)
    try {
        // Incrémente les téléchargements pour les fichiers
        for (const item of finalItems.filter((i:any) => i.kind === "file")) {
            await File.findByIdAndUpdate(item.fileId, { $inc: { downloads: 1 } });
        }
        // Marque les impressions comme payées
        for (const item of finalItems.filter((i:any) => i.kind === "print")) {
            await PrintRequest.findByIdAndUpdate(item.requestId, { status: "paid" });
        }
    } catch (updateErr) {
        console.error("⚠️ Erreur mise à jour statuts (non bloquant):", updateErr);
    }

    console.log("✅ Commande créée avec succès :", order._id);
    res.json({ ok: true, orderId: order._id.toString() });

  } catch (error) {
    console.error("❌ CRASH BACKEND COMMANDE :", error);
    res.status(500).json({ error: "Erreur serveur interne (voir terminal)" });
  }
});

// ==========================================
// 2. LISTER MES COMMANDES
// ==========================================
r.get("/my", requireAuth, async (req: any, res: any) => {
    try {
        const auth = req.auth || req.user;
        const orders = await Order.find({ userId: auth.id }).sort({ createdAt: -1 });
        res.json({ ok: true, orders });
    } catch (e) {
        res.status(500).json({ error: "server_error" });
    }
});

// ==========================================
// 3. SUPPRIMER UNE COMMANDE (NOUVEAU)
// ==========================================
r.delete("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const auth = req.auth || req.user;
    
    // On cherche et supprime la commande SEULEMENT si elle appartient à l'utilisateur
    const deleted = await Order.findOneAndDelete({ _id: req.params.id, userId: auth.id });

    if (!deleted) {
      return res.status(404).json({ error: "Commande introuvable ou vous n'êtes pas le propriétaire" });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("Erreur suppression commande:", error);
    res.status(500).json({ error: "Erreur serveur lors de la suppression" });
  }
});

export default r;