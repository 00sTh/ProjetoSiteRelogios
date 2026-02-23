import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkoutSchema } from "@/lib/validations/checkout";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { createAuditLog, extractRequestMeta } from "@/lib/audit";

/**
 * POST /api/checkout
 *
 * Decisões de segurança:
 * - Autenticação obrigatória via session JWT.
 * - Rate limit de 10 req/min: previne abuso e enumeração de tokens.
 * - Validação Zod completa (incluindo CPF, endereço, itens).
 * - Preços recalculados server-side: NUNCA confiar no preço enviado
 *   pelo cliente (previne price tampering).
 * - Transação Prisma: garante atomicidade (pedido + itens).
 * - Audit log da compra para compliance.
 */

export async function POST(request: NextRequest) {
  try {
    // --- Autenticação ---
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Não autorizado" },
        { status: 401 }
      );
    }

    // --- Rate Limiting ---
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const rl = checkRateLimit(ip, "checkout");
    if (!rl.success) {
      return rateLimitResponse(rl);
    }

    // --- Validação ---
    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { items, shippingAddress, paymentMethod, paymentToken } = parsed.data;

    // --- Buscar produtos e recalcular preços server-side ---
    const productIds = items.map((item) => item.productId);
    const products = await db.product.findMany({
      where: { id: { in: productIds }, inStock: true },
    });

    if (products.length !== items.length) {
      return NextResponse.json(
        { error: "Um ou mais produtos não estão disponíveis" },
        { status: 400 }
      );
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Recalcular total server-side (NUNCA confiar no cliente)
    let totalAmount = 0;
    const orderItems = items.map((item) => {
      const product = productMap.get(item.productId)!;
      const unitPrice = Number(product.price);
      totalAmount += unitPrice * item.quantity;
      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
      };
    });

    // --- Criar pedido em transação ---
    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: session.user!.id,
          status: "PENDING",
          totalAmount,
          paymentMethod,
          paymentToken,
          shippingAddress: shippingAddress as unknown as Record<string, unknown>,
          items: {
            create: orderItems,
          },
        },
        include: { items: true },
      });

      // Decrementar estoque
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockCount: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    // --- Audit Log ---
    const meta = extractRequestMeta(request);
    await createAuditLog({
      userId: session.user.id,
      action: "PURCHASE",
      entity: "Order",
      entityId: order.id,
      metadata: { totalAmount, itemCount: items.length, paymentMethod },
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return NextResponse.json(
      { message: "Pedido criado com sucesso", orderId: order.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("[CHECKOUT_ERROR]", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
