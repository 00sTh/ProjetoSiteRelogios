"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/auth";
import { addToCart } from "@/actions/cart";

const GUEST_CART_KEY = "altheia:guest-cart";

export interface GuestCartItem {
  productId: string;
  quantity: number;
  observations?: string;
}

export function getGuestCart(): GuestCartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    return raw ? (JSON.parse(raw) as GuestCartItem[]) : [];
  } catch {
    return [];
  }
}

export function setGuestCart(items: GuestCartItem[]): void {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

export function addToGuestCart(productId: string, quantity = 1, observations?: string): void {
  const items = getGuestCart();
  const existing = items.find((i) => i.productId === productId);
  if (existing) {
    existing.quantity += quantity;
    if (observations !== undefined) existing.observations = observations;
  } else {
    items.push({ productId, quantity, observations });
  }
  setGuestCart(items);
}

export function updateGuestCartItem(productId: string, quantity: number): void {
  const items = getGuestCart();
  if (quantity <= 0) {
    setGuestCart(items.filter((i) => i.productId !== productId));
  } else {
    setGuestCart(items.map((i) => (i.productId === productId ? { ...i, quantity } : i)));
  }
}

export function removeGuestCartItem(productId: string): void {
  setGuestCart(getGuestCart().filter((i) => i.productId !== productId));
}

export function clearGuestCart(): void {
  localStorage.removeItem(GUEST_CART_KEY);
}

/** Hook: sincroniza carrinho guest → banco ao fazer login */
export function useGuestCartSync(): void {
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const guestItems = getGuestCart();
    if (guestItems.length === 0) return;

    async function syncToDatabase() {
      await Promise.allSettled(
        guestItems.map((item) =>
          addToCart({ productId: item.productId, quantity: item.quantity, observations: item.observations })
        )
      );
      clearGuestCart();
    }

    void syncToDatabase();
  }, [isSignedIn, isLoaded]);
}
