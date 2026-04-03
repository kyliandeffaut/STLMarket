import React, { createContext, useEffect, useState } from "react";
import { AuthAPI, UserDTO } from "../lib/api";

type AuthCtx = {
  token: string | null;
  user: UserDTO | null;
  isAdmin: boolean;
  login: (token: string, user: UserDTO) => void;
  logout: () => void;
  refreshMe: () => Promise<void>;
};

export const AuthContext = createContext<AuthCtx>({} as AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // 1. On récupère le token
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("token"));

  // 2. On met un try/catch pour éviter l'écran blanc
  const [user, setUser] = useState<UserDTO | null>(() => {
    try {
      const raw = localStorage.getItem("user");
      // Si c'est vide ou "undefined", on renvoie null
      if (!raw || raw === "undefined") return null;
      // Sinon on essaie de lire le JSON
      return JSON.parse(raw) as UserDTO;
    } catch (e) {
      console.warn("Données utilisateur corrompues, reset effectué.");
      localStorage.removeItem("user"); // On nettoie automatiquement
      return null;
    }
  });

  const isAdmin = user?.role === "admin";

  // Sauvegarde auto du token
  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  // Sauvegarde auto du user
  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const refreshMe = async () => {
    if (!token) return;
    try {
      const { user } = await AuthAPI.me();
      setUser(user);
    } catch (e) {
      logout();
    }
  };

  useEffect(() => {
    refreshMe().catch(() => {});
  }, []);

  const login = (t: string, u: UserDTO) => {
    setToken(t);
    setUser(u);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ token, user, isAdmin, login, logout, refreshMe }}>
      {children}
    </AuthContext.Provider>
  );
}