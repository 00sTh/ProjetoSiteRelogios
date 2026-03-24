import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getMyOrders } from "@/actions/orders";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ContaPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const orders = await getMyOrders();
  return (
    <div className="pt-24 min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-10">
        <h1 className="font-serif text-3xl font-light mb-10">Minha Conta</h1>
        <p className="label-slc mb-6">Histórico de Pedidos</p>
        {!orders.length && <p className="text-sm opacity-50">Nenhum pedido encontrado.</p>}
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="border p-5" style={{ borderColor: "rgba(13,11,11,0.1)" }}>
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-mono text-sm font-medium">{order.orderNumber}</p>
                  <p className="label-slc mt-0.5">{new Date(order.createdAt).toLocaleDateString("pt-BR")}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm">{formatPrice(order.total)}</p>
                  <span className="label-slc px-2 py-0.5 mt-1 inline-block" style={{ backgroundColor: order.status === "PAID" || order.status === "DELIVERED" ? "rgba(0,100,0,0.1)" : "rgba(184,150,62,0.1)", color: order.status === "PAID" || order.status === "DELIVERED" ? "green" : "#B8963E" }}>{order.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
