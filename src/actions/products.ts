"use server";

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";
import type { ProductWithCategory } from "@/types";

/** Parâmetros de filtro para listagem de produtos */
interface GetProductsParams {
  categorySlug?: string;
  brand?: string;
  page?: number;
  featured?: boolean;
  search?: string;
  take?: number;
  skipCount?: boolean;
}

/** Retorna produtos com paginação e filtros opcionais */
export async function getProducts(params: GetProductsParams = {}): Promise<{
  products: ProductWithCategory[];
  total: number;
  pages: number;
}> {
  const { categorySlug, brand, page = 1, featured, search, take, skipCount } = params;

  const where = {
    active: true,
    ...(featured !== undefined && { featured }),
    ...(categorySlug && { category: { slug: categorySlug } }),
    ...(brand && { brand }),
    ...(search && {
      OR: [
        {
          name: {
            contains: search,
            ...((process.env.DATABASE_URL ?? "").startsWith("postgres") && {
              mode: "insensitive" as const,
            }),
          },
        },
        {
          description: {
            contains: search,
            ...((process.env.DATABASE_URL ?? "").startsWith("postgres") && {
              mode: "insensitive" as const,
            }),
          },
        },
      ],
    }),
  };

  const [products, total] = skipCount
    ? [
        await prisma.product.findMany({
          where,
          include: { category: true },
          orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
          take: take ?? PRODUCTS_PER_PAGE,
          skip: 0,
        }),
        0,
      ]
    : await Promise.all([
        prisma.product.findMany({
          where,
          include: { category: true },
          orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
          take: take ?? PRODUCTS_PER_PAGE,
          skip: (page - 1) * PRODUCTS_PER_PAGE,
        }),
        prisma.product.count({ where }),
      ]);

  return {
    products: products as ProductWithCategory[],
    total,
    pages: Math.ceil(total / (PRODUCTS_PER_PAGE || 1)),
  };
}

/** Busca um produto pelo slug (cache() deduplica entre generateMetadata e page) */
export const getProductBySlug = cache(async (
  slug: string
): Promise<ProductWithCategory | null> => {
  const product = await prisma.product.findUnique({
    where: { slug, active: true },
    include: { category: true },
  });
  return product as ProductWithCategory | null;
});

/** Busca produtos por lista de IDs (usado pelo carrinho guest) */
export async function getProductsByIds(ids: string[]) {
  if (ids.length === 0) return [];
  return prisma.product.findMany({
    where: { id: { in: ids }, active: true },
    select: { id: true, name: true, price: true, images: true, stock: true, slug: true },
  });
}

/** Retorna todas as categorias */
export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });
}

/** Converte slug de marca para nome exato no banco (ex: "louis-vuitton" → "Louis Vuitton") */
export async function getBrandBySlug(slug: string): Promise<string | null> {
  const products = await prisma.product.findMany({
    where: { active: true, brand: { not: null } },
    select: { brand: true },
    distinct: ["brand"],
  });
  const normalized = slug.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  for (const p of products) {
    if (!p.brand) continue;
    const candidateSlug = p.brand.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (candidateSlug === normalized) return p.brand;
  }
  return null;
}

/** Retorna todas as marcas distintas (com produtos ativos) */
export async function getAllBrands(): Promise<string[]> {
  const products = await prisma.product.findMany({
    where: { active: true, brand: { not: null } },
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" },
  });
  return products.map((p) => p.brand).filter((b): b is string => Boolean(b));
}

/** Retorna marcas distintas (com produtos ativos) dentro de uma categoria */
export async function getBrandsInCategory(categorySlug: string): Promise<string[]> {
  const products = await prisma.product.findMany({
    where: {
      active: true,
      brand: { not: "" },
      category: { slug: categorySlug },
    },
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" },
  });
  return products.map((p) => p.brand).filter((b): b is string => Boolean(b));
}
