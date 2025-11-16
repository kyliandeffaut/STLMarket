import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function register(req: Request, res: Response) {
  const { firstName, lastName, email, password } = req.body;

  if (!firstName || !lastName || !email || !password)
    return res.status(400).json({ error: "missing_fields" });

  const existing = await User.findOne({ email });
  if (existing) return res.status(400).json({ error: "email_already_used" });

  const hash = await bcrypt.hash(password, 10);
  const user = await User.create({ firstName, lastName, email, passwordHash: hash });

  res.json({ ok: true, id: user._id });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ error: "invalid_credentials" });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ error: "invalid_credentials" });

  const token = jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ ok: true, token, user: { id: user._id, firstName: user.firstName, role: user.role } });
}

export async function me(req: Request, res: Response) {
  const auth = (req as any).auth; // ou req.auth si tu as mis le d.ts
  const user = await User.findById(auth.id).select(
    "_id firstName lastName email role createdAt"
  );
  if (!user) return res.status(404).json({ error: "not_found" });
  res.json({ ok: true, user });
}