"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { getServerAuth } from "@/lib/auth";
import { uploadImage, deleteImage } from "@/lib/blob";
import { z } from "zod";
import { Prisma, OrderStatus } from "@prisma/client";

// ─── Auth guard ─────────────────────────────────────────────────────────────

async function requireAdmin() {
  const { userId, sessionClaims } = await getServerAuth();
  if (!userId) redirect("/sign-in");
  const role = sessionClaims?.metadata?.role;
  if (role !== "admin") redirect("/");
}

// ─── SiteSettings ────────────────────────────────────────────────────────────

export const getSiteSettings = cache(async () => {
  return prisma.siteSettings.upsert({
    where: { id: "default" },
    create: { id: "default" },
    update: {},
  });
});

// Aceita URL absoluta (https://...) OU caminho relativo (/uploads/...) OU vazio
const imageUrl = z
  .string()
  .refine(
    (v) => !v || v.startsWith("/") || /^https?:\/\//i.test(v),
    "URL inválida: use https://... ou /uploads/..."
  )
  .optional()
  .or(z.literal(""));

// Aceita apenas URL absoluta (links externos, YouTube, redes sociais)
const absUrl = z.string().url().optional().or(z.literal(""));

const siteSettingsSchema = z.object({
  siteLogoUrl: imageUrl,
  heroTitle: z.string().min(1).max(200),
  heroSubtitle: z.string().min(1).max(500),
  heroImageUrl: imageUrl,
  heroVideoUrl: absUrl,
  leftVideoUrl: absUrl,
  rightVideoUrl: absUrl,
  heroLogoUrl: imageUrl,
  luminaLabel: z.string().max(100).optional().or(z.literal("")),
  luminaTitle: z.string().max(200).optional().or(z.literal("")),
  luminaSubtitle: z.string().max(1000).optional().or(z.literal("")),
  luminaImageUrl: imageUrl,
  luminaBadgeText: z.string().max(50).optional().or(z.literal("")),
  luminaProductLink: z.string().max(200).optional().or(z.literal("")),
  aboutTitle: z.string().min(1).max(200),
  aboutText: z.string().min(1).max(5000),
  aboutImageUrl: imageUrl,
  featuredVideoUrl: absUrl,
  featuredVideoTitle: z.string().max(200).optional().or(z.literal("")),
  featuredVideoDesc: z.string().max(500).optional().or(z.literal("")),
  instagramUrl: absUrl,
  youtubeUrl: absUrl,
  twitterUrl: absUrl,
  newsletterTitle: z.string().max(200).optional().or(z.literal("")),
  newsletterSubtitle: z.string().max(500).optional().or(z.literal("")),
  metaTitle: z.string().max(70).optional().or(z.literal("")),
  metaDescription: z.string().max(160).optional().or(z.literal("")),
  shippingFreeThreshold: z.coerce.number().min(0),
  whatsappNumber: z.string().max(20).optional().or(z.literal("")),
  // WhyAltheia
  whyTitle: z.string().max(200).optional().or(z.literal("")),
  whySubtitle: z.string().max(500).optional().or(z.literal("")),
  benefit1Icon: z.string().max(50).optional().or(z.literal("")),
  benefit1Title: z.string().max(200).optional().or(z.literal("")),
  benefit1Text: z.string().max(500).optional().or(z.literal("")),
  benefit2Icon: z.string().max(50).optional().or(z.literal("")),
  benefit2Title: z.string().max(200).optional().or(z.literal("")),
  benefit2Text: z.string().max(500).optional().or(z.literal("")),
  benefit3Icon: z.string().max(50).optional().or(z.literal("")),
  benefit3Title: z.string().max(200).optional().or(z.literal("")),
  benefit3Text: z.string().max(500).optional().or(z.literal("")),
  notificationEmail: z.string().email().optional().or(z.literal("")),
  cepOrigem: z.string().max(9).optional().or(z.literal("")),
  pesoMedioProduto: z.coerce.number().int().min(1).max(30000).optional(),
});

