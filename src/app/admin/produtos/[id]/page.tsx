import { prisma } from "@/lib/prisma";
import { updateProduct, deleteProduct } from "@/actions/admin";
import { ColorDetector } from "@/components/admin/color-detector";
import { ProductImageManager } from "@/components/admin/product-image-manager";
import { notFound, redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
export const dynamic = "force-dynamic";

export default async function EditProduto({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const errorMsg = sp.error ? decodeURIComponent(sp.error) : null;
  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { brand: true, category: true } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, include: { category: true } }),
  ]);
  if (!product) notFound();

  const attrs = product.attributes ? JSON.stringify(product.attributes, null, 2) : "";

  return (
    <div>
      <h1 className="font-serif text-2xl font-light mb-1">Editar Produto</h1>
      <p className="label-slc opacity-50 mb-8">{product.slug}</p>

      {errorMsg && (
        <div className="mb-4 p-4 border-l-4 text-sm max-w-2xl" style={{ borderColor: "#6B1A2A", backgroundColor: "rgba(107,26,42,0.06)", color: "#6B1A2A" }}>
          <strong>Erro ao salvar produto:</strong> {errorMsg}
        </div>
      )}

      {/* Formulário de edição */}
      <form action={async (fd: FormData) => {
        "use server";
        try {
          await updateProduct(id, fd);
        } catch (e) {
          if (isRedirectError(e)) throw e;
          const msg = e instanceof Error ? e.message : String(e);
          redirect(`/admin/produtos/${id}?error=${encodeURIComponent(msg)}`);
          return;
        }
        redirect("/admin/produtos");
      }} encType="multipart/form-data" className="bg-white border p-6 max-w-2xl" style={{ borderColor: "rgba(13,11,11,0.1)" }}>

        {/* ProductImageManager manages existingImages hidden input */}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="label-slc">Nome *</label>
            <input name="name" defaultValue={product.name} required className="border px-3 py-2 text-sm outline-none focus:border-[#B8963E]" style={{ borderColor: "rgba(13,11,11,0.2)" }} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="label-slc">Categoria</label>
            <select name="categoryId" defaultValue={product.categoryId} className="border px-3 py-2 text-sm outline-none bg-white" style={{ borderColor: "rgba(13,11,11,0.2)" }}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="label-slc">Marca</label>
            <select name="brandId" defaultValue={product.brandId} className="border px-3 py-2 text-sm outline-none bg-white" style={{ borderColor: "rgba(13,11,11,0.2)" }}>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name} — {b.category.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="label-slc">Preço (R$) *</label>
            <input name="price" type="number" step="0.01" defaultValue={Number(product.price)} required className="border px-3 py-2 text-sm outline-none focus:border-[#B8963E] font-mono" style={{ borderColor: "rgba(13,11,11,0.2)" }} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="label-slc">Preço original (R$)</label>
            <input name="comparePrice" type="number" step="0.01" defaultValue={product.comparePrice ? Number(product.comparePrice) : ""} className="border px-3 py-2 text-sm outline-none focus:border-[#B8963E] font-mono" style={{ borderColor: "rgba(13,11,11,0.2)" }} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="label-slc">Estoque</label>
            <input name="stock" type="number" defaultValue={product.stock} className="border px-3 py-2 text-sm outline-none focus:border-[#B8963E] font-mono" style={{ borderColor: "rgba(13,11,11,0.2)" }} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="label-slc">SKU</label>
            <input name="sku" defaultValue={product.sku ?? ""} className="border px-3 py-2 text-sm outline-none focus:border-[#B8963E] font-mono" style={{ borderColor: "rgba(13,11,11,0.2)" }} />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="label-slc">Descrição</label>
            <textarea name="description" defaultValue={product.description ?? ""} rows={4} className="border px-3 py-2 text-sm outline-none focus:border-[#B8963E] resize-none" style={{ borderColor: "rgba(13,11,11,0.2)" }} />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="label-slc">Atributos (JSON)</label>
            <textarea name="attributes" defaultValue={attrs} rows={4} className="border px-3 py-2 text-sm outline-none focus:border-[#B8963E] resize-none font-mono text-xs" style={{ borderColor: "rgba(13,11,11,0.2)" }} />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="label-slc">Cores disponíveis</label>
            <ColorDetector imageUrl={product.images[0]} defaultColors={product.colors.join(", ")} />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="label-slc">Vídeo (URL embed YouTube)</label>
            <input name="video" defaultValue={product.video ?? ""} placeholder="https://www.youtube.com/embed/ID?autoplay=1&mute=1&loop=1&playlist=ID&controls=0" className="border px-3 py-2 text-sm outline-none focus:border-[#B8963E]" style={{ borderColor: "rgba(13,11,11,0.2)" }} />
            <p className="text-[10px] opacity-40">Deixe em branco para remover o vídeo. Shorts (9:16) ou normal (16:9).</p>
          </div>

          <ProductImageManager initialImages={product.images} />

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="label-slc">Adicionar imagens</label>
            <input name="images" type="file" accept="image/*" multiple className="text-sm" />
          </div>

          <div className="flex items-center gap-2">
            <input name="featured" type="checkbox" value="true" id="featured" defaultChecked={product.featured} />
            <label htmlFor="featured" className="label-slc">Produto em destaque</label>
          </div>

          <div className="flex items-center gap-2">
            <input name="active" type="checkbox" value="true" id="active" defaultChecked={product.active} />
            <label htmlFor="active" className="label-slc">Ativo (visível na loja)</label>
          </div>
        </div>

        <button type="submit" className="mt-6 px-6 py-2.5 text-[10px] tracking-widest uppercase text-white" style={{ backgroundColor: "#0D0B0B" }}>Salvar</button>
      </form>

      {/* Formulário de exclusão — FORA do form de edição */}
      <form action={async () => {
        "use server";
        await deleteProduct(id);
        redirect("/admin/produtos");
      }} className="mt-3 max-w-2xl">
        <button type="submit" className="px-6 py-2.5 text-[10px] tracking-widest uppercase text-white" style={{ backgroundColor: "#6B1A2A" }}>
          Excluir produto
        </button>
      </form>
    </div>
  );
}
