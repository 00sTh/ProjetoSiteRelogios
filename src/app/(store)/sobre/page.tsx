import { getSiteConfig } from "@/actions/admin";
import { cfg } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export default async function SobrePage() {
  const config = await getSiteConfig();

  return (
    <div className="pt-24 min-h-screen">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <p className="label-slc mb-4">Sobre a SLC</p>
        <h1 className="font-serif text-4xl font-light mb-8">
          {cfg(config, "sobre_heading")}
        </h1>
        <p className="text-sm leading-relaxed mb-6" style={{ color: "rgba(13,11,11,0.65)" }}>
          {cfg(config, "sobre_p1")}
        </p>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(13,11,11,0.65)" }}>
          {cfg(config, "sobre_p2")}
        </p>
      </div>
    </div>
  );
}
