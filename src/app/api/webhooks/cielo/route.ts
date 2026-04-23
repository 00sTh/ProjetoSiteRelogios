import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const paymentId = body?.PaymentId;
    if (!paymentId) return NextResponse.json({ ok: true });
    const order = await prisma.order.findFirst({
      where: { payment: { path: ["Payment", "PaymentId"], equals: paymentId } },
      include: { items: true },
    });
    if (order && body.Status === 2 && order.status !== "PAID") {
      await prisma.order.update({ where: { id: order.id }, data: { status: "PAID" } });
      for (const item of order.items) {
        await prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
      }
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
