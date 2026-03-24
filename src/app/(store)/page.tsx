import { HeroSection } from "@/components/home/hero-section";
import { CategoryShowcase } from "@/components/home/category-showcase";
import { EditorialGrid } from "@/components/home/editorial-grid";
import { BrandHighlights } from "@/components/home/brand-highlights";
import { getCategories, getFeaturedProducts } from "@/actions/products";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    getCategories(),
    getFeaturedProducts(5),
  ]);

  return (
    <>
      <HeroSection />
      <CategoryShowcase categories={categories} />
      <EditorialGrid products={featured} />
      <BrandHighlights categories={categories} />
    </>
  );
}
