import { prisma } from "@/lib/prisma";
import { updateBrand } from "@/actions/admin";
import { notFound, redirect } from "next/navigation";
export const dynamic = "force-dynamic";

export default async function EditBrand({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [brand, categories] = await Promise.all([
    prisma.brand.findUnique({ where: { id }, include: { category: true } }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);
  if (!brand) notFound();

  return (
    <div>
      <h1 className="font-serif text-2xl font-light mb-2">Editar Marca</h1>
      <p className="label-slc opacity-50 mb-8">{brand.slug}</p>

      <div className="bg-white border p-6 max-w-xl" style={{ borderColor: "rgba(13,11,11,0.1)" }}>
        <form action={async (fd: FormData) => {
          "use server";
          await updateBrand(id, fd);
          redirect("/admin/marcas");
        }} encType="multipart/form-data" className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="label-slc">Nome</label>
            <input name="name" defaultValue={brand.name} required className="border px-3 py-2 text-sm outline-none focus:border-[#B8963E]" style={{ borderColor: "rgba(13,11,11,0.2)" }} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="label-slc">Categoria</label>
            <select name="categoryId" defaultValue={brand.categoryId} className="border px-3 py-2 text-sm outline-none focus:border-[#B8963E] bg-white" style={{ borderColor: "rgba(13,11,11,0.2)" }}>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="label-slc">Descrição</label>
            <textarea name="description" defaultValue={brand.description ?? ""} rows={3} className="border px-3 py-2 text-sm outline-none focus:border-[#B8963E] resize-none" style={{ borderColor: "rgba(13,11,11,0.2)" }} />
          </div>

          {brand.logo && (
            <div className="flex flex-col gap-1">
              <label className="label-slc">Logo atual</label>
              <img src={brand.logo} alt="logo" className="h-12 object-contain object-left" />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="label-slc">Logo (nova imagem)</label>
            <input name="logo" type="file" accept="image/*" className="text-sm" />
          </div>

          {brand.banner && (
            <div className="flex flex-col gap-1">
              <label className="label-slc">Banner atual</label>
              <img src={brand.banner} alt="banner" className="w-full h-24 object-cover" />
            </div>
          )}
          <div className="flex flex-col gap-1">
            <label className="label-slc">Banner (nova imagem)</label>
            <input name="banner" type="file" accept="image/*" className="text-sm" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="label-slc">Vídeo (URL embed YouTube)</label>
            <input
              name="video"
              defaultValue={brand.video ?? ""}
              placeholder="https://www.youtube.com/embed/ID?autoplay=1&mute=1&loop=1&playlist=ID&controls=0"
              className="border px-3 py-2 text-sm outline-none focus:border-[#B8963E]"
              style={{ borderColor: "rgba(13,11,11,0.2)" }}
            />
            <p className="text-[10px] opacity-40">Cole a URL embed completa. Aparece como hero de vídeo na página da marca.</p>
          </div>

          <button type="submit" className="px-5 py-2 text-[10px] tracking-widest uppercase text-white mt-2" style={{ backgroundColor: "#0D0B0B" }}>Salvar</button>
        </form>
      </div>
    </div>
  );
}
