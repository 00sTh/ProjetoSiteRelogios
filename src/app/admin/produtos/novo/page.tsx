import { prisma } from "@/lib/prisma";
import { createProduct } from "@/actions/admin";
import { ColorDetector } from "@/components/admin/color-detector";
import { redirect } from "next/navigation";
export const dynamic = "force-dynamic";

export default async function NovoProduto() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, include: { category: true } }),
  ]);

  return (
    <div>
      <h1 className="font-serif text-2xl font-light mb-8">Novo Produto</h1>

      <form action={async (fd: FormData) => {
        "use server";
        await createProduct(fd);
        redirect("/admin/produtos");
      }} encType="multipart/form-data" className="bg-white border p-6 max-w-2xl" style={{ borderColor: "rgba(13,11,11,0.1)" }}>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="label-slc">Nome *</label>
            <input name="name" required placeholder="Rolex Submariner Date 41mm" className="border px-3 py-2 text-sm outline-none focus:border-[#B8963E]" style={{ borderColor: "rgba(13,11,11,0.2)" }} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="label-slc">Categoria *</label>
            <select name="categoryId" required className="border px-3 py-2 text-sm outline-none bg-white" style={{ borderColor: "rgba(13,11,11,0.2)" }}>
              <option value="">Selecione</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="label-slc">Marca *</label>
            <select name="brandId" required className="border px-3 py-2 text-sm outline-none bg-white" style={{ borderColor: "rgba(13,11,11,0.2)" }}>
              <option value="">Selecione</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name} — {b.category.name}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="label-slc">Preço (R$) *</label>
            <input name="price" type="number" step="0.01" required placeholder="89900.00" className="border px-3 py-2 text-sm outline-none focus:border-[#B8963E] font-mono" style={{ borderColor: "rgba(13,11,11,0.2)" }} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="label-slc">Preço original (R$)</label>
            <input name="comparePrice" type="number" step="0.01" placeholder="99900.00" className="border px-3 py-2 text-sm outline-none focus:border-[#B8963E] font-mono" style={{ borderColor: "rgba(13,11,11,0.2)" }} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="label-slc">Estoque</label>
            <input name="stock" type="number" defaultValue="1" className="border px-3 py-2 text-sm outline-none focus:border-[#B8963E] font-mono" style={{ borderColor: "rgba(13,11,11,0.2)" }} />
          </div>

          <div className="flex flex-col gap-1">
            <label className="label-slc">SKU</label>
            <input name="sku" placeholder="ROL-SUB-41-BK" className="border px-3 py-2 text-sm outline-none focus:border-[#B8963E] font-mono" style={{ borderColor: "rgba(13,11,11,0.2)" }} />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="label-slc">Descrição</label>
            <textarea name="description" rows={4} placeholder="Descrição detalhada do produto..." className="border px-3 py-2 text-sm outline-none focus:border-[#B8963E] resize-none" style={{ borderColor: "rgba(13,11,11,0.2)" }} />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="label-slc">Atributos (JSON)</label>
            <textarea name="attributes" rows={3} placeholder='{"Movimento":"Automático","Diâmetro":"41mm","Material":"Ouro 18k"}' className="border px-3 py-2 text-sm outline-none focus:border-[#B8963E] resize-none font-mono text-xs" style={{ borderColor: "rgba(13,11,11,0.2)" }} />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="label-slc">Cores disponíveis</label>
            <ColorDetector />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="label-slc">Imagens</label>
            <input name="images" type="file" accept="image/*" multiple className="text-sm" />
          </div>

          <div className="flex items-center gap-2">
            <input name="featured" type="checkbox" value="true" id="featured" />
            <label htmlFor="featured" className="label-slc">Produto em destaque</label>
          </div>
        </div>

        <button type="submit" className="mt-6 px-6 py-2.5 text-[10px] tracking-widest uppercase text-white" style={{ backgroundColor: "#0D0B0B" }}>Criar Produto</button>
      </form>
    </div>
  );
}
