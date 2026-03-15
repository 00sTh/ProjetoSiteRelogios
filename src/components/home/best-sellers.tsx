import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getProducts } from "@/actions/products";
import { ProductCard } from "@/components/products/product-card";
import { SectionTitle } from "@/components/ui/section-title";
import { GoldButton } from "@/components/ui/gold-button";

export async function BestSellers() {
  const { products } = await getProducts({ featured: true, take: 6, skipCount: true });
  const display = products;

  if (display.length === 0) return null;

  return (
    <section
      className="py-24 px-4"
      style={{
        backgroundColor: "#0A0A0A",
        borderTop: "1px solid rgba(201,201,201,0.15)",
      }}
    >
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12">
          <SectionTitle
            label="New Arrivals"
            title="New Arrivals"
            subtitle="Discover our newest timepieces and eyewear, handpicked for excellence."
            align="left"
          />
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory gap-6 md:grid md:grid-cols-3">
          {display.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <GoldButton variant="outline" size="md" asChild>
            <Link href="/products">
              View All <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </GoldButton>
        </div>
      </div>
    </section>
  );
}
