import { Suspense } from "react";
import type { Metadata } from "next";
import { HeroSection } from "@/components/home/hero-section";
import { BestSellers } from "@/components/home/best-sellers";
import { CategoryCards } from "@/components/home/category-cards";
import { LuminaHighlight } from "@/components/home/lumina-highlight";
import { NossaHistoriaTeaser } from "@/components/home/nossa-historia-teaser";
import { WhyLuxImport } from "@/components/home/why-altheia";
import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import { getSiteSettings } from "@/actions/admin";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.metaTitle || APP_NAME,
    description: settings.metaDescription || APP_DESCRIPTION,
  };
}

export default async function HomePage() {
  const settings = await getSiteSettings();

  return (
    <>
      <HeroSection
        title={settings.heroTitle}
        subtitle={settings.heroSubtitle}
        heroImageUrl={settings.heroImageUrl}
        heroVideoUrl={settings.heroVideoUrl}
        leftVideoUrl={settings.leftVideoUrl}
        rightVideoUrl={settings.rightVideoUrl}
        heroLogoUrl={settings.heroLogoUrl}
      />

      <Suspense fallback={<div className="h-48 animate-pulse" style={{ backgroundColor: "#0A0A0A" }} />}>
        <CategoryCards />
      </Suspense>

      <Suspense fallback={<div className="h-96 animate-pulse" style={{ backgroundColor: "#0A0A0A" }} />}>
        <BestSellers />
      </Suspense>

      <LuminaHighlight
        label={settings.luminaLabel}
        title={settings.luminaTitle}
        subtitle={settings.luminaSubtitle}
        imageUrl={settings.luminaImageUrl}
        badgeText={settings.luminaBadgeText}
        productLink={settings.luminaProductLink}
      />

      <NossaHistoriaTeaser
        videoUrl={settings.featuredVideoUrl ?? undefined}
        videoTitle={settings.featuredVideoTitle}
        videoDesc={settings.featuredVideoDesc}
      />

      <WhyLuxImport
        benefit1Icon={settings.benefit1Icon}
        benefit1Title={settings.benefit1Title}
        benefit1Text={settings.benefit1Text}
        benefit2Icon={settings.benefit2Icon}
        benefit2Title={settings.benefit2Title}
        benefit2Text={settings.benefit2Text}
        benefit3Icon={settings.benefit3Icon}
        benefit3Title={settings.benefit3Title}
        benefit3Text={settings.benefit3Text}
      />
    </>
  );
}
