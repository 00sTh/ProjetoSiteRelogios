import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProducts } from "@/actions/products";
import { ProductCard } from "@/components/products/product-card";
import { SectionTitle } from "@/components/ui/section-title";
import { GoldButton } from "@/components/ui/gold-button";

export async function BestSellers() {
  const { products } = await getProducts({ featured: true, take: 4, skipCount: true });
  const display = products;

  if (display.length === 0) return null;

  return (
    <section
      className="py-24 px-4"
      style={{
        backgroundColor: "#0A0A0A",
        borderTop: "1px solid rgba(212,175,55,0.15)",
      }}
    >
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12">
          <SectionTitle
            label="Mais Vendidos"
            title="Nossos Best Sellers"
            subtitle="Os produtos importados mais escolhidos pelos nossos clientes."
            align="left"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {display.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <GoldButton variant="outline" size="md" asChild>
            <Link href="/products">
              Ver todos <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </GoldButton>
        </div>
      </div>
    </section>
  );
}
