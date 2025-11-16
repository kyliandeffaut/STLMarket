import { Schema, model } from "mongoose";

const fileSchema = new Schema(
  {
    title: { type: String, required: true, unique: true }, // ex: "Boîte articulée"
    category: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    downloads: { type: Number, default: 0 },
    filename: { type: String, required: true }, // ex: "Boîte articulée.stl"
  },
  { timestamps: true }
);

export type FileDoc = {
  _id: string;
  title: string;
  category: string;
  price: number;
  description?: string;
  downloads: number;
  filename: string;
};

export default model<FileDoc>("File", fileSchema);
