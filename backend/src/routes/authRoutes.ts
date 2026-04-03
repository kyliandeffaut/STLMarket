import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User";
import { requireAuth, signToken } from "../middlewares/auth";

const r = Router();

// définition des routes pour l'inscription et la connexion des utilisateurs
r.post("/register", async (req, res) => {
  const { firstName, lastName, email, password } = req.body ?? {};
  if (!firstName || !lastName || !email || !password) return res.status(400).json({ error: "missing_fields" });

  const exists = await User.findOne({ email: String(email).toLowerCase() });
  if (exists) return res.status(400).json({ error: "email_taken" });

  const passwordHash = await bcrypt.hash(String(password), 10);

  // je crée l'utilisateur avec un rôle "user" par défaut
  const user = await User.create({
    firstName,
    lastName,
    email: String(email).toLowerCase(),
    passwordHash,
    role: "user",
  });

  const token = signToken({ id: user._id.toString(), role: user.role });

  res.json({
    ok: true,
    token,
    user: { id: user._id.toString(), firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
  });
});

r.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password) return res.status(400).json({ error: "missing_fields" });

  const user = await User.findOne({ email: String(email).toLowerCase() });
  if (!user) return res.status(401).json({ error: "bad_credentials" });

  const ok = await bcrypt.compare(String(password), user.passwordHash);
  if (!ok) return res.status(401).json({ error: "bad_credentials" });

  const token = signToken({ id: user._id.toString(), role: user.role });

  res.json({
    ok: true,
    token,
    user: { id: user._id.toString(), firstName: user.firstName, lastName: user.lastName, email: user.email, role: user.role },
  });
});

export default r;