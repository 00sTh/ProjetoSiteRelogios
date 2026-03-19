import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ShieldCheck, Truck, RefreshCw } from "lucide-react";
import { ProductActions } from "@/components/products/product-actions";
import { ProductGallery } from "@/components/products/product-gallery";
import { WishlistButton } from "@/components/products/wishlist-button";
import { ProductCard } from "@/components/products/product-card";
import { ProductAccordion } from "@/components/products/product-accordion";
import { getProductBySlug, getProducts } from "@/actions/products";
import { isInWishlist } from "@/actions/wishlist";
import { getSiteSettings } from "@/actions/admin";
import { getServerAuth } from "@/lib/auth";
import { formatPrice, truncate } from "@/lib/utils";
import { parseImages } from "@/lib/utils";
import { detectProductColors } from "@/lib/color-detect";
import type { ProductWithCategory } from "@/types";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  try {
    const { products } = await getProducts({ featured: true });
    return products.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  return {
    title: product.name,
    description: truncate(product.description, 160),
    openGraph: {
      images: (() => {
        const imgs = parseImages(product.images as unknown as string);
        return imgs[0] ? [imgs[0]] : [];
      })(),
    },
  };
}

const COLOR_CATEGORIES = new Set(["relogios", "oculos", "bolsas"]);

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const { userId } = await getServerAuth();

  const [product, settings] = await Promise.all([
    getProductBySlug(slug),
    getSiteSettings(),
  ]);

  if (!product) notFound();

  const inStock = product.stock > 0;
  const images = parseImages(product.images as unknown as string);

  // Run color detection + wishlist + related in parallel
  const isColorCategory = COLOR_CATEGORIES.has(product.category.slug);

  const brandSlug = (name: string) =>
    name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const [inWishlist, { products: related }, { products: sameModel }, detectedColors] = await Promise.all([
    userId ? isInWishlist(product.id) : Promise.resolve(false),
    getProducts({ categorySlug: product.category.slug, take: 5, skipCount: true }),
    product.brand ? getProducts({ brand: product.brand, take: 5, skipCount: true }) : Promise.resolve({ products: [], total: 0, pages: 0 }),
    isColorCategory
      ? detectProductColors(
          product.id,
          images,
          product.colors !== null,
          product.colorsArray
        ).catch(() => [] as string[])
      : Promise.resolve([] as string[]),
  ]);

  const relatedProducts = related.filter((p) => p.id !== product.id).slice(0, 4);
  const sameModelProducts = sameModel.filter((p) => p.id !== product.id).slice(0, 4);

  void settings; // used for shippingFreeThreshold if needed later

  return (
    <div
      style={{ backgroundColor: "#FAFAFA", minHeight: "100vh" }}
      className="py-10 px-4"
    >
      <div className="container mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 text-xs flex-wrap" style={{ color: "#6A6A6A" }}>
          <Link href="/" className="hover:text-[#0A0A0A] transition-colors">Início</Link>
          <span style={{ color: "rgba(0,0,0,0.2)" }}>/</span>
          <Link href="/products" className="hover:text-[#0A0A0A] transition-colors">Produtos</Link>
          <span style={{ color: "rgba(0,0,0,0.2)" }}>/</span>
          <Link href={`/products?category=${product.category.slug}`} className="hover:text-[#0A0A0A] transition-colors">
            {product.category.name}
          </Link>
          {product.brand && (
            <>
              <span style={{ color: "rgba(0,0,0,0.2)" }}>/</span>
              <Link
                href={`/products/brand/${brandSlug(product.brand)}`}
                className="hover:text-[#0A0A0A] transition-colors"
              >
                {product.brand}
              </Link>
            </>
          )}
          {product.model_name && (
            <>
              <span style={{ color: "rgba(0,0,0,0.2)" }}>/</span>
              <span style={{ color: "#6A6A6A" }}>{product.model_name}</span>
            </>
          )}
          {!product.model_name && (
            <>
              <span style={{ color: "rgba(0,0,0,0.2)" }}>/</span>
              <span style={{ color: "#0A0A0A" }}>{product.name}</span>
            </>
          )}
        </nav>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Image Gallery — client component for interactivity */}
          <ProductGallery images={images} productName={product.name} />

          {/* Product Info */}
          <div className="flex flex-col gap-6">
            {/* Category + detected brand */}
            <div className="flex items-center gap-3 flex-wrap">
              <p className="label-luxury" style={{ color: "#6A6A6A" }}>
                {product.category.name}
              </p>
              {product.brand && (
                <span
                  className="text-xs font-semibold tracking-widest uppercase px-3 py-1"
                  style={{
                    backgroundColor: "#0A0A0A",
                    color: "#F5F0E6",
                    letterSpacing: "0.18em",
                    fontFamily: "var(--font-geist-mono), monospace",
                  }}
                >
                  {product.brand}
                </span>
              )}
            </div>

            {/* model_name as subtitle */}
            {product.model_name && (
              <p
                className="font-serif text-xl md:text-2xl"
                style={{ color: "#6A6A6A", fontStyle: "italic", marginTop: "-8px" }}
              >
                {product.model_name}
              </p>
            )}

            {/* Name & Price */}
            <div>
              <h1
                className="font-serif text-3xl md:text-4xl font-bold leading-tight mb-4"
                style={{ color: "#0A0A0A" }}
              >
                {product.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className="font-serif text-4xl font-bold"
                  style={{ color: "#0A0A0A" }}
                >
                  {formatPrice(Number(product.price))}
                </span>
                {product.featured && (
                  <span
                    className="text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: "#C9C9C9", color: "#0A0A0A" }}
                  >
                    Destaque
                  </span>
                )}
                {!inStock && (
                  <span
                    className="text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full"
                    style={{
                      backgroundColor: "rgba(224,82,82,0.2)",
                      color: "#e05252",
                      border: "1px solid rgba(224,82,82,0.3)",
                    }}
                  >
                    Esgotado
                  </span>
                )}
              </div>
            </div>

            {/* Divider */}
            <div
              className="h-px"
              style={{
                background: "linear-gradient(to right, rgba(201,201,201,0.3), transparent)",
              }}
            />

            {/* Description */}
            <p className="leading-relaxed text-base" style={{ color: "#6A6A6A" }}>
              {product.description}
            </p>

            {/* Stock */}
            {inStock && (
              <p className="text-sm" style={{ color: "#6A6A6A" }}>
                {product.stock} {product.stock !== 1 ? "unidades" : "unidade"} em estoque
              </p>
            )}

            {/* Add to cart + Wishlist */}
            <div className="flex flex-col gap-3">
              <ProductActions
                productId={product.id}
                categorySlug={product.category.slug}
                inStock={inStock}
                detectedColors={(detectedColors ?? []).length > 0 ? detectedColors : undefined}
              />
              <WishlistButton
                productId={product.id}
                initialInWishlist={inWishlist}
              />
            </div>

            {/* Benefits */}
            <div
              className="rounded-2xl p-5 space-y-3"
              style={{
                backgroundColor: "rgba(0,0,0,0.04)",
                border: "1px solid rgba(0,0,0,0.08)",
              }}
            >
              {[
                { icon: Truck, text: "Envio Internacional" },
                { icon: RefreshCw, text: "30 Dias para Devolução" },
                { icon: ShieldCheck, text: "Checkout Seguro" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" style={{ color: "#6A6A6A" }} />
                  <span className="text-sm" style={{ color: "#6A6A6A" }}>
                    {text}
                  </span>
                </div>
              ))}
            </div>

            {/* Ingredients & Usage accordion */}
            <ProductAccordion
              ingredients={product.ingredients}
              usage={product.usage}
            />
          </div>
        </div>

        {/* Outros modelos desta marca */}
        {sameModelProducts.length > 0 && product.brand && (
          <section className="mt-20">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="label-luxury mb-2" style={{ color: "#6A6A6A" }}>
                  {product.brand}
                </p>
                <h2 className="font-serif text-2xl font-bold" style={{ color: "#0A0A0A" }}>
                  Outros modelos desta marca
                </h2>
              </div>
              <Link
                href={`/products/brand/${brandSlug(product.brand)}`}
                className="text-xs transition-colors hover:text-[#0A0A0A]"
                style={{ color: "#ABABAB", borderBottom: "1px solid rgba(0,0,0,0.15)", paddingBottom: "1px" }}
              >
                Ver todos →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-px sm:grid-cols-4 border-t border-l border-[rgba(0,0,0,0.06)]">
              {sameModelProducts.map((p) => (
                <ProductCard key={p.id} product={p as unknown as ProductWithCategory} />
              ))}
            </div>
          </section>
        )}

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <div className="mb-8">
              <p className="label-luxury mb-2" style={{ color: "#6A6A6A" }}>
                Da mesma coleção
              </p>
              <h2
                className="font-serif text-2xl font-bold"
                style={{ color: "#0A0A0A" }}
              >
                Você também pode gostar
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p as unknown as ProductWithCategory}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
