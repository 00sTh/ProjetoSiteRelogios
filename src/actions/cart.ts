"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getServerAuth } from "@/lib/auth";
import {
  addToCartSchema,
  updateQuantitySchema,
  removeFromCartSchema,
} from "@/schemas/cart.schema";
import type { CartWithItems } from "@/types";

// ─────────────────────────────────────────────────────────────────────────────
// Helper interno
// ─────────────────────────────────────────────────────────────────────────────

async function getOrCreateCart(clerkId: string) {
  const productSelect = {
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      stock: true,
      images: true,
    },
  };

  let cart = await prisma.cart.findUnique({
    where: { clerkId },
    include: { items: { include: { product: productSelect } } },
  });

  if (!cart) {
    const profile = await prisma.userProfile.findUnique({
      where: { clerkId },
      select: { id: true },
    });

    cart = await prisma.cart.create({
      data: { clerkId, userProfileId: profile?.id },
      include: { items: { include: { product: productSelect } } },
    });
  }

  return cart as unknown as CartWithItems;
}

// ─────────────────────────────────────────────────────────────────────────────
// Actions públicas
// ─────────────────────────────────────────────────────────────────────────────

/** Retorna o carrinho do usuário autenticado */
export async function getCart(): Promise<CartWithItems | null> {
  const { userId } = await getServerAuth();
  if (!userId) return null;
  return getOrCreateCart(userId);
}

/** Adiciona produto ao carrinho (banco ou localStorage para guest) */
export async function addToCart(
  data: z.infer<typeof addToCartSchema>
): Promise<void> {
  const { userId } = await getServerAuth();
  if (!userId) redirect("/sign-in");

  const { productId, quantity, observations } = addToCartSchema.parse(data);

  const product = await prisma.product.findUnique({
    where: { id: productId, active: true },
    select: { stock: true, name: true },
  });
  if (!product) throw new Error("Produto não encontrado");
  if (product.stock < quantity)
    throw new Error(`Estoque insuficiente para "${product.name}"`);

  const cart = await getOrCreateCart(userId);

  const existing = await prisma.cartItem.findUnique({
    where: { cartId_productId: { cartId: cart.id, productId } },
    select: { id: true, quantity: true },
  });

  if (existing) {
    const newQty = existing.quantity + quantity;
    if (newQty > product.stock)
      throw new Error(`Estoque insuficiente para "${product.name}"`);
    await prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQty, observations: observations ?? null },
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity, observations: observations ?? null },
    });
  }

  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

/** Atualiza quantidade de um item (0 = remove) */
export async function updateQuantity(
  data: z.infer<typeof updateQuantitySchema>
): Promise<void> {
  const { userId } = await getServerAuth();
  if (!userId) throw new Error("Não autenticado");

  const { cartItemId, quantity } = updateQuantitySchema.parse(data);

  if (quantity === 0) {
    await removeFromCart({ cartItemId });
    return;
  }

  await prisma.cartItem.update({ where: { id: cartItemId }, data: { quantity } });
  revalidatePath("/cart");
}

/** Remove item do carrinho */
export async function removeFromCart(
  data: z.infer<typeof removeFromCartSchema>
): Promise<void> {
  const { userId } = await getServerAuth();
  if (!userId) throw new Error("Não autenticado");

  const { cartItemId } = removeFromCartSchema.parse(data);
  await prisma.cartItem.delete({ where: { id: cartItemId } });

  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

/** Limpa o carrinho inteiro (pós-checkout) */
export async function clearCart(): Promise<void> {
  const { userId } = await getServerAuth();
  if (!userId) throw new Error("Não autenticado");

  const cart = await prisma.cart.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (cart) {
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  revalidatePath("/cart");
  revalidatePath("/", "layout");
}
