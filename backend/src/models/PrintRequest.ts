import mongoose from "mongoose";

// schéma pour les demandes de services d'impression personnalisées
const printRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  originalName: { type: String, required: true },
  storedName: { type: String, required: true },
  
  description: { type: String, default: "" }, 
  
  // la demande passe de "en attente" à "devis fait" puis "payée"
  status: { 
    type: String, 
    enum: ["pending", "quoted", "paid"], 
    default: "pending" 
  },
  quotePrice: { type: Number, default: null },
  createdAt: { type: Date, default: Date.now },
});

const PrintRequest = mongoose.models.PrintRequest || mongoose.model("PrintRequest", printRequestSchema);
export default PrintRequest;