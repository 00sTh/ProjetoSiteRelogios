"use client";

import { useTransition, useState } from "react";
import { updateSiteSettings } from "@/actions/admin";
import type { SiteSettings } from "@prisma/client";
import { MediaPickerInput } from "./media-picker-input";

export function SiteSettingsForm({ settings }: { settings: SiteSettings }) {
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateSiteSettings(formData);
      setMsg(
        result.success
          ? { ok: true, text: "Configurações salvas com sucesso!" }
          : { ok: false, text: result.error ?? "Erro ao salvar" }
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  const labelStyle = {
    color: "rgba(200,187,168,0.7)",
    fontSize: "0.72rem",
    fontWeight: 600 as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    display: "block" as const,
    marginBottom: "0.375rem",
  };

  const inputStyle = {
    backgroundColor: "#0F2E1E",
    border: "1px solid rgba(212,175,55,0.2)",
    borderRadius: "0.75rem",
    color: "#F5F5F5",
    padding: "0.625rem 1rem",
    width: "100%",
    fontSize: "0.875rem",
  };

  const hint = (text: string) => (
    <p className="mt-1.5 text-xs" style={{ color: "rgba(200,187,168,0.4)" }}>{text}</p>
  );

  const sectionTitle = (title: string) => (
    <div
      className="pb-3 mb-5 border-b"
      style={{ borderColor: "rgba(212,175,55,0.15)" }}
    >
      <h2 className="font-serif text-lg font-semibold" style={{ color: "#D4AF37" }}>
        {title}
      </h2>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      {msg && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            backgroundColor: msg.ok ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
            color: msg.ok ? "#4ADE80" : "#F87171",
            border: `1px solid ${msg.ok ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`,
          }}
        >
          {msg.text}
        </div>
      )}

      {/* Navbar / Logo */}
      <div>
        {sectionTitle("Logo do Site (Navbar)")}
        <div>
          <label style={labelStyle}>URL do logotipo PNG transparente</label>
          <MediaPickerInput
            name="siteLogoUrl"
            defaultValue={settings.siteLogoUrl}
            style={inputStyle}
            placeholder="https://... (PNG com fundo transparente)"
          />
          {hint("Se preenchido, substitui o texto 'LuxImport' na navbar e no hero. Recomendado: PNG 400×120px.")}
        </div>
      </div>

      {/* Hero Section */}
      <div>
        {sectionTitle("Hero (Página Inicial)")}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label style={labelStyle}>Título principal</label>
            <input name="heroTitle" defaultValue={settings.heroTitle} style={inputStyle} />
          </div>
          <div className="md:col-span-2">
            <label style={labelStyle}>Subtítulo</label>
            <textarea
              name="heroSubtitle"
              defaultValue={settings.heroSubtitle}
              rows={2}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>
          <div>
            <label style={labelStyle}>URL da imagem do hero</label>
            <MediaPickerInput
              name="heroImageUrl"
              defaultValue={settings.heroImageUrl}
              style={inputStyle}
              placeholder="https://..."
            />
          </div>
          <div>
            <label style={labelStyle}>URL do vídeo do hero (fallback)</label>
            <input
              name="heroVideoUrl"
              type="url"
              defaultValue={settings.heroVideoUrl ?? ""}
              style={inputStyle}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
          <div>
            <label style={labelStyle}>Vídeo esquerdo — Split Hero (YouTube ou MP4)</label>
            <input
              name="leftVideoUrl"
              type="url"
              defaultValue={settings.leftVideoUrl ?? ""}
              style={inputStyle}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
          <div>
            <label style={labelStyle}>Vídeo direito — Split Hero (YouTube ou MP4)</label>
            <input
              name="rightVideoUrl"
              type="url"
              defaultValue={settings.rightVideoUrl ?? ""}
              style={inputStyle}
              placeholder="https://youtube.com/watch?v=..."
            />
          </div>
          <div className="md:col-span-2">
            <label style={labelStyle}>URL do logo PNG transparente (centro do hero)</label>
            <MediaPickerInput
              name="heroLogoUrl"
              defaultValue={settings.heroLogoUrl}
              style={inputStyle}
              placeholder="https://... (PNG com fundo transparente)"
            />
            {hint("Se vazio, exibe o texto 'LuxImport' em Playfair Display. Recomendado: PNG 680×240px.")}
          </div>
        </div>
      </div>

      {/* Lumina Highlight */}
      <div>
        {sectionTitle("Destaque de Produto (Lumina)")}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label style={labelStyle}>Label (ex: Produto Estrela)</label>
            <input
              name="luminaLabel"
              defaultValue={settings.luminaLabel}
              style={inputStyle}
              placeholder="Produto Estrela"
            />
          </div>
          <div>
            <label style={labelStyle}>Texto do badge (ex: Novo)</label>
            <input
              name="luminaBadgeText"
              defaultValue={settings.luminaBadgeText}
              style={inputStyle}
              placeholder="Novo"
            />
          </div>
          <div className="md:col-span-2">
            <label style={labelStyle}>Título do produto</label>
            <input
              name="luminaTitle"
              defaultValue={settings.luminaTitle}
              style={inputStyle}
              placeholder="Descubra o Lumina Sérum"
            />
          </div>
          <div className="md:col-span-2">
            <label style={labelStyle}>Descrição</label>
            <textarea
              name="luminaSubtitle"
              defaultValue={settings.luminaSubtitle}
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>
          <div>
            <label style={labelStyle}>URL da imagem do produto</label>
            <MediaPickerInput
              name="luminaImageUrl"
              defaultValue={settings.luminaImageUrl}
              style={inputStyle}
              placeholder="https://..."
            />
            {hint("Se vazio, exibe um placeholder com gradiente dourado.")}
          </div>
          <div>
            <label style={labelStyle}>Link do botão (ex: /products/lumina-serum)</label>
            <input
              name="luminaProductLink"
              defaultValue={settings.luminaProductLink}
              style={inputStyle}
              placeholder="/products"
            />
          </div>
        </div>
      </div>

      {/* About Section */}
      <div>
        {sectionTitle("Sobre Nós")}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label style={labelStyle}>Título da seção</label>
            <input name="aboutTitle" defaultValue={settings.aboutTitle} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>URL da imagem</label>
            <MediaPickerInput
              name="aboutImageUrl"
              defaultValue={settings.aboutImageUrl}
              style={inputStyle}
              placeholder="https://..."
            />
          </div>
          <div className="md:col-span-2">
            <label style={labelStyle}>Texto da página Sobre Nós</label>
            <textarea
              name="aboutText"
              defaultValue={settings.aboutText}
              rows={6}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>
        </div>
      </div>

      {/* Videos Section */}
      <div>
        {sectionTitle("Vídeos")}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label style={labelStyle}>URL do vídeo em destaque</label>
            <input
              name="featuredVideoUrl"
              type="url"
              defaultValue={settings.featuredVideoUrl ?? ""}
              style={inputStyle}
              placeholder="https://youtube.com/..."
            />
          </div>
          <div>
            <label style={labelStyle}>Título do vídeo</label>
            <input
              name="featuredVideoTitle"
              defaultValue={settings.featuredVideoTitle}
              style={inputStyle}
            />
          </div>
          <div className="md:col-span-2">
            <label style={labelStyle}>Descrição do vídeo</label>
            <textarea
              name="featuredVideoDesc"
              defaultValue={settings.featuredVideoDesc}
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div>
        {sectionTitle("Redes Sociais")}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div>
            <label style={labelStyle}>Instagram</label>
            <input
              name="instagramUrl"
              type="url"
              defaultValue={settings.instagramUrl ?? ""}
              style={inputStyle}
              placeholder="https://instagram.com/altheia"
            />
          </div>
          <div>
            <label style={labelStyle}>YouTube</label>
            <input
              name="youtubeUrl"
              type="url"
              defaultValue={settings.youtubeUrl ?? ""}
              style={inputStyle}
              placeholder="https://youtube.com/@altheia"
            />
          </div>
          <div>
            <label style={labelStyle}>Twitter / X</label>
            <input
              name="twitterUrl"
              type="url"
              defaultValue={settings.twitterUrl ?? ""}
              style={inputStyle}
              placeholder="https://x.com/altheia"
            />
          </div>
        </div>
      </div>

      {/* WhatsApp */}
      <div>
        {sectionTitle("WhatsApp (Contato / Checkout)")}
        <div>
          <label style={labelStyle}>Número do WhatsApp (com DDI e DDD, sem +)</label>
          <input
            name="whatsappNumber"
            defaultValue={settings.whatsappNumber}
            style={inputStyle}
            placeholder="5511999999999"
          />
          {hint("Ex: 5511999999999 — usado no checkout sem pagamento para finalizar via WhatsApp.")}
        </div>
      </div>

      {/* WhyLuxImport */}
      <div>
        {sectionTitle("Por que LuxImport? (Barra de Benefícios)")}
        <div className="space-y-6">
          {([1, 2, 3] as const).map((n) => (
            <div key={n} className="rounded-xl p-4" style={{ border: "1px solid rgba(212,175,55,0.15)", backgroundColor: "rgba(15,74,55,0.3)" }}>
              <p className="text-xs font-semibold mb-3" style={{ color: "#D4AF37", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Benefício {n}
              </p>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <label style={labelStyle}>Ícone (nome Lucide)</label>
                  <input
                    name={`benefit${n}Icon`}
                    defaultValue={(settings as Record<string, unknown>)[`benefit${n}Icon`] as string ?? ""}
                    style={inputStyle}
                    placeholder="Truck"
                  />
                  {hint("Truck · RotateCcw · ShieldCheck · Star · Heart · Package · Leaf · Sparkles · Shield")}
                </div>
                <div>
                  <label style={labelStyle}>Título</label>
                  <input
                    name={`benefit${n}Title`}
                    defaultValue={(settings as Record<string, unknown>)[`benefit${n}Title`] as string ?? ""}
                    style={inputStyle}
                    placeholder="Frete grátis acima de R$199"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Texto</label>
                  <input
                    name={`benefit${n}Text`}
                    defaultValue={(settings as Record<string, unknown>)[`benefit${n}Text`] as string ?? ""}
                    style={inputStyle}
                    placeholder="Entrega em todo o Brasil sem custo adicional."
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div>
        {sectionTitle("Newsletter")}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label style={labelStyle}>Título da newsletter</label>
            <input
              name="newsletterTitle"
              defaultValue={settings.newsletterTitle}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Subtítulo</label>
            <input
              name="newsletterSubtitle"
              defaultValue={settings.newsletterSubtitle ?? ""}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* SEO */}
      <div>
        {sectionTitle("SEO")}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label style={labelStyle}>Meta title (máx 70 caracteres)</label>
            <input
              name="metaTitle"
              maxLength={70}
              defaultValue={settings.metaTitle ?? ""}
              style={inputStyle}
              placeholder="LuxImport — Importados de Luxo"
            />
          </div>
          <div>
            <label style={labelStyle}>Frete grátis a partir de (R$)</label>
            <input
              name="shippingFreeThreshold"
              type="number"
              min="0"
              step="1"
              defaultValue={Number(settings.shippingFreeThreshold)}
              style={inputStyle}
            />
          </div>
          <div className="md:col-span-2">
            <label style={labelStyle}>Meta description (máx 160 caracteres)</label>
            <textarea
              name="metaDescription"
              maxLength={160}
              defaultValue={settings.metaDescription ?? ""}
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
              placeholder="Cosméticos de luxo formulados com a pureza da ciência e da natureza."
            />
          </div>
        </div>
      </div>

      {/* Notificações */}
      <div>
        {sectionTitle("Notificações de Pedidos")}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label style={labelStyle}>Email para notificação de novos pedidos</label>
            <input
              name="notificationEmail"
              type="email"
              defaultValue={(settings as { notificationEmail?: string | null }).notificationEmail ?? ""}
              style={inputStyle}
              placeholder="dono@altheia.com"
            />
            {hint("Quando um novo pedido for criado, um email será enviado para este endereço.")}
          </div>
        </div>
      </div>

      {/* Frete Correios */}
      <div>
        {sectionTitle("Frete Correios")}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label style={labelStyle}>CEP de origem (loja)</label>
            <input
              name="cepOrigem"
              defaultValue={(settings as { cepOrigem?: string }).cepOrigem ?? "01310100"}
              style={inputStyle}
              placeholder="01310100"
              maxLength={9}
            />
            {hint("Apenas números ou formato 00000-000.")}
          </div>
          <div>
            <label style={labelStyle}>Peso médio por produto (gramas)</label>
            <input
              name="pesoMedioProduto"
              type="number"
              min="1"
              max="30000"
              defaultValue={(settings as { pesoMedioProduto?: number }).pesoMedioProduto ?? 300}
              style={inputStyle}
            />
            {hint("Peso estimado médio de cada produto para cálculo do frete.")}
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="px-8 py-3 rounded-xl text-sm font-semibold tracking-wider transition-all duration-200 disabled:opacity-50 hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
        style={{ backgroundColor: "#D4AF37", color: "#0A0A0A" }}
      >
        {isPending ? "Salvando..." : "Salvar configurações"}
      </button>
    </form>
  );
}
