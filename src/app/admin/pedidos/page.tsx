import { getAdminOrders } from "@/actions/admin";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
export const dynamic = "force-dynamic";

const TAKE = 20;
const STATUS_TABS = [
  { key: "", label: "Todos" },
  { key: "PENDING", label: "Pendente" },
  { key: "PAID", label: "Pago" },
  { key: "PROCESSING", label: "Processando" },
  { key: "SHIPPED", label: "Enviado" },
  { key: "DELIVERED", label: "Entregue" },
  { key: "CANCELLED", label: "Cancelado" },
];
const STATUS_COLOR: Record<string, string> = {
  PENDING: "#B8963E", PAID: "green", PROCESSING: "#0D0B0B",
  SHIPPED: "#0D0B0B", DELIVERED: "green", CANCELLED: "#6B1A2A",
};

export default async function AdminPedidos({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const status = sp.status ?? "";
  const page = Math.max(1, parseInt(sp.page ?? "1"));

  const { orders, total } = await getAdminOrders({ status: status || undefined, take: TAKE, skip: (page - 1) * TAKE });
  const pages = Math.ceil(total / TAKE);
  const from = total === 0 ? 0 : (page - 1) * TAKE + 1;
  const to = Math.min(page * TAKE, total);

  function pageUrl(p: number) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/admin/pedidos${qs ? `?${qs}` : ""}`;
  }

  return (
    <div>
      <h1 className="font-serif text-2xl font-light mb-4">
        Pedidos <span className="text-sm font-sans opacity-40">({total})</span>
      </h1>

      <div className="flex gap-1 flex-wrap mb-5">
        {STATUS_TABS.map(t => {
          const isActive = status === t.key;
          const href = t.key ? `/admin/pedidos?status=${t.key}` : "/admin/pedidos";
          return (
            <Link
              key={t.key}
              href={href}
              className="px-3 py-1.5 text-[10px] tracking-widest uppercase border transition-colors"
              style={{
                borderColor: isActive ? "#0D0B0B" : "rgba(13,11,11,0.2)",
                backgroundColor: isActive ? "#0D0B0B" : "white",
                color: isActive ? "white" : "rgba(13,11,11,0.6)",
              }}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      <div className="border" style={{ borderColor: "rgba(13,11,11,0.1)", backgroundColor: "white" }}>
        {orders.map(o => {
          const customer = o.customer as { name?: string };
          const color = STATUS_COLOR[o.status] ?? "#000";
          return (
            <div key={o.id} className="flex items-center gap-4 px-4 py-3 border-b last:border-0" style={{ borderColor: "rgba(13,11,11,0.06)" }}>
              <p className="font-mono text-xs flex-shrink-0">{o.orderNumber}</p>
              <p className="flex-1 text-sm truncate">{customer?.name ?? "—"}</p>
              <p className="font-mono text-sm flex-shrink-0">{formatPrice(o.total)}</p>
              <p className="label-slc px-2 py-0.5 flex-shrink-0" style={{ backgroundColor: `${color}18`, color }}>
                {o.status}
              </p>
              <p className="label-slc opacity-40 text-[9px] flex-shrink-0 hidden sm:block">{new Date(o.createdAt).toLocaleDateString("pt-BR")}</p>
              <Link href={`/admin/pedidos/${o.id}`} className="label-slc opacity-50 hover:opacity-100 flex-shrink-0">Ver</Link>
            </div>
          );
        })}
        {!orders.length && <p className="p-6 text-sm opacity-40">Nenhum pedido{status ? " com este status" : ""}.</p>}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="label-slc opacity-40 text-[10px]">{from}–{to} de {total} pedidos</p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link href={pageUrl(page - 1)} className="px-3 py-1.5 text-[10px] tracking-widest uppercase border" style={{ borderColor: "rgba(13,11,11,0.2)" }}>
                ← Anterior
              </Link>
            )}
            {page < pages && (
              <Link href={pageUrl(page + 1)} className="px-3 py-1.5 text-[10px] tracking-widest uppercase border" style={{ borderColor: "rgba(13,11,11,0.2)" }}>
                Próxima →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
