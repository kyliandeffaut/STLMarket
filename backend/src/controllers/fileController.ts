import { Request, Response } from "express";
import File from "../models/File";

console.log("✅ fileController chargé")

export async function listFiles(_req: Request, res: Response) {
  const files = await File.find().sort({ createdAt: -1 });
  res.json(files);
}

export async function getByTitle(req: Request, res: Response) {
  const title = decodeURIComponent(req.params.title);
  const doc = await File.findOne({ title });
  if (!doc) return res.status(404).json({ error: "not_found" });
  res.json(doc);
}

export async function seedDemo(_req: Request, res: Response) {
  const demo = [
    {
      title: "Boîte",
      category: "Gadgets",
      price: 4.9,
      description: "Petite boîte imprimable sans support.",
      filename: "Boîte.stl",
      downloads: 0,
    },
    {
      title: "Support téléphone",
      category: "Utilitaires",
      price: 2.5,
      description: "Support de téléphone, stable et compact.",
      filename: "Support téléphone.stl",
      downloads: 0,
    },
    {
      title: "Pokeball",
      category: "Art",
      price: 5.5,
      description: "Figurine de Pokeball détaillée.",
      filename: "pokeball.stl",
      downloads: 0,
    },
  ];

  await File.deleteMany({});
  await File.insertMany(demo);
  res.json({ ok: true, count: demo.length });
}
