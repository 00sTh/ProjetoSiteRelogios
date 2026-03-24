"use client";

import { useState, useEffect, useCallback } from "react";
import { CART_KEY } from "@/lib/constants";
import type { CartItem } from "@/types";

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function useGuestCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(readCart());
  }, []);

  const syncAndSet = useCallback((next: CartItem[]) => {
    writeCart(next);
    setItems(next);
  }, []);

  const addItem = useCallback(
    (productId: string, quantity = 1) => {
      const current = readCart();
      const existing = current.find((i) => i.productId === productId);
      if (existing) {
        syncAndSet(
          current.map((i) =>
            i.productId === productId
              ? { ...i, quantity: i.quantity + quantity }
              : i
          )
        );
      } else {
        syncAndSet([...current, { productId, quantity }]);
      }
    },
    [syncAndSet]
  );

  const updateItem = useCallback(
    (productId: string, quantity: number) => {
      const current = readCart();
      if (quantity <= 0) {
        syncAndSet(current.filter((i) => i.productId !== productId));
      } else {
        syncAndSet(
          current.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          )
        );
      }
    },
    [syncAndSet]
  );

  const removeItem = useCallback(
    (productId: string) => {
      syncAndSet(readCart().filter((i) => i.productId !== productId));
    },
    [syncAndSet]
  );

  const clearCart = useCallback(() => {
    syncAndSet([]);
  }, [syncAndSet]);

  const count = items.reduce((acc, i) => acc + i.quantity, 0);

  return { items, addItem, updateItem, removeItem, clearCart, count };
}

export function useCartCount() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const update = () => {
      const items = readCart();
      setCount(items.reduce((acc, i) => acc + i.quantity, 0));
    };
    update();
    window.addEventListener("storage", update);
    return () => window.removeEventListener("storage", update);
  }, []);
  return count;
}
