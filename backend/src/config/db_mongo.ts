import mongoose from "mongoose";

// configuration de la connexion à la base de données mongodb
export async function connectMongo(uri: string) {
// j'active le mode strict pour les requêtes afin d'éviter les erreurs de schéma
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("MongoDB connecté");
}