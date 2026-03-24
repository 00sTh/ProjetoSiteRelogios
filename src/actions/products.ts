"use server";
import { prisma } from "@/lib/prisma";
import type { ProductWithRelations, CategoryWithBrands, BrandWithProducts } from "@/types";

export async function getCategories(): Promise<CategoryWithBrands[]> {
  return prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { brands: { include: { _count: { select: { products: true } } }, orderBy: { name: "asc" } }, _count: { select: { brands: true, products: true } } },
  }) as Promise<CategoryWithBrands[]>;
}

export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug }, include: { brands: { orderBy: { name: "asc" } } } });
}

export async function getBrandBySlug(slug: string) {
  return prisma.brand.findUnique({ where: { slug }, include: { category: true, _count: { select: { products: true } } } }) as Promise<BrandWithProducts | null>;
}

export async function getProducts(params?: { categoryId?: string; brandId?: string; featured?: boolean; take?: number; skip?: number; search?: string; }) {
  const where = {
    active: true,
    ...(params?.categoryId && { categoryId: params.categoryId }),
    ...(params?.brandId && { brandId: params.brandId }),
    ...(params?.featured && { featured: true }),
    ...(params?.search && { name: { contains: params.search, mode: "insensitive" as const } }),
  };
  const [products, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy: { createdAt: "desc" }, take: params?.take ?? 20, skip: params?.skip ?? 0, include: { brand: { include: { category: true } }, category: true } }),
    prisma.product.count({ where }),
  ]);
  return { products: products as ProductWithRelations[], total };
}

export async function getProductBySlug(slug: string): Promise<ProductWithRelations | null> {
  return prisma.product.findUnique({ where: { slug }, include: { brand: { include: { category: true } }, category: true } }) as Promise<ProductWithRelations | null>;
}

export async function getFeaturedProducts(take = 5): Promise<ProductWithRelations[]> {
  return prisma.product.findMany({ where: { featured: true, active: true }, take, include: { brand: { include: { category: true } }, category: true }, orderBy: { createdAt: "desc" } }) as Promise<ProductWithRelations[]>;
}

export async function getRelatedProducts(productId: string, brandId: string, take = 4): Promise<ProductWithRelations[]> {
  return prisma.product.findMany({ where: { brandId, active: true, id: { not: productId } }, take, include: { brand: { include: { category: true } }, category: true } }) as Promise<ProductWithRelations[]>;
}
