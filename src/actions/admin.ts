"use server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { uploadImage } from "@/lib/blob";
import { revalidatePath } from "next/cache";
import { OrderStatus } from "@/generated/prisma";
import { SITE_CONFIG_DEFAULTS } from "@/lib/site-config";

async function checkAdmin() {
  const adminId = await requireAdmin();
  if (!adminId) throw new Error("Unauthorized");
  return adminId;
}

// ── Categories ─────────────────────────────────────────────────────────────
export async function createCategory(formData: FormData) {
  await checkAdmin();
  const name = formData.get("name") as string;
  const slug = (formData.get("slug") as string) || slugify(name);
  const sortOrder = Number(formData.get("sortOrder") ?? 0);
  await prisma.category.create({ data: { name, slug, sortOrder } });
  revalidatePath("/admin/categorias");
}

export async function updateCategory(id: string, formData: FormData) {
  await checkAdmin();
  const name = formData.get("name") as string;
  await prisma.category.update({ where: { id }, data: { name, sortOrder: Number(formData.get("sortOrder") ?? 0) } });
  revalidatePath("/admin/categorias");
}

export async function deleteCategory(id: string) {
  await checkAdmin();
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categorias");
}

// ── Brands ─────────────────────────────────────────────────────────────────
export async function createBrand(formData: FormData) {
  await checkAdmin();
  const name = formData.get("name") as string;
  const categoryId = formData.get("categoryId") as string;
  const baseSlug = slugify(name);
  const catRecord = await prisma.category.findUnique({ where: { id: categoryId } });
  const prefix = catRecord ? catRecord.slug.slice(0, 3) : "x";
  const slug = `${prefix}-${baseSlug}`;
  const description = formData.get("description") as string || null;

  let logo: string | null = null;
  let banner: string | null = null;
  const logoFile = formData.get("logo") as File | null;
  const bannerFile = formData.get("banner") as File | null;
  if (logoFile && logoFile.size > 0) logo = await uploadImage(logoFile, "slc/brands");
  if (bannerFile && bannerFile.size > 0) banner = await uploadImage(bannerFile, "slc/brands");

  await prisma.brand.create({ data: { name, slug, description, logo, banner, categoryId } });
  revalidatePath("/admin/marcas");
}

export async function updateBrand(id: string, formData: FormData) {
  await checkAdmin();
  const name = formData.get("name") as string;
  const categoryId = formData.get("categoryId") as string;
  const description = formData.get("description") as string || null;
  const data: Record<string, unknown> = { name, description, categoryId };
  const logoFile = formData.get("logo") as File | null;
  const bannerFile = formData.get("banner") as File | null;
  if (logoFile && logoFile.size > 0) data.logo = await uploadImage(logoFile, "slc/brands");
  if (bannerFile && bannerFile.size > 0) data.banner = await uploadImage(bannerFile, "slc/brands");
  await prisma.brand.update({ where: { id }, data });
  revalidatePath("/admin/marcas");
}

export async function deleteBrand(id: string) {
  await checkAdmin();
  await prisma.brand.delete({ where: { id } });
  revalidatePath("/admin/marcas");
}

// ── Gemini color detection ─────────────────────────────────────────────────
export async function detectProductColors(imageUrl: string): Promise<string[]> {
  await checkAdmin();
  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const res = await fetch(imageUrl);
  const buffer = await res.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");
  const mimeType = (res.headers.get("content-type") ?? "image/jpeg").split(";")[0];

  const result = await model.generateContent([
    { inlineData: { mimeType, data: base64 } },
    "Analise esta imagem de produto de luxo. Identifique as variações de cor do produto em si (não do fundo). Retorne APENAS nomes de cores curtos em português, separados por vírgula, sem explicações. Máximo 6 cores. Exemplos: 'Preto', 'Preto, Prata', 'Azul Marinho, Branco, Dourado'.",
  ]);

  const text = result.response.text().trim();
  return text.split(",").map((c) => c.trim()).filter(Boolean);
}

