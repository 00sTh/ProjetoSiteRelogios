"use client";

import { useState, useEffect, useCallback } from "react";
import { CART_KEY } from "@/lib/constants";
import type { CartItem } from "@/types";

function cartKey(productId: string, color?: string) {
  return `${productId}:${color ?? ""}`;
}

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
    (productId: string, quantity = 1, color?: string) => {
      const current = readCart();
      const existing = current.find(
        (i) => cartKey(i.productId, i.color) === cartKey(productId, color)
      );
      if (existing) {
        syncAndSet(
          current.map((i) =>
            cartKey(i.productId, i.color) === cartKey(productId, color)
              ? { ...i, quantity: i.quantity + quantity }
              : i
          )
        );
      } else {
        syncAndSet([...current, { productId, quantity, color }]);
      }
    },
    [syncAndSet]
  );

  const updateItem = useCallback(
    (productId: string, quantity: number, color?: string) => {
      const current = readCart();
      const key = cartKey(productId, color);
      if (quantity <= 0) {
        syncAndSet(current.filter((i) => cartKey(i.productId, i.color) !== key));
      } else {
        syncAndSet(
          current.map((i) =>
            cartKey(i.productId, i.color) === key ? { ...i, quantity } : i
          )
        );
      }
    },
    [syncAndSet]
  );

  const removeItem = useCallback(
    (productId: string, color?: string) => {
      const key = cartKey(productId, color);
      syncAndSet(readCart().filter((i) => cartKey(i.productId, i.color) !== key));
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
