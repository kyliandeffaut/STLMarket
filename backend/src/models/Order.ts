import { Schema, model } from "mongoose";

const orderItemSchema = new Schema(
  {
    kind: { type: String, enum: ["file", "print"], required: true },
    fileId: { type: Schema.Types.ObjectId, ref: "File", default: null },
    requestId: { type: Schema.Types.ObjectId, ref: "PrintRequest", default: null },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    filename: { type: String, default: "" },
  },
  { _id: false }
);

const orderSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    items: { type: [orderItemSchema], required: true },
    totalPrice: { type: Number, required: true },
    status: { type: String, default: "paid" },
  },
  { timestamps: true }
);

export default model("Order", orderSchema);
