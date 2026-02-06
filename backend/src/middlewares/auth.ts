import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

export type AuthPayload = { id: string; role: "user" | "admin" };

export function signToken(payload: AuthPayload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h?.startsWith("Bearer ")) return res.status(401).json({ error: "missing_token" });

  const token = h.slice("Bearer ".length);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload;
    (req as any).auth = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "invalid_token" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = (req as any).auth as AuthPayload | undefined;
  if (!auth) return res.status(401).json({ error: "missing_token" });
  if (auth.role !== "admin") return res.status(403).json({ error: "not_admin" });
  next();
}
