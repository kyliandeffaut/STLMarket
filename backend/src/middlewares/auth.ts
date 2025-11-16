import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

// Le contenu du token que l'on attend
export type AuthPayload = { id: string; email: string; role: "USER" | "ADMIN" };

// Middleware: nécessite un token Bearer valide
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ error: "missing_token" });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
    // on stocke le payload sur la requête
    (req as any).auth = payload;
    next();
  } catch {
    return res.status(401).json({ error: "invalid_token" });
  }
}

// Optionnel: route réservée aux admins
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = (req as any).auth as AuthPayload | undefined;
  if (!auth) return res.status(401).json({ error: "unauthenticated" });
  if (auth.role !== "ADMIN") return res.status(403).json({ error: "forbidden" });
  next();
}
