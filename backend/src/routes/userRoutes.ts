import { Router } from "express";
import { register, login, me } from "../controllers/userController";
import { requireAuth } from "../middlewares/auth";

console.log("✅ userRoutes chargé");

const r = Router();

r.post("/register", register);
r.post("/login", login);
r.get("/me", requireAuth, me);

export default r;
