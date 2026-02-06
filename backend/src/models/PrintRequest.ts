import mongoose from "mongoose";

const printRequestSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  originalName: { type: String, required: true },
  storedName: { type: String, required: true },
  
  description: { type: String, default: "" }, 
  
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