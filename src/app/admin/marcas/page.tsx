import { prisma } from "@/lib/prisma";
import { createBrand, deleteBrand } from "@/actions/admin";
import Link from "next/link";
export const dynamic = "force-dynamic";

export default async function AdminMarcas() {
  const [brands, categories] = await Promise.all([
    prisma.brand.findMany({
      orderBy: { name: "asc" },
      include: { category: true, _count: { select: { products: true } } },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="font-serif text-2xl font-light mb-6">Marcas <span className="text-sm font-sans opacity-40">({brands.length})</span></h1>

      {/* Create Form */}
      <div className="mb-8 p-6 bg-white border" style={{ borderColor: "rgba(13,11,11,0.1)" }}>
        <h2 className="label-slc mb-4">Nova Marca</h2>
        <form action={createBrand} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" encType="multipart/form-data">
          <div className="flex flex-col gap-1">
            <label className="label-slc">Nome *</label>
            <input name="name" required placeholder="ex: Rolex" className="border px-3 py-2 text-sm outline-none focus:border-[#B8963E]" style={{ borderColor: "rgba(13,11,11,0.2)" }} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="label-slc">Categoria *</label>
            <select name="categoryId" required className="border px-3 py-2 text-sm outline-none focus:border-[#B8963E] bg-white" style={{ borderColor: "rgba(13,11,11,0.2)" }}>
              <option value="">Selecione</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="label-slc">Descrição</label>
            <input name="description" placeholder="Breve descrição" className="border px-3 py-2 text-sm outline-none focus:border-[#B8963E]" style={{ borderColor: "rgba(13,11,11,0.2)" }} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="label-slc">Logo</label>
            <input name="logo" type="file" accept="image/*" className="text-sm" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="label-slc">Banner</label>
            <input name="banner" type="file" accept="image/*" className="text-sm" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="px-5 py-2 text-[10px] tracking-widest uppercase text-white w-full" style={{ backgroundColor: "#0D0B0B" }}>Criar Marca</button>
          </div>
        </form>
      </div>

      {/* Group by category */}
      {categories.map(cat => {
        const catBrands = brands.filter(b => b.categoryId === cat.id);
        if (!catBrands.length) return null;
        return (
          <div key={cat.id} className="mb-8">
            <h2 className="label-slc mb-3 opacity-60">{cat.name}</h2>
            <div className="border" style={{ borderColor: "rgba(13,11,11,0.1)", backgroundColor: "white" }}>
              {catBrands.map(brand => (
                <div key={brand.id} className="flex items-center gap-4 px-4 py-3 border-b last:border-0" style={{ borderColor: "rgba(13,11,11,0.06)" }}>
                  {brand.logo && <img src={brand.logo} alt={brand.name} className="w-8 h-8 object-contain" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{brand.name}</p>
                    <p className="label-slc opacity-40">{brand.slug} · {brand._count.products} produtos</p>
                  </div>
                  {brand.banner && <span className="label-slc text-[#B8963E] opacity-70">banner ✓</span>}
                  <Link href={`/admin/marcas/${brand.id}`} className="label-slc opacity-50 hover:opacity-100">Editar</Link>
                  <form action={async () => {
                    "use server";
                    await deleteBrand(brand.id);
                  }}>
                    <button type="submit" className="label-slc opacity-30 hover:opacity-100 hover:text-[#6B1A2A]">Excluir</button>
                  </form>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
