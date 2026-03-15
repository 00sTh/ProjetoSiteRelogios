import type { Metadata } from "next";
import { getMediaAssets } from "@/actions/admin";
import { MediaUploadForm } from "@/components/admin/media-upload-form";
import { MediaGrid } from "@/components/admin/media-grid";

export const metadata: Metadata = { title: "Admin — Banco de Mídia" };

export const dynamic = "force-dynamic";

export default async function AdminMediaPage() {
  const assets = await getMediaAssets();

  const images = assets.filter((a) => a.type === "IMAGE");
  const videos = assets.filter((a) => a.type === "VIDEO");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold" style={{ color: "#F5F5F5" }}>
          Banco de Mídia
        </h1>
        <p className="text-sm mt-1" style={{ color: "rgba(200,187,168,0.6)" }}>
          {assets.length} ativo{assets.length !== 1 ? "s" : ""} — imagens e vídeos do site
        </p>
      </div>

      {/* Upload form */}
      <MediaUploadForm />

      {/* Images */}
      {images.length > 0 && (
        <div>
          <h2
            className="font-serif text-lg font-semibold mb-4 pb-3 border-b"
            style={{ color: "#C9C9C9", borderColor: "rgba(201,201,201,0.15)" }}
          >
            Imagens ({images.length})
          </h2>
          <MediaGrid assets={images} />
        </div>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <div>
          <h2
            className="font-serif text-lg font-semibold mb-4 pb-3 border-b"
            style={{ color: "#C9C9C9", borderColor: "rgba(201,201,201,0.15)" }}
          >
            Vídeos ({videos.length})
          </h2>
          <MediaGrid assets={videos} />
        </div>
      )}

      {/* Instructions */}
      <div
        className="rounded-2xl p-5 text-sm space-y-1.5"
        style={{ backgroundColor: "#141414", border: "1px solid rgba(201,201,201,0.1)" }}
      >
        <p className="font-semibold" style={{ color: "#C9C9C9" }}>Como usar</p>
        <p style={{ color: "rgba(200,187,168,0.6)" }}>
          1. Faça upload de imagens ou adicione URLs de vídeos do YouTube.
        </p>
        <p style={{ color: "rgba(200,187,168,0.6)" }}>
          2. Passe o mouse sobre a mídia e clique em <strong style={{ color: "#9A9A9A" }}>Copiar URL</strong>.
        </p>
        <p style={{ color: "rgba(200,187,168,0.6)" }}>
          3. Cole a URL nos campos de configuração do site em{" "}
          <a href="/admin/settings" className="underline" style={{ color: "#C9C9C9" }}>Configurações</a> ou nos campos de produto.
        </p>
      </div>
    </div>
  );
}
