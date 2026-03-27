import { prisma } from "@/lib/prisma";
import { createCategory, updateCategory, deleteCategory } from "@/actions/admin";
export const dynamic = "force-dynamic";

export default async function AdminCategorias() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: { _count: { select: { brands: true, products: true } } },
  });

  return (
    <div>
      <h1 className="font-serif text-2xl font-light mb-6">Categorias</h1>

      {/* Create Form */}
      <div className="mb-8 p-6 bg-white border" style={{ borderColor: "rgba(13,11,11,0.1)" }}>
        <h2 className="label-slc mb-4">Nova Categoria</h2>
        <form action={createCategory} className="flex gap-3 flex-wrap">
          <input name="name" required placeholder="Nome" className="border px-3 py-2 text-sm flex-1 min-w-[160px] outline-none focus:border-[#B8963E]" style={{ borderColor: "rgba(13,11,11,0.2)" }} />
          <input name="slug" placeholder="Slug (auto)" className="border px-3 py-2 text-sm w-40 outline-none focus:border-[#B8963E]" style={{ borderColor: "rgba(13,11,11,0.2)" }} />
          <input name="sortOrder" type="number" placeholder="Ordem" defaultValue="0" className="border px-3 py-2 text-sm w-24 outline-none focus:border-[#B8963E]" style={{ borderColor: "rgba(13,11,11,0.2)" }} />
          <button type="submit" className="px-5 py-2 text-[10px] tracking-widest uppercase text-white" style={{ backgroundColor: "#0D0B0B" }}>Criar</button>
        </form>
      </div>

      {/* List */}
      <div className="border" style={{ borderColor: "rgba(13,11,11,0.1)", backgroundColor: "white" }}>
        {categories.map(cat => (
          <div key={cat.id} className="border-b last:border-0 p-4" style={{ borderColor: "rgba(13,11,11,0.06)" }}>
            <div className="flex items-center gap-4 mb-3">
              <span className="font-serif text-base">{cat.name}</span>
              <span className="label-slc opacity-50">{cat.slug}</span>
              <span className="label-slc opacity-40 text-[9px]">{cat._count.brands} marcas · {cat._count.products} produtos</span>
            </div>
            <div className="flex gap-2">
              {/* Edit inline form */}
              <form action={async (fd: FormData) => {
                "use server";
                await updateCategory(cat.id, fd);
              }} className="flex gap-2 flex-wrap">
                <input name="name" defaultValue={cat.name} className="border px-2 py-1 text-xs outline-none" style={{ borderColor: "rgba(13,11,11,0.2)" }} />
                <input name="sortOrder" type="number" defaultValue={cat.sortOrder} className="border px-2 py-1 text-xs w-16 outline-none" style={{ borderColor: "rgba(13,11,11,0.2)" }} />
                <input name="video" defaultValue={cat.video ?? ""} placeholder="URL embed YouTube do vídeo banner" className="border px-2 py-1 text-xs outline-none w-80" style={{ borderColor: "rgba(13,11,11,0.2)" }} />
                <button type="submit" className="label-slc px-3 py-1 bg-[#B8963E]/10 text-[#B8963E]">Salvar</button>
              </form>
              <form action={async () => {
                "use server";
                await deleteCategory(cat.id);
              }}>
                <button type="submit" className="label-slc px-3 py-1 bg-[#6B1A2A]/10 text-[#6B1A2A]" onClick={undefined}>Excluir</button>
              </form>
            </div>
          </div>
        ))}
        {!categories.length && <p className="p-6 text-sm opacity-40">Nenhuma categoria ainda.</p>}
      </div>
    </div>
  );
}
