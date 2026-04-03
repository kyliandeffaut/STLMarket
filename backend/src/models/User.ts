import { Schema, model } from "mongoose";

export type UserRole = "user" | "admin";

// structure de l'utilisateur dans la base de données
const userSchema = new Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    // je gère deux rôles : utilisateur standard ou administrateur
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

export default model("User", userSchema);