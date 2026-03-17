import type { Metadata } from "next";
import { getSiteSettings } from "@/actions/admin";
import { SobreNosContent } from "@/components/about/sobre-nos-content";

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `${settings.aboutTitle} — Imports`,
    description: settings.aboutText.slice(0, 160),
  };
}

export default async function SobreNosPage() {
  const settings = await getSiteSettings();
  return (
    <SobreNosContent
      aboutTitle={settings.aboutTitle}
      aboutText={settings.aboutText}
      aboutImageUrl={settings.aboutImageUrl ?? undefined}
    />
  );
}
