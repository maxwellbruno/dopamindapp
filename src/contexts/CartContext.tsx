import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { StoreProduct } from '@/lib/store';

export type CartLine = { productId: string; name: string; emoji: string; priceKes: number; quantity: number; stock: number };

type CartCtx = {
  lines: CartLine[];
  count: number;
  totalKes: number;
  isOpen: boolean;
  setOpen: (v: boolean) => void;
  add: (p: StoreProduct) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = 'dopamind_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lines, setLines] = useState<CartLine[]>(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
  });
  const [isOpen, setOpen] = useState(false);

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(lines)); }, [lines]);

  const value = useMemo<CartCtx>(() => ({
    lines,
    isOpen,
    setOpen,
    count: lines.reduce((s, l) => s + l.quantity, 0),
    totalKes: lines.reduce((s, l) => s + l.quantity * l.priceKes, 0),
    add: (p) => setLines((prev) => {
      const existing = prev.find((l) => l.productId === p.id);
      if (existing) {
        return prev.map((l) => l.productId === p.id ? { ...l, quantity: Math.min(l.quantity + 1, p.stock, 20) } : l);
      }
      return [...prev, { productId: p.id, name: p.name, emoji: p.emoji, priceKes: p.price_kes, quantity: 1, stock: p.stock }];
    }),
    setQty: (id, qty) => setLines((prev) => prev.map((l) => l.productId === id ? { ...l, quantity: Math.max(1, Math.min(qty, l.stock, 20)) } : l)),
    remove: (id) => setLines((prev) => prev.filter((l) => l.productId !== id)),
    clear: () => setLines([]),
  }), [lines, isOpen]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error('useCart must be used inside CartProvider');
  return c;
};