// ── Products ───────────────────────────────────────────────────────────────
export async function createProduct(formData: FormData) {
  await checkAdmin();
  const name = formData.get("name") as string;
  const slug = slugify(name);
  const brandId = formData.get("brandId") as string;
  const categoryId = formData.get("categoryId") as string;
  const price = parseFloat(formData.get("price") as string);
  const comparePriceRaw = formData.get("comparePrice") as string;
  const comparePrice = comparePriceRaw ? parseFloat(comparePriceRaw) : null;
  const stock = parseInt(formData.get("stock") as string ?? "0");
  const description = formData.get("description") as string || null;
  const sku = formData.get("sku") as string || null;
  const featured = formData.get("featured") === "true";
  const attrRaw = formData.get("attributes") as string;
  let attributes = null;
  if (attrRaw) {
    try { attributes = JSON.parse(attrRaw); } catch { attributes = null; }
  }
  const colorsRaw = formData.get("colors") as string;
  const colors = colorsRaw ? colorsRaw.split(",").map((c) => c.trim()).filter(Boolean) : [];

  const imageFiles = formData.getAll("images") as File[];
  const images: string[] = [];
  for (const f of imageFiles) {
    if (f.size > 0) images.push(await uploadImage(f, "slc"));
  }

  await prisma.product.create({ data: { name, slug, brandId, categoryId, price, comparePrice, stock, description, sku, featured, images, attributes, colors } });
  revalidatePath("/admin/produtos");
}

export async function updateProduct(id: string, formData: FormData) {
  await checkAdmin();
  const name = formData.get("name") as string;
  const brandId = formData.get("brandId") as string;
  const categoryId = formData.get("categoryId") as string;
  const price = parseFloat(formData.get("price") as string);
  const comparePriceRaw = formData.get("comparePrice") as string;
  const comparePrice = comparePriceRaw ? parseFloat(comparePriceRaw) : null;
  const stock = parseInt(formData.get("stock") as string ?? "0");
  const description = formData.get("description") as string || null;
  const sku = formData.get("sku") as string || null;
  const featured = formData.get("featured") === "true";
  const active = formData.get("active") === "true";
  const attrRaw = formData.get("attributes") as string;
  let attributes = null;
  if (attrRaw) {
    try { attributes = JSON.parse(attrRaw); } catch { attributes = null; }
  }
  let existingImages: string[] = [];
  try { existingImages = JSON.parse((formData.get("existingImages") as string) ?? "[]"); } catch { existingImages = []; }
  const colorsRaw = formData.get("colors") as string;
  const colors = colorsRaw ? colorsRaw.split(",").map((c) => c.trim()).filter(Boolean) : [];

  const imageFiles = formData.getAll("images") as File[];
  const newImages: string[] = [];
  for (const f of imageFiles) {
    if (f.size > 0) newImages.push(await uploadImage(f, "slc"));
  }

  await prisma.product.update({ where: { id }, data: { name, brandId, categoryId, price, comparePrice, stock, description, sku, featured, active, attributes, colors, images: [...existingImages, ...newImages] } });
  revalidatePath("/admin/produtos");
}

export async function deleteProduct(id: string) {
  await checkAdmin();
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/produtos");
}

// ── Orders ─────────────────────────────────────────────────────────────────
export async function getAdminOrders(params?: { status?: string; take?: number; skip?: number }) {
  await checkAdmin();
  const where = params?.status ? { status: params.status as OrderStatus } : {};
  const [orders, total] = await Promise.all([
    prisma.order.findMany({ where, orderBy: { createdAt: "desc" }, take: params?.take ?? 20, skip: params?.skip ?? 0, include: { items: { include: { product: { select: { name: true, images: true } } } } } }),
    prisma.order.count({ where }),
  ]);
  return { orders, total };
}

export async function updateOrderStatus(id: string, status: string) {
  await checkAdmin();
  await prisma.order.update({ where: { id }, data: { status: status as OrderStatus } });
  revalidatePath("/admin/pedidos");
}

// ── SiteConfig ─────────────────────────────────────────────────────────────
export async function getSiteConfig(): Promise<Record<string, string>> {
  const rows = await prisma.siteConfig.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export async function setSiteConfigsFromForm(formData: FormData) {
  await checkAdmin();
  const knownKeys = Object.keys(SITE_CONFIG_DEFAULTS);
  for (const key of knownKeys) {
    const value = (formData.get(key) as string) ?? "";
    await prisma.siteConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
  revalidatePath("/");
  revalidatePath("/sobre");
  revalidatePath("/admin/configuracoes");
}

export async function getAdminStats() {
  await checkAdmin();
  const [totalProducts, totalOrders, pendingOrders] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
  ]);
  const revenue = await prisma.order.aggregate({ where: { status: { in: ["PAID", "SHIPPED", "DELIVERED"] } }, _sum: { total: true } });
  return { totalProducts, totalOrders, pendingOrders, revenue: Number(revenue._sum.total ?? 0) };
}
