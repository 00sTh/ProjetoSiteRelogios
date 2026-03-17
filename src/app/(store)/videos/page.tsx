import type { Metadata } from "next";
import { getSiteSettings } from "@/actions/admin";
import { VideosContent } from "@/components/videos/videos-content";

export const metadata: Metadata = {
  title: "Vídeos & Histórias — S Luxury Collection",
  description: "Mergulhe no universo S Luxury Collection — da pesquisa científica aos rituais de beleza que transformam.",
};

export const revalidate = 3600;

export default async function VideosPage() {
  const settings = await getSiteSettings();
  return (
    <VideosContent
      featuredVideoUrl={settings.featuredVideoUrl ?? undefined}
      featuredVideoTitle={settings.featuredVideoTitle}
      featuredVideoDesc={settings.featuredVideoDesc}
    />
  );
}
