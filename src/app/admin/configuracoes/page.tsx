import { getSiteConfig, setSiteConfigsFromForm } from "@/actions/admin";
import { cfg } from "@/lib/site-config";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const inputCls =
  "w-full border px-3 py-2 text-sm outline-none focus:border-[#B8963E] bg-white";
const inputStyle = { borderColor: "rgba(13,11,11,0.2)" };
const labelCls = "label-slc text-[10px]";

function Field({
  label,
  name,
  value,
  textarea,
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  textarea?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className={labelCls}>{label}</label>
      {textarea ? (
        <textarea
          name={name}
          defaultValue={value}
          rows={3}
          placeholder={placeholder}
          className={`${inputCls} resize-none`}
          style={inputStyle}
        />
      ) : (
        <input
          name={name}
          defaultValue={value}
          placeholder={placeholder}
          className={inputCls}
          style={inputStyle}
        />
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="font-serif text-lg font-light mb-4 pb-2 border-b"
      style={{ borderColor: "rgba(13,11,11,0.1)" }}
    >
      {children}
    </h2>
  );
}

export default async function ConfiguracoesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [config, sp] = await Promise.all([getSiteConfig(), searchParams]);
  const c = (key: string) => cfg(config, key);
  const saved = sp.saved === "1";

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-2xl font-light">Configurações do Site</h1>
        {saved && (
          <span
            className="text-xs tracking-widest uppercase px-3 py-1"
            style={{ backgroundColor: "#B8963E", color: "#F7F4EE" }}
          >
            Salvo ✓
          </span>
        )}
      </div>

      <form
        action={async (fd: FormData) => {
          "use server";
          await setSiteConfigsFromForm(fd);
          redirect("/admin/configuracoes?saved=1");
        }}
        className="flex flex-col gap-10 max-w-2xl"
      >
        {/* ── Hero ─────────────────────────────────────────── */}
        <div
          className="bg-white border p-6 flex flex-col gap-4"
          style={{ borderColor: "rgba(13,11,11,0.1)" }}
        >
          <SectionTitle>Hero</SectionTitle>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Título (linha 1)" name="hero_title" value={c("hero_title")} />
            <Field
              label="Título (linha 2 — itálico dourado)"
              name="hero_title_italic"
              value={c("hero_title_italic")}
            />
          </div>
          <Field
            label="Tagline (abaixo do título)"
            name="hero_tagline"
            value={c("hero_tagline")}
            placeholder="Relógios · Perfumes · Bolsas · Sapatos"
          />

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="CTA 1 — Texto"
              name="hero_cta1_text"
              value={c("hero_cta1_text")}
            />
            <Field
              label="CTA 1 — Link"
              name="hero_cta1_href"
              value={c("hero_cta1_href")}
              placeholder="/relogios"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="CTA 2 — Texto"
              name="hero_cta2_text"
              value={c("hero_cta2_text")}
            />
            <Field
              label="CTA 2 — Link"
              name="hero_cta2_href"
              value={c("hero_cta2_href")}
              placeholder="/perfumes"
            />
          </div>

          <Field
            label="Vídeo Esquerdo (URL)"
            name="hero_video_left"
            value={c("hero_video_left")}
            placeholder="https://..."
          />
          <Field
            label="Vídeo Direito (URL)"
            name="hero_video_right"
            value={c("hero_video_right")}
            placeholder="https://..."
          />

          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Label inferior esquerdo"
              name="hero_label_left"
              value={c("hero_label_left")}
            />
            <Field
              label="Link inferior esquerdo"
              name="hero_label_left_href"
              value={c("hero_label_left_href")}
              placeholder="/relogios"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field
              label="Label inferior direito"
              name="hero_label_right"
              value={c("hero_label_right")}
            />
            <Field
              label="Link inferior direito"
              name="hero_label_right_href"
              value={c("hero_label_right_href")}
              placeholder="/perfumes"
            />
          </div>
        </div>

        {/* ── Sobre ────────────────────────────────────────── */}
        <div
          className="bg-white border p-6 flex flex-col gap-4"
          style={{ borderColor: "rgba(13,11,11,0.1)" }}
        >
          <SectionTitle>Página Sobre</SectionTitle>
          <Field
            label="Título"
            name="sobre_heading"
            value={c("sobre_heading")}
          />
          <Field
            label="Parágrafo 1"
            name="sobre_p1"
            value={c("sobre_p1")}
            textarea
          />
          <Field
            label="Parágrafo 2"
            name="sobre_p2"
            value={c("sobre_p2")}
            textarea
          />
        </div>

        {/* ── Geral ────────────────────────────────────────── */}
        <div
          className="bg-white border p-6 flex flex-col gap-4"
          style={{ borderColor: "rgba(13,11,11,0.1)" }}
        >
          <SectionTitle>Geral</SectionTitle>
          <Field
            label="WhatsApp (só números, ex: 5511999999999)"
            name="whatsapp"
            value={c("whatsapp")}
            placeholder="5511999999999"
          />
          <Field
            label="E-mail de contato"
            name="contact_email"
            value={c("contact_email")}
            placeholder="contato@sluxurycollection.com.br"
          />
        </div>

        <div>
          <button
            type="submit"
            className="px-8 py-3 text-[10px] tracking-[0.4em] uppercase text-white"
            style={{ backgroundColor: "#0D0B0B" }}
          >
            Salvar Configurações
          </button>
        </div>
      </form>
    </div>
  );
}
