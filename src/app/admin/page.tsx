import { getAdminStats } from "@/actions/admin";
import { formatPrice } from "@/lib/utils";
export const dynamic = "force-dynamic";
export default async function AdminDashboard() {
  const stats = await getAdminStats();
  return (
    <div>
      <h1 className="font-serif text-2xl font-light mb-8">Dashboard</h1>
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
    </div>
  );
}
