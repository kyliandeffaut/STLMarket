import { Router } from "express";
import File from "../models/File";

const r = Router();

r.get("/", async (_req, res) => {
  const files = await File.find().sort({ createdAt: -1 });
  res.json(files);
});

r.get("/:title", async (req, res) => {
  const title = decodeURIComponent(req.params.title);
  const file = await File.findOne({ title });
  if (!file) return res.status(404).json({ error: "not_found" });
  res.json(file);
});

export default r;
