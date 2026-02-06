import mongoose from "mongoose";
import File from "./models/File";
import dotenv from "dotenv";

dotenv.config();

const seed = async () => {
  try {
    // 1. Connexion
    await mongoose.connect("mongodb://127.0.0.1:27017/stlmarket");
    console.log("✅ Connecté à MongoDB");

    // 2. Nettoyage
    await File.deleteMany({});
    console.log("🧹 Ancien catalogue nettoyé.");

    // On génère un faux ID utilisateur pour l'exemple
    // (Dans l'idéal, on mettrait ton vrai ID admin, mais ça marchera comme ça)
    const fakeAdminId = new mongoose.Types.ObjectId();

    // 3. Création des produits avec les champs obligatoires corrigés
    const products = [
      {
        title: "Boîte Articulée",
        description: "Une boîte imprimable en une seule fois (print-in-place).",
        price: 5.00,
        filename: "Boite articulée.stl",
        originalName: "Boite articulée.stl",
        format: "stl",
        size: 2048,
        
        ownerId: fakeAdminId, 
        
        category: "Maison", 
        
        downloads: 0,
        createdAt: new Date(),
      },
      {
        title: "Support Téléphone",
        description: "Support universel pour smartphone, idéal pour le bureau.",
        price: 12.50,
        filename: "Support téléphone.stl",
        originalName: "Support téléphone.stl",
        format: "stl",
        size: 5120,
        
        ownerId: fakeAdminId,
        
        category: "Bureau",
        
        downloads: 12,
        createdAt: new Date(),
      }
    ];

    // 4. Enregistrement
    await File.insertMany(products);
    console.log("📦 2 Produits ajoutés au catalogue !");

  } catch (error) {
    console.error("❌ Erreur :", error);
  } finally {
    await mongoose.disconnect();
    console.log("👋 Terminé.");
  }
};

seed();