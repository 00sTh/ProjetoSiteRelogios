import { getProducts } from "@/actions/products";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
export const dynamic = "force-dynamic";
export default async function AdminProdutos() {
  const { products, total } = await getProducts({ take: 50 });
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-2xl font-light">Produtos <span className="text-sm font-sans opacity-40">({total})</span></h1>
        <Link href="/admin/produtos/novo" className="px-4 py-2 text-[10px] tracking-widest uppercase text-white" style={{ backgroundColor: "#0D0B0B" }}>+ Novo</Link>
      </div>
      <div className="border" style={{ borderColor: "rgba(13,11,11,0.1)", backgroundColor: "white" }}>
        {products.map(p => (
          <div key={p.id} className="flex items-center gap-4 px-4 py-3 border-b last:border-0" style={{ borderColor: "rgba(13,11,11,0.06)" }}>
            <p className="flex-1 text-sm">{p.name}</p>
            <p className="label-slc hidden sm:block">{p.brand.name}</p>
            <p className="font-mono text-sm">{formatPrice(p.price)}</p>
            <p className="text-xs px-2 py-0.5" style={{ backgroundColor: p.active ? "rgba(0,100,0,0.1)" : "rgba(107,26,42,0.1)", color: p.active ? "green" : "#6B1A2A" }}>{p.active ? "Ativo" : "Inativo"}</p>
            <Link href={`/admin/produtos/${p.id}`} className="label-slc opacity-50 hover:opacity-100">Editar</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
