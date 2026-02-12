import { Schema, model } from "mongoose";

const fileSchema = new Schema(
  {
    title: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, default: "" },
    filename: { type: String, required: true }, 
    downloads: { type: Number, default: 0 },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

export default model("File", fileSchema);