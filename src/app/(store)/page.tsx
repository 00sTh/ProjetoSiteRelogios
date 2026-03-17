import type { Metadata } from "next";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturedGrid } from "@/components/home/featured-grid";
import { CategoryCards } from "@/components/home/category-cards";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import { getSiteSettings } from "@/actions/admin";
import { getProducts } from "@/actions/products";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.metaTitle || APP_NAME,
    description: settings.metaDescription || APP_DESCRIPTION,
  };
}

export default async function HomePage() {
  const [settings, { products }] = await Promise.all([
    getSiteSettings(),
    getProducts({ take: 8, skipCount: true }),
  ]);

  return (
    <>
      <HeroSection imageUrl={settings.heroImageUrl ?? null} />
      <CategoryCards />
      <FeaturedGrid products={products} />
    </>
  );
}
