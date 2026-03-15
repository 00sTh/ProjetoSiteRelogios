import type { Metadata } from "next";
import { getSiteSettings } from "@/actions/admin";
import { SiteSettingsForm } from "@/components/admin/site-settings-form";

export const metadata: Metadata = { title: "Admin — Configurações do Site" };

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold" style={{ color: "#F5F5F5" }}>
          Configurações do Site
        </h1>
        <p className="text-sm mt-1" style={{ color: "rgba(200,187,168,0.6)" }}>
          Edite os textos e imagens das páginas principais
        </p>
      </div>

      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: "#141414", border: "1px solid rgba(201,201,201,0.15)" }}
      >
        <SiteSettingsForm settings={settings} />
      </div>
    </div>
  );
}
