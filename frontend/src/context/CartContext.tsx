import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartKind = "file" | "print";

export type CartItem = {
  // id interne panier (clé unique)
  _id: string;

  kind: CartKind;

  // pour un fichier du catalogue
  fileId?: string;

  // pour une demande d'impression
  requestId?: string;

  title: string;
  price: number;
  category?: string;
  filename?: string;

  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  count: number;
  subtotal: number;
  addItem: (p: Omit<CartItem, "quantity">, qty?: number) => void;
  decreaseItem: (cartId: string) => void;
  removeItem: (cartId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

const LS_KEY = "stlmarket_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  }, [items]);

  const addItem: CartContextType["addItem"] = (p, qty = 1) => {
    setItems((prev) => {
      const i = prev.findIndex((x) => x._id === p._id);
      if (i === -1) return [...prev, { ...p, quantity: qty }];

      const next = [...prev];
      next[i] = { ...next[i], quantity: next[i].quantity + qty };
      return next;
    });
  };

  const decreaseItem: CartContextType["decreaseItem"] = (cartId) => {
    setItems((prev) => {
      const i = prev.findIndex((x) => x._id === cartId);
      if (i === -1) return prev;

      const next = [...prev];
      const q = next[i].quantity - 1;

      if (q <= 0) return next.filter((x) => x._id !== cartId);
      next[i] = { ...next[i], quantity: q };
      return next;
    });
  };

  const removeItem: CartContextType["removeItem"] = (cartId) => {
    setItems((prev) => prev.filter((x) => x._id !== cartId));
  };

  const clear = () => setItems([]);

  const value = useMemo(() => {
    const count = items.reduce((s, it) => s + it.quantity, 0);
    const subtotal = items.reduce((s, it) => s + it.quantity * it.price, 0);
    return { items, count, subtotal, addItem, decreaseItem, removeItem, clear };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
