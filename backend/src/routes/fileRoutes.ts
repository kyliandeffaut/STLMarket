import { Router } from "express";
import { listFiles, getByTitle, seedDemo } from "../controllers/fileController";

console.log("📦 fileRoutes chargé"); // log temporaire pour debug

const r = Router();
r.get("/_debug", (_req, res) => res.json({ router: "ok" })); // route debug

r.get("/", listFiles);
r.get("/:title", getByTitle);
r.post("/seed", seedDemo);

export default r;
