import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 10000,
});

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

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
