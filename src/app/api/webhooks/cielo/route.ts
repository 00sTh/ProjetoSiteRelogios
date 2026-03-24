import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const paymentId = body?.PaymentId;
    if (!paymentId) return NextResponse.json({ ok: true });
    const order = await prisma.order.findFirst({ where: { payment: { path: ["Payment", "PaymentId"], equals: paymentId } } });
    if (order && body.Status === 2) {
      await prisma.order.update({ where: { id: order.id }, data: { status: "PAID" } });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
