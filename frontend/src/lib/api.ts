// frontend/src/lib/api.ts
import axios from "axios";

const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || "http://localhost:3000/api",
  timeout: 10000,
});

// ✅ Token auto (injecté s'il existe)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// =========================================================
// 👇 LA PARTIE QUI TE MANQUAIT (C'est ça qui corrige l'erreur)
// =========================================================

export type UserDTO = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin";
};

export const AuthAPI = {
  async register(data: any) {
    const { data: res } = await api.post("/auth/register", data);
    return res; 
  },
  async login(creds: { email: string; password: string }) {
    const { data: res } = await api.post("/auth/login", creds);
    return res;
  },
  async me() {
    const { data } = await api.get("/auth/me");
    return data;
  },
};

// =========================================================
// LE RESTE DE TON CODE (JE L'AI GARDÉ TEL QUEL)
// =========================================================

// ---------------- FILES ----------------
export type FileDTO = {
  _id: string;
  title: string;
  category: string;
  price: number;
  description?: string;
  downloads: number;
  filename: string;
};

export const FilesAPI = {
  async list(): Promise<FileDTO[]> {
    const { data } = await api.get("/files");
    return data;
  },
  async detailByTitle(title: string): Promise<FileDTO> {
    const { data } = await api.get(`/files/${encodeURIComponent(title)}`);
    return data;
  },
};

// ---------------- PRINT REQUESTS ----------------
export type PrintRequestStatus = "pending" | "quoted" | "rejected" | "paid";

export type PrintRequestDTO = {
  _id: string;
  userId: string;
  originalName: string;
  storedName: string;
  notes: string;
  status: PrintRequestStatus;
  quotePrice: number | null;
  adminMessage?: string;
  createdAt: string;
  updatedAt: string;
};

export const PrintAPI = {
  async create(stlFile: File, notes: string) {
    const fd = new FormData();
    fd.append("stl", stlFile);
    fd.append("notes", notes);

    const { data } = await api.post("/prints", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data as { ok: true; id: string };
  },

  async my(): Promise<{ ok: true; requests: PrintRequestDTO[] }> {
    const { data } = await api.get("/prints/my");
    return data;
  },
};

// ---------------- ADMIN PRINTS ----------------
export const AdminPrintAPI = {
  async list() {
    const { data } = await api.get("/admin/prints");
    return data as { ok: true; requests: PrintRequestDTO[] };
  },

  async quote(id: string, price: number, adminMessage = "") {
    const { data } = await api.patch(`/admin/prints/${id}/quote`, { price, adminMessage });
    return data as { ok: true; request: PrintRequestDTO };
  },

  async reject(id: string, adminMessage = "") {
    // Dans notre backend actuel, "Refuser" = "Supprimer" (DELETE)
    // On passe le message en body si besoin, même si DELETE l'ignore souvent
    const { data } = await api.delete(`/admin/prints/${id}`, { data: { adminMessage } });
    return data as { ok: true };
  },

  async remove(id: string) {
    const { data } = await api.delete(`/admin/prints/${id}`);
    return data as { ok: true };
  },
};

// ---------------- ORDERS ----------------
export type OrderItemDTO = {
  kind: "file" | "print";
  fileId?: string;
  requestId?: string;
  title: string;
  price: number;
  quantity: number;
  filename?: string;
};

export type OrderDTO = {
  _id: string;
  totalPrice: number;
  status: string;
  createdAt: string;
  items: OrderItemDTO[];
};

export const OrdersAPI = {
  async create(items: OrderItemDTO[]) {
    const { data } = await api.post("/orders", { items });
    return data as { ok: true; orderId: string };
  },

  // On précise ici que ça renvoie une liste de OrderDTO
  async my(): Promise<{ ok: true; orders: OrderDTO[] }> {
    const { data } = await api.get("/orders/my");
    return data;
  },

  async remove(id: string) {
    const { data } = await api.delete(`/orders/${id}`);
    return data as { ok: true };
  },
};

export default api;