export async function updateSiteSettings(formData: FormData) {
  await requireAdmin();

  const raw = Object.fromEntries(formData.entries());
  const parsed = siteSettingsSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const data = parsed.data;

  const nullable = (v: string | undefined) => v || null;

  await prisma.siteSettings.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      ...data,
      siteLogoUrl: nullable(data.siteLogoUrl),
      heroImageUrl: nullable(data.heroImageUrl),
      heroVideoUrl: nullable(data.heroVideoUrl),
      leftVideoUrl: nullable(data.leftVideoUrl),
      rightVideoUrl: nullable(data.rightVideoUrl),
      heroLogoUrl: nullable(data.heroLogoUrl),
      luminaImageUrl: nullable(data.luminaImageUrl),
      aboutImageUrl: nullable(data.aboutImageUrl),
      featuredVideoUrl: nullable(data.featuredVideoUrl),
      instagramUrl: nullable(data.instagramUrl),
      youtubeUrl: nullable(data.youtubeUrl),
      twitterUrl: nullable(data.twitterUrl),
      metaTitle: nullable(data.metaTitle),
      metaDescription: nullable(data.metaDescription),
      notificationEmail: nullable(data.notificationEmail),
    },
    update: {
      ...data,
      siteLogoUrl: nullable(data.siteLogoUrl),
      heroImageUrl: nullable(data.heroImageUrl),
      heroVideoUrl: nullable(data.heroVideoUrl),
      leftVideoUrl: nullable(data.leftVideoUrl),
      rightVideoUrl: nullable(data.rightVideoUrl),
      heroLogoUrl: nullable(data.heroLogoUrl),
      luminaImageUrl: nullable(data.luminaImageUrl),
      aboutImageUrl: nullable(data.aboutImageUrl),
      featuredVideoUrl: nullable(data.featuredVideoUrl),
      instagramUrl: nullable(data.instagramUrl),
      youtubeUrl: nullable(data.youtubeUrl),
      twitterUrl: nullable(data.twitterUrl),
      metaTitle: nullable(data.metaTitle),
      metaDescription: nullable(data.metaDescription),
      notificationEmail: nullable(data.notificationEmail),
    },
  });

  revalidatePath("/", "layout");
  revalidatePath("/sobre-nos");
  revalidatePath("/videos");
  return { success: true };
}

// ─── Products ────────────────────────────────────────────────────────────────

const productSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().min(10).max(5000),
  price: z.coerce.number().min(0.01),
  stock: z.coerce.number().int().min(0),
  categoryId: z.string().uuid(),
  featured: z
    .string()
    .optional()
    .transform((v) => v === "on"),
  active: z
    .string()
    .optional()
    .transform((v) => v === "on"),
  imageUrls: z.string().optional(), // JSON array of URLs
  ingredients: z.string().optional(),
  usage: z.string().optional(),
});

export async function createProduct(formData: FormData) {
  await requireAdmin();

  const raw = Object.fromEntries(formData.entries());
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { imageUrls, ingredients, usage, ...data } = parsed.data;
  let images: string[] = [];
  try {
    images = imageUrls ? JSON.parse(imageUrls) : [];
  } catch {}

  // Handle file upload
  const file = formData.get("imageFile") as File | null;
  if (file && file.size > 0) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const { url } = await uploadImage(buffer, `${data.slug}-${Date.now()}.jpg`);
      images = [url, ...images];
    } catch (uploadErr) {
      return { success: false, error: (uploadErr as Error).message };
    }
  }

  let product;
  try {
    product = await prisma.product.create({
      data: {
        ...data,
        images: images,
        ingredients: ingredients || null,
        usage: usage || null,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { success: false, error: "Já existe um produto com este slug." };
    }
    throw err;
  }

  revalidatePath("/products");
  revalidatePath("/admin/products");
  return { success: true, id: product.id };
}

export async function updateProduct(id: string, formData: FormData) {
  await requireAdmin();

  const raw = Object.fromEntries(formData.entries());
  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { imageUrls, ingredients, usage, ...data } = parsed.data;
  let images: string[] = [];
  try {
    images = imageUrls ? JSON.parse(imageUrls) : [];
  } catch {}

  const file = formData.get("imageFile") as File | null;
  if (file && file.size > 0) {
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const { url } = await uploadImage(buffer, `${data.slug}-${Date.now()}.jpg`);
      images = [url, ...images];
    } catch (uploadErr) {
      return { success: false, error: (uploadErr as Error).message };
    }
  }

  try {
    await prisma.product.update({
      where: { id },
      data: {
        ...data,
        images: images,
        ingredients: ingredients || null,
        usage: usage || null,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { success: false, error: "Já existe um produto com este slug." };
    }
    throw err;
  }

  revalidatePath(`/products/${data.slug}`);
  revalidatePath("/products");
  revalidatePath("/admin/products");
  return { success: true };
}

/** Soft delete — desativa o produto (continua no banco) */
export async function deleteProduct(id: string) {
  await requireAdmin();

  await prisma.product.update({
    where: { id },
    data: { active: false },
  });

  revalidatePath("/products");
  revalidatePath("/admin/products");
  return { success: true };
}

/** Hard delete — remove permanentemente.
 *  Se o produto tem pedidos históricos (OrderItem), faz soft delete em vez disso.
 */
export async function hardDeleteProduct(id: string) {
  await requireAdmin();

  // Verificar se há pedidos históricos referenciando este produto
  const orderItemCount = await prisma.orderItem.count({ where: { productId: id } });

  if (orderItemCount > 0) {
    // Não é possível excluir — há pedidos históricos. Faz soft delete.
    await prisma.product.update({ where: { id }, data: { active: false } });
    revalidatePath("/products");
    revalidatePath("/admin/products");
    return { success: true, softDeleted: true };
  }

  // Remove registros filhos sem cascade
  await prisma.$transaction([
    prisma.cartItem.deleteMany({ where: { productId: id } }),
    prisma.wishlistItem.deleteMany({ where: { productId: id } }),
    prisma.product.delete({ where: { id } }),
  ]);

  revalidatePath("/products");
  revalidatePath("/admin/products");
  return { success: true, softDeleted: false };
}

/** Alterna o flag featured do produto */
export async function toggleProductFeatured(id: string, featured: boolean) {
  await requireAdmin();

  await prisma.product.update({
    where: { id },
    data: { featured },
  });

  revalidatePath("/products");
  revalidatePath("/admin/products");
  revalidatePath("/");
  return { success: true };
}

export async function getAdminProducts() {
  await requireAdmin();
  return prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Orders ──────────────────────────────────────────────────────────────────

const VALID_STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdmin();
  if (!VALID_STATUSES.includes(status)) {
    return { success: false, error: "Status inválido" };
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: status as OrderStatus },
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}

export async function getAdminOrders(page = 1, pageSize = 20) {
  await requireAdmin();
  const skip = (page - 1) * pageSize;
  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      take: pageSize,
      skip,
      orderBy: { createdAt: "desc" },
      include: {
        userProfile: { select: { email: true, firstName: true, lastName: true } },
        items: {
          include: { product: { select: { name: true, images: true } } },
        },
      },
    }),
    prisma.order.count(),
  ]);
  return { orders, total, pages: Math.ceil(total / pageSize) };
}

export async function getAdminOrder(id: string) {
  await requireAdmin();
  return prisma.order.findUnique({
    where: { id },
    include: {
      userProfile: true,
      items: {
        include: { product: true },
      },
    },
  });
}

// ─── Newsletter subscribers ───────────────────────────────────────────────────

export async function getNewsletterSubscribers() {
  await requireAdmin();
  return prisma.newsletterSubscriber.findMany({
    orderBy: { createdAt: "desc" },
  });
}

// ─── Media Assets ─────────────────────────────────────────────────────────────

