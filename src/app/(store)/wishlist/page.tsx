import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Heart, ArrowRight } from "lucide-react";
import { getWishlist } from "@/actions/wishlist";
import { getServerAuth } from "@/lib/auth";
import { ProductCard } from "@/components/products/product-card";
import type { ProductWithCategory } from "@/types";

export const metadata: Metadata = { title: "Lista de Desejos — LuxImport" };

export default async function WishlistPage() {
  const { userId } = await getServerAuth();
  if (!userId) redirect("/sign-in?returnBackUrl=/wishlist");

  const wishlist = await getWishlist();
  const items = wishlist?.items ?? [];

  return (
    <div style={{ backgroundColor: "#0A0A0A", minHeight: "100vh" }}>
      {/* Header */}
      <div
        className="py-16 px-4 text-center"
        style={{
          backgroundColor: "#111111",
          borderBottom: "1px solid rgba(212,175,55,0.2)",
        }}
      >
        <div className="container mx-auto max-w-7xl">
          <div
            className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-6"
            style={{ backgroundColor: "rgba(212,175,55,0.1)", border: "1px solid rgba(212,175,55,0.3)" }}
          >
            <Heart className="h-7 w-7" style={{ color: "#D4AF37" }} fill="#D4AF37" />
          </div>
          <h1 className="font-serif text-4xl font-bold mb-2" style={{ color: "#F5F5F5" }}>
            Lista de Desejos
          </h1>
          <p className="text-sm" style={{ color: "rgba(200,187,168,0.6)" }}>
            {items.length} produto{items.length !== 1 ? "s" : ""} salvos
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-16">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-6 text-center py-20">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)" }}
            >
              <Heart className="h-8 w-8" style={{ color: "rgba(212,175,55,0.4)" }} />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-semibold mb-2" style={{ color: "#F5F5F5" }}>
                Sua lista está vazia
              </h2>
              <p className="text-sm" style={{ color: "rgba(200,187,168,0.6)" }}>
                Explore nosso catálogo e salve os produtos que você ama.
              </p>
            </div>
            <Link
              href="/products"
              className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold"
              style={{ backgroundColor: "#D4AF37", color: "#0A0A0A" }}
            >
              Explorar produtos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item) => (
              <ProductCard
                key={item.id}
                product={item.product as unknown as ProductWithCategory}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
