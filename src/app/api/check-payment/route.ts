import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { queryPayment } from "@/lib/cielo";

export async function GET(req: NextRequest) {
  const paymentId = req.nextUrl.searchParams.get("paymentId");
  const orderId = req.nextUrl.searchParams.get("orderId");
  if (!paymentId || !orderId) return NextResponse.json({ error: "Missing params" }, { status: 400 });
  try {
    const result = await queryPayment(paymentId);
    const status = result?.Payment?.Status;
    if (status === 2) {
      await prisma.order.update({ where: { id: orderId }, data: { status: "PAID", payment: result } });
      return NextResponse.json({ paid: true });
    }
    return NextResponse.json({ paid: false, status });
  } catch {
    return NextResponse.json({ error: "Query failed" }, { status: 500 });
  }
}
