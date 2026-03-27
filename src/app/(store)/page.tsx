import { HeroSection } from "@/components/home/hero-section";
import { BrandCollection } from "@/components/home/brand-collection";
import { EditorialGrid } from "@/components/home/editorial-grid";
import { BrandHighlights } from "@/components/home/brand-highlights";
import { getCategories, getFeaturedProducts } from "@/actions/products";
import { getSiteConfig } from "@/actions/admin";
import { cfg } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [categories, featured, config] = await Promise.all([
    getCategories(),
    getFeaturedProducts(5),
    getSiteConfig(),
  ]);

  const heroConfig = {
    title: cfg(config, "hero_title"),
    titleItalic: cfg(config, "hero_title_italic"),
    tagline: cfg(config, "hero_tagline"),
    cta1Text: cfg(config, "hero_cta1_text"),
    cta1Href: cfg(config, "hero_cta1_href"),
    cta2Text: cfg(config, "hero_cta2_text"),
    cta2Href: cfg(config, "hero_cta2_href"),
    videoLeft: cfg(config, "hero_video_left"),
    videoRight: cfg(config, "hero_video_right"),
    labelLeft: cfg(config, "hero_label_left"),
    labelLeftHref: cfg(config, "hero_label_left_href"),
    labelRight: cfg(config, "hero_label_right"),
    labelRightHref: cfg(config, "hero_label_right_href"),
  };

  return (
    <>
      <HeroSection config={heroConfig} />
      <BrandCollection categories={categories} />
      <EditorialGrid products={featured} />
      <BrandHighlights categories={categories} />
    </>
  );
}
