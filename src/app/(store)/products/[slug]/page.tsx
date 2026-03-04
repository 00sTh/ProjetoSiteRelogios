import Link from "next/link";
import { ProductImage } from "@/components/ui/product-image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ShieldCheck, Truck, RefreshCw } from "lucide-react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { WishlistButton } from "@/components/products/wishlist-button";
import { ProductCard } from "@/components/products/product-card";
import { ProductAccordion } from "@/components/products/product-accordion";
import { getProductBySlug, getProducts } from "@/actions/products";
import { isInWishlist } from "@/actions/wishlist";
import { getSiteSettings } from "@/actions/admin";
import { getServerAuth } from "@/lib/auth";
import { formatPrice, truncate } from "@/lib/utils";
import { parseImages } from "@/lib/utils";
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
  const mainImage = images[0] ?? "/placeholder.svg";

  // Fetch wishlist state and related products in parallel
  const [inWishlist, { products: related }] = await Promise.all([
    userId ? isInWishlist(product.id) : Promise.resolve(false),
    getProducts({ categorySlug: product.category.slug, take: 5, skipCount: true }),
  ]);
  const relatedProducts = related.filter((p) => p.id !== product.id).slice(0, 4);

  const shippingThreshold = formatPrice(Number(settings.shippingFreeThreshold));

  return (
    <div
      style={{ backgroundColor: "#0A0A0A", minHeight: "100vh" }}
      className="py-10 px-4"
    >
      <div className="container mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 text-xs" style={{ color: "#9A9A9A" }}>
          <Link href="/" className="hover:text-[#D4AF37] transition-colors">
            Início
          </Link>
          <span style={{ color: "rgba(200,187,168,0.4)" }}>/</span>
          <Link href="/products" className="hover:text-[#D4AF37] transition-colors">
            Produtos
          </Link>
          <span style={{ color: "rgba(200,187,168,0.4)" }}>/</span>
          <Link
            href={`/products?category=${product.category.slug}`}
            className="hover:text-[#D4AF37] transition-colors"
          >
            {product.category.name}
          </Link>
          <span style={{ color: "rgba(200,187,168,0.4)" }}>/</span>
          <span style={{ color: "#D4AF37" }}>{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div
              className="relative aspect-square overflow-hidden rounded-3xl"
              style={{
                backgroundColor: "#111111",
                border: "1px solid rgba(212,175,55,0.2)",
              }}
            >
              <ProductImage
                src={mainImage}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              {/* Gold corner accent */}
              <div
                className="absolute top-4 right-4 w-8 h-8 rounded-full"
                style={{
                  background: "radial-gradient(circle, rgba(212,175,55,0.3) 0%, transparent 70%)",
                }}
              />
            </div>

            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl cursor-pointer transition-all duration-200 hover:shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                    style={{
                      backgroundColor: "#111111",
                      border:
                        idx === 0
                          ? "2px solid #D4AF37"
                          : "1px solid rgba(212,175,55,0.2)",
                    }}
                  >
                    <ProductImage
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col gap-6">
            {/* Category */}
            <p className="label-luxury" style={{ color: "#D4AF37" }}>
              {product.category.name}
            </p>

            {/* Name & Price */}
            <div>
              <h1
                className="font-serif text-3xl md:text-4xl font-bold leading-tight mb-4"
                style={{ color: "#F5F5F5" }}
              >
                {product.name}
              </h1>
              <div className="flex items-center gap-3 flex-wrap">
                <span
                  className="font-serif text-4xl font-bold"
                  style={{ color: "#D4AF37" }}
                >
                  {formatPrice(Number(product.price))}
                </span>
                {product.featured && (
                  <span
                    className="text-xs font-semibold tracking-widest uppercase px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: "#D4AF37", color: "#0A0A0A" }}
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
                background: "linear-gradient(to right, rgba(212,175,55,0.3), transparent)",
              }}
            />

            {/* Description */}
            <p className="leading-relaxed text-base" style={{ color: "#9A9A9A" }}>
              {product.description}
            </p>

            {/* Stock */}
            {inStock && (
              <p className="text-sm" style={{ color: "rgba(200,187,168,0.6)" }}>
                {product.stock} unidade{product.stock !== 1 ? "s" : ""} disponíve
                {product.stock !== 1 ? "is" : "l"}
              </p>
            )}

            {/* Add to cart + Wishlist */}
            <div className="flex items-center gap-3">
              <AddToCartButton
                productId={product.id}
                disabled={!inStock}
                className="flex-1"
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
                backgroundColor: "rgba(15,74,55,0.5)",
                border: "1px solid rgba(212,175,55,0.15)",
              }}
            >
              {[
                { icon: Truck, text: `Frete grátis acima de ${shippingThreshold}` },
                { icon: RefreshCw, text: "Troca e devolução em até 30 dias" },
                { icon: ShieldCheck, text: "Pagamento 100% seguro" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" style={{ color: "#D4AF37" }} />
                  <span className="text-sm" style={{ color: "#9A9A9A" }}>
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

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <div className="mb-8">
              <p className="label-luxury mb-2" style={{ color: "#D4AF37" }}>
                Da mesma coleção
              </p>
              <h2
                className="font-serif text-2xl font-bold"
                style={{ color: "#F5F5F5" }}
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
