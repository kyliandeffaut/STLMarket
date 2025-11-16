import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // ✅ définit @ comme racine vers /src
      "@pages": path.resolve(__dirname, "./src/pages"), // ✅ ajoute @pages
      "@components": path.resolve(__dirname, "./src/components"), // optionnel mais utile
      "@lib": path.resolve(__dirname, "./src/lib"), // pour ton api.ts
    },
  },
});