export async function createMediaAsset(formData: FormData) {
  await requireAdmin();

  const type = (formData.get("type") as string) || "IMAGE";
  const name = (formData.get("name") as string) || "";

  // ── Vídeo (URL) ────────────────────────────────────────────────────────────
  if (type === "VIDEO") {
    const url = formData.get("url") as string;
    if (!url) return { success: false, error: "URL obrigatória para vídeo" };
    const asset = await prisma.mediaAsset.create({
      data: { name: name || url, url, type: "VIDEO" },
    });
    revalidatePath("/admin/media");
    return { success: true, id: asset.id, url: asset.url };
  }

  // ── Imagem via URL ─────────────────────────────────────────────────────────
  const imageMode = (formData.get("imageMode") as string) || "url";
  if (imageMode === "url") {
    const imageUrl = formData.get("imageUrl") as string;
    if (!imageUrl) return { success: false, error: "URL da imagem obrigatória" };
    if (!/^https?:\/\//i.test(imageUrl))
      return { success: false, error: "URL inválida — deve começar com https://" };
    const asset = await prisma.mediaAsset.create({
      data: { name: name || imageUrl, url: imageUrl, type: "IMAGE" },
    });
    revalidatePath("/admin/media");
    return { success: true, id: asset.id, url: asset.url };
  }

  // ── Imagem via arquivo (URL já processada pelo browser → Cloudinary) ─────────
  const uploadedUrl = formData.get("uploadedUrl") as string | null;
  if (!uploadedUrl) return { success: false, error: "URL do arquivo obrigatória" };

  console.log("[media] salvando asset de upload direto Cloudinary:", uploadedUrl);

  const asset = await prisma.mediaAsset.create({
    data: { name: name || "upload", url: uploadedUrl, type: "IMAGE" },
  });

  revalidatePath("/admin/media");
  return { success: true, id: asset.id, url: asset.url };
}

/** Gera assinatura para upload direto browser → Cloudinary (sem passar pelo Next.js) */
export async function getCloudinarySignature() {
  await requireAdmin();

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error("[cloudinary] env vars ausentes:", {
      CLOUDINARY_CLOUD_NAME: !!cloudName,
      CLOUDINARY_API_KEY: !!apiKey,
      CLOUDINARY_API_SECRET: !!apiSecret,
    });
    return { success: false as const, error: "Cloudinary não configurado no servidor. Verifique as env vars CLOUDINARY_* no Vercel." };
  }

  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign = `folder=altheia&timestamp=${timestamp}`;
  const signature = createHash("sha1")
    .update(`${paramsToSign}${apiSecret}`)
    .digest("hex");

  console.log("[cloudinary] assinatura gerada para upload direto, timestamp:", timestamp);

  return { success: true as const, cloudName, apiKey, timestamp, signature };
}

export async function deleteMediaAsset(id: string) {
  await requireAdmin();

  const asset = await prisma.mediaAsset.findUnique({ where: { id } });
  if (!asset) return { success: false, error: "Asset não encontrado" };

  if (asset.type === "IMAGE" && asset.url.startsWith("/uploads/")) {
    await deleteImage(asset.url.slice(1)); // remove leading /
  }

  await prisma.mediaAsset.delete({ where: { id } });
  revalidatePath("/admin/media");
  return { success: true };
}

export async function getMediaAssets(type?: "IMAGE" | "VIDEO") {
  await requireAdmin();
  return prisma.mediaAsset.findMany({
    where: type ? { type } : undefined,
    orderBy: { createdAt: "desc" },
  });
}

// ─── Categories ───────────────────────────────────────────────────────────────

const categorySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(100)
    .regex(/^[a-z0-9-]+$/),
  imageUrl: imageUrl,
  parentId: z.string().uuid().optional().or(z.literal("")),
});

export async function getAdminCategories() {
  await requireAdmin();
  return prisma.category.findMany({
    include: {
      _count: { select: { products: true } },
      parent: { select: { name: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getAdminCategory(id: string) {
  await requireAdmin();
  return prisma.category.findUnique({ where: { id } });
}

export async function createCategory(formData: FormData) {
  await requireAdmin();

  const raw = Object.fromEntries(formData.entries());
  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { parentId, imageUrl: imgUrl, ...data } = parsed.data;

  try {
    await prisma.category.create({
      data: {
        ...data,
        imageUrl: imgUrl || null,
        parentId: parentId || null,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { success: false, error: "Já existe uma categoria com este slug." };
    }
    throw err;
  }

  revalidatePath("/admin/categories");
  revalidatePath("/products");
  return { success: true };
}

export async function updateCategory(id: string, formData: FormData) {
  await requireAdmin();

  const raw = Object.fromEntries(formData.entries());
  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { parentId, imageUrl: imgUrl, ...data } = parsed.data;

  await prisma.category.update({
    where: { id },
    data: {
      ...data,
      imageUrl: imgUrl || null,
      parentId: parentId || null,
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/products");
  return { success: true };
}

export async function deleteCategory(id: string) {
  await requireAdmin();

  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    return {
      success: false,
      error: `Esta categoria tem ${productCount} produto(s). Mova ou delete os produtos antes.`,
    };
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/products");
  return { success: true };
}
