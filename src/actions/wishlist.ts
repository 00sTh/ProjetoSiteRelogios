"use server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function getWishlist() {
  const userId = await getAuthUser();
  if (!userId) return [];
  return prisma.wishlistItem.findMany({ where: { userId }, include: { product: { include: { brand: { include: { category: true } }, category: true } } }, orderBy: { createdAt: "desc" } });
}

export async function toggleWishlist(productId: string) {
  const userId = await getAuthUser();
  if (!userId) return { error: "Not authenticated" };
  const existing = await prisma.wishlistItem.findUnique({ where: { userId_productId: { userId, productId } } });
  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    return { added: false };
  }
  await prisma.wishlistItem.create({ data: { userId, productId } });
  return { added: true };
}

export async function isInWishlist(productId: string) {
  const userId = await getAuthUser();
  if (!userId) return false;
  const item = await prisma.wishlistItem.findUnique({ where: { userId_productId: { userId, productId } } });
  return !!item;
}
