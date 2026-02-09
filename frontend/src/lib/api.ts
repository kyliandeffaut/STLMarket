import axios from "axios";

// 1. CONFIGURATION DE BASE
const api = axios.create({
  // En prod, ça utilisera ton backend Render. En local, ton localhost:3000
  baseURL: (import.meta as any).env?.VITE_API_URL || "http://localhost:3000",
  timeout: 10000,
});

// 2. INTERCEPTEUR (Token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// =========================================================
// AUTHENTIFICATION
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
    const { data: res } = await api.post("/api/auth/register", data);
    return res; 
  },
  async login(creds: { email: string; password: string }) {
    const { data: res } = await api.post("/api/auth/login", creds);
    return res;
  },
  async me() {
    const { data } = await api.get("/api/auth/me");
    return data;
  },
};

// =========================================================
// FICHIERS (CATALOGUE) - C'EST LA PARTIE IMPORTANTE
// =========================================================
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
    // ✅ CORRECTION : On demande le JSON via /api/files
    const { data } = await api.get("/api/files");
    return data;
  },
  async detailByTitle(title: string): Promise<FileDTO> {
    const { data } = await api.get(`/api/files/${encodeURIComponent(title)}`);
    return data;
  },
};

// =========================================================
// IMPRESSIONS (USER)
// =========================================================
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
    const { data } = await api.post("/api/print", fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data as { ok: true; id: string };
  },

  async my(): Promise<{ ok: true; requests: PrintRequestDTO[] }> {
    const { data } = await api.get("/api/print/my");
    return data;
  },
};

// =========================================================
// ADMIN IMPRESSIONS
// =========================================================
export const AdminPrintAPI = {
  async list() {
    const { data } = await api.get("/api/admin/prints");
    return data as { ok: true; requests: PrintRequestDTO[] };
  },

  async quote(id: string, price: number, adminMessage = "") {
    const { data } = await api.patch(`/api/admin/prints/${id}/quote`, { price, adminMessage });
    return data as { ok: true; request: PrintRequestDTO };
  },

  async reject(id: string, adminMessage = "") {
    const { data } = await api.delete(`/api/admin/prints/${id}`, { data: { adminMessage } });
    return data as { ok: true };
  },

  async remove(id: string) {
    const { data } = await api.delete(`/api/admin/prints/${id}`);
    return data as { ok: true };
  },
};

// =========================================================
// COMMANDES (ORDERS)
// =========================================================
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
    const { data } = await api.post("/api/orders", { items });
    return data as { ok: true; orderId: string };
  },

  async my(): Promise<{ ok: true; orders: OrderDTO[] }> {
    const { data } = await api.get("/api/orders/my");
    return data;
  },

  async remove(id: string) {
    const { data } = await api.delete(`/api/orders/${id}`);
    return data as { ok: true };
  },
};

export default api;