import { prisma } from "@/lib/prisma";
import { updateOrderStatus } from "@/actions/admin";
import { notFound } from "next/navigation";
import { formatPrice } from "@/lib/utils";
export const dynamic = "force-dynamic";

const STATUS_OPTIONS = ["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"];
const STATUS_PT: Record<string, string> = {
  PENDING: "Pendente", PAID: "Pago", PROCESSING: "Processando",
  SHIPPED: "Enviado", DELIVERED: "Entregue", CANCELLED: "Cancelado",
};
const STATUS_COLOR: Record<string, string> = {
  PENDING: "#B8963E", PAID: "green", PROCESSING: "#0D0B0B",
  SHIPPED: "#0D0B0B", DELIVERED: "green", CANCELLED: "#6B1A2A",
};

export default async function PedidoDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: { select: { name: true, images: true, slug: true } } } },
    },
  });
  if (!order) notFound();

  const customer = order.customer as Record<string, string>;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <h1 className="font-serif text-2xl font-light">{order.orderNumber}</h1>
        <span className="label-slc px-2 py-0.5" style={{ backgroundColor: `${STATUS_COLOR[order.status]}15`, color: STATUS_COLOR[order.status] }}>
          {STATUS_PT[order.status]}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Customer */}
        <div className="bg-white border p-5" style={{ borderColor: "rgba(13,11,11,0.1)" }}>
          <h2 className="label-slc mb-4">Cliente</h2>
          <div className="space-y-1.5 text-sm">
            <p><span className="label-slc opacity-50 mr-2">Nome</span>{customer.name}</p>
            <p><span className="label-slc opacity-50 mr-2">Email</span>{customer.email}</p>
            {customer.phone && <p><span className="label-slc opacity-50 mr-2">Telefone</span>{customer.phone}</p>}
            {customer.cpf && <p><span className="label-slc opacity-50 mr-2">CPF</span>{customer.cpf}</p>}
            {customer.street && (
              <p className="mt-2 opacity-70">
                {customer.street}, {customer.number}{customer.complement ? ` ${customer.complement}` : ""} — {customer.neighborhood}<br />
                {customer.city}/{customer.state} — CEP {customer.cep}
              </p>
            )}
          </div>
        </div>

        {/* Payment + Status */}
        <div className="bg-white border p-5" style={{ borderColor: "rgba(13,11,11,0.1)" }}>
          <h2 className="label-slc mb-4">Pagamento & Status</h2>
          <div className="space-y-1.5 text-sm mb-4">
            <p><span className="label-slc opacity-50 mr-2">Método</span>{order.paymentMethod}</p>
            <p><span className="label-slc opacity-50 mr-2">Total</span><span className="font-mono font-medium">{formatPrice(order.total)}</span></p>
            <p><span className="label-slc opacity-50 mr-2">Data</span>{new Date(order.createdAt).toLocaleString("pt-BR")}</p>
          </div>
          <form action={async (fd: FormData) => {
            "use server";
            const status = fd.get("status") as string;
            await updateOrderStatus(id, status);
          }} className="flex gap-2">
            <select name="status" defaultValue={order.status} className="border px-3 py-2 text-sm outline-none bg-white flex-1" style={{ borderColor: "rgba(13,11,11,0.2)" }}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_PT[s]}</option>)}
            </select>
            <button type="submit" className="px-4 py-2 text-[10px] tracking-widest uppercase text-white flex-shrink-0" style={{ backgroundColor: "#0D0B0B" }}>Atualizar</button>
          </form>
        </div>

        {/* Items */}
        <div className="bg-white border p-5 lg:col-span-2" style={{ borderColor: "rgba(13,11,11,0.1)" }}>
          <h2 className="label-slc mb-4">Itens ({order.items.length})</h2>
          <div className="space-y-3">
            {order.items.map(item => (
              <div key={item.id} className="flex gap-3 items-center border-b pb-3 last:border-0 last:pb-0" style={{ borderColor: "rgba(13,11,11,0.06)" }}>
                {item.product?.images?.[0] && (
                  <img src={item.product.images[0]} alt={item.product.name} className="w-14 h-14 object-cover" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.product?.name ?? "Produto removido"}</p>
                  <p className="label-slc opacity-40">Qtd: {item.quantity}{item.color ? ` · ${item.color}` : ""}</p>
                </div>
                <p className="font-mono text-sm">{formatPrice(Number(item.price) * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3 border-t flex justify-end" style={{ borderColor: "rgba(13,11,11,0.1)" }}>
            <p className="font-mono font-medium">Total: {formatPrice(order.total)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
