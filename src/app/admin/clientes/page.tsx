import { getAdminCustomers } from "@/actions/admin";
import { formatPrice } from "@/lib/utils";
export const dynamic = "force-dynamic";

export default async function AdminClientes() {
  const { customers, total } = await getAdminCustomers();
  return (
    <div>
      <h1 className="font-serif text-2xl font-light mb-6">
        Clientes <span className="text-sm font-sans opacity-40">({total})</span>
      </h1>
      <div className="border" style={{ borderColor: "rgba(13,11,11,0.1)", backgroundColor: "white" }}>
        {customers.length === 0 && <p className="p-6 text-sm opacity-40">Nenhum cliente cadastrado.</p>}
        {customers.map(c => (
          <div key={c.id} className="flex items-center gap-4 px-4 py-3 border-b last:border-0" style={{ borderColor: "rgba(13,11,11,0.06)" }}>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{c.name ?? "—"}</p>
              <p className="label-slc opacity-40 truncate">{c.email}</p>
            </div>
            <p className="label-slc opacity-60 flex-shrink-0 text-xs">{c._count.orders} pedido{c._count.orders !== 1 ? "s" : ""}</p>
            <p className="font-mono text-sm flex-shrink-0">{formatPrice(c.totalSpent)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
