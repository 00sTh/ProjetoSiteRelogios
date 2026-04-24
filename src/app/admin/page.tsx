import { getAdminStats } from "@/actions/admin";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
export const dynamic = "force-dynamic";

const STATUS_PT: Record<string, string> = {
  PENDING: "Pendente", PAID: "Pago", PROCESSING: "Processando",
  SHIPPED: "Enviado", DELIVERED: "Entregue", CANCELLED: "Cancelado",
};
const STATUS_COLOR: Record<string, string> = {
  PENDING: "#B8963E", PAID: "green", PROCESSING: "#0D0B0B",
  SHIPPED: "#0D0B0B", DELIVERED: "green", CANCELLED: "#6B1A2A",
};

export default async function AdminDashboard() {
  const stats = await getAdminStats();
  return (
    <div className="space-y-8">
      <h1 className="font-serif text-2xl font-light">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Produtos Ativos", value: stats.totalProducts },
          { label: "Total de Pedidos", value: stats.totalOrders },
          { label: "Pedidos Pendentes", value: stats.pendingOrders },
          { label: "Receita Confirmada", value: formatPrice(stats.revenue) },
        ].map(s => (
          <div key={s.label} className="p-5 border" style={{ borderColor: "rgba(13,11,11,0.1)", backgroundColor: "white" }}>
            <p className="label-slc mb-2">{s.label}</p>
            <p className="font-mono text-xl font-medium">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="label-slc text-xs tracking-widest">Pedidos Recentes</h2>
            <Link href="/admin/pedidos" className="label-slc opacity-40 hover:opacity-80 text-[9px]">Ver todos →</Link>
          </div>
          <div className="border bg-white" style={{ borderColor: "rgba(13,11,11,0.1)" }}>
            {stats.recentOrders.length === 0 && <p className="p-4 text-sm opacity-40">Nenhum pedido.</p>}
            {stats.recentOrders.map(o => {
              const customer = o.customer as { name?: string };
              const color = STATUS_COLOR[o.status] ?? "#000";
              return (
                <div key={o.id} className="flex items-center gap-3 px-4 py-2.5 border-b last:border-0 text-sm" style={{ borderColor: "rgba(13,11,11,0.06)" }}>
                  <span className="font-mono text-[10px] opacity-50 flex-shrink-0">{o.orderNumber}</span>
                  <span className="flex-1 truncate">{customer?.name ?? "—"}</span>
                  <span className="font-mono text-xs flex-shrink-0">{formatPrice(Number(o.total))}</span>
                  <span className="label-slc text-[9px] px-1.5 py-0.5 flex-shrink-0" style={{ color, backgroundColor: `${color}18` }}>{STATUS_PT[o.status]}</span>
                  <Link href={`/admin/pedidos/${o.id}`} className="label-slc opacity-40 hover:opacity-100 text-[9px] flex-shrink-0">Ver</Link>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h2 className="label-slc text-xs tracking-widest mb-3">Estoque Crítico <span className="opacity-40">(≤ 3 un.)</span></h2>
          <div className="border bg-white" style={{ borderColor: "rgba(13,11,11,0.1)" }}>
            {stats.lowStock.length === 0 && <p className="p-4 text-sm opacity-40">Nenhum produto com estoque crítico.</p>}
            {stats.lowStock.map(p => (
              <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 border-b last:border-0 text-sm" style={{ borderColor: "rgba(13,11,11,0.06)" }}>
                <span className="flex-1 truncate">{p.name}</span>
                <span className="font-mono text-xs px-2 py-0.5 flex-shrink-0" style={{ backgroundColor: p.stock === 0 ? "rgba(107,26,42,0.1)" : "rgba(184,150,62,0.1)", color: p.stock === 0 ? "#6B1A2A" : "#B8963E" }}>
                  {p.stock === 0 ? "Sem estoque" : `${p.stock} un.`}
                </span>
                <Link href={`/admin/produtos/${p.id}`} className="label-slc opacity-40 hover:opacity-100 text-[9px] flex-shrink-0">Editar</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
