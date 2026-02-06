import { Schema, model } from "mongoose";

export type PrintStatus = "pending" | "quoted" | "rejected" | "paid";

const printRequestSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    notes: { type: String, default: "" },
    status: { type: String, enum: ["pending", "quoted", "rejected", "paid"], default: "pending" },
    quotePrice: { type: Number, default: null },
    adminMessage: { type: String, default: "" },
  },
  { timestamps: true }
);

export default model("PrintRequest", printRequestSchema);
