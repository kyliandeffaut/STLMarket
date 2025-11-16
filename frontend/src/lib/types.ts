export type STLFile = {
  id: string;
  title: string;
  category: string;
  price: number;
  description?: string;
  previewUrl?: string;
  downloads: number;
};

export type User = {
  id: string;
  email: string;
  name: string;
  role: "USER" | "ADMIN";
};

export type CartItem = {
  fileId: string;
  title: string;
  price: number;
  qty: number;
};
