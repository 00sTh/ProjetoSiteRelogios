import { getAdminOrders } from "@/actions/admin";
import { formatPrice } from "@/lib/utils";
export const dynamic = "force-dynamic";
export default async function AdminPedidos() {
  const { orders, total } = await getAdminOrders({ take: 30 });
  return (
    <div>
      <h1 className="font-serif text-2xl font-light mb-6">Pedidos <span className="text-sm font-sans opacity-40">({total})</span></h1>
      <div className="border" style={{ borderColor: "rgba(13,11,11,0.1)", backgroundColor: "white" }}>
        {orders.map(o => {
          const customer = o.customer as { name?: string };
          return (
            <div key={o.id} className="flex items-center gap-4 px-4 py-3 border-b last:border-0" style={{ borderColor: "rgba(13,11,11,0.06)" }}>
              <p className="font-mono text-xs flex-shrink-0">{o.orderNumber}</p>
              <p className="flex-1 text-sm">{customer?.name ?? "—"}</p>
              <p className="font-mono text-sm">{formatPrice(o.total)}</p>
              <p className="label-slc px-2 py-0.5" style={{ backgroundColor: "rgba(184,150,62,0.1)", color: "#B8963E" }}>{o.status}</p>
              <p className="label-slc opacity-40 text-[9px]">{new Date(o.createdAt).toLocaleDateString("pt-BR")}</p>
            </div>
          );
        })}
        {!orders.length && <p className="p-6 text-sm opacity-40">Nenhum pedido ainda.</p>}
      </div>
    </div>
  );
}
