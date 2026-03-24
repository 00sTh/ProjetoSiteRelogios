import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const ids = req.nextUrl.searchParams.get("ids")?.split(",").filter(Boolean) ?? [];
  if (!ids.length) return NextResponse.json([]);
  const products = await prisma.product.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, price: true, images: true, slug: true, stock: true, brand: { select: { name: true } } },
  });
  return NextResponse.json(products.map(p => ({
    productId: p.id,
    name: p.name,
    price: Number(p.price),
    image: p.images[0] ?? null,
    slug: p.slug,
    stock: p.stock,
    brandName: p.brand.name,
  })));
}
