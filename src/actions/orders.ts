"use server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";
import { processCardPayment, processPixPayment } from "@/lib/cielo";
import { generateOrderNumber } from "@/lib/utils";
import type { CheckoutCustomer, CartItem } from "@/types";

interface CreateOrderInput {
  customer: CheckoutCustomer;
  items: CartItem[];
  paymentMethod: "CREDIT_CARD" | "PIX";
  card?: { number: string; holder: string; expiration: string; cvv: string; installments: number; };
}

export async function createOrder(input: CreateOrderInput) {
  const userId = await getAuthUser();

  // Fetch products and validate stock
  const productIds = input.items.map(i => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds }, active: true } });
  if (products.length !== input.items.length) return { success: false, error: "Produto indisponível" };

  let total = 0;
  const orderItems = input.items.map(item => {
    const product = products.find(p => p.id === item.productId)!;
    if (product.stock < item.quantity) throw new Error(`Estoque insuficiente: ${product.name}`);
    const price = Number(product.price);
    total += price * item.quantity;
    return { productId: item.productId, quantity: item.quantity, price: product.price, color: item.color ?? null };
  });

  const orderNumber = generateOrderNumber();
  const amountCents = Math.round(total * 100);

  // Sync user profile if authenticated
  if (userId) {
    await prisma.userProfile.upsert({
      where: { id: userId },
      update: {},
      create: { id: userId, email: input.customer.email, name: input.customer.name },
    });
  }

  // Create order (pending)
  const order = await prisma.order.create({
    data: {
      orderNumber,
      status: "PENDING",
      total,
      customer: input.customer as object,
      userId: userId ?? null,
      paymentMethod: input.paymentMethod,
      items: { create: orderItems },
    },
  });

  // Process payment
  try {
    if (input.paymentMethod === "CREDIT_CARD" && input.card) {
      const result = await processCardPayment({
        orderId: orderNumber,
        amount: amountCents,
        installments: input.card.installments,
        cardNumber: input.card.number,
        holderName: input.card.holder,
        expirationDate: input.card.expiration,
        securityCode: input.card.cvv,
        customerName: input.customer.name,
        customerEmail: input.customer.email,
        customerCpf: input.customer.cpf ?? "",
      });
      const status = result?.Payment?.Status;
      if (status === 2) {
        await prisma.order.update({ where: { id: order.id }, data: { status: "PAID", payment: result } });
        for (const item of input.items) {
          await prisma.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
        }
        return { success: true, type: "paid", orderId: order.id };
      }
      await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED", payment: result } });
      return { success: false, error: result?.Payment?.ReturnMessage ?? "Pagamento recusado" };
    }

    if (input.paymentMethod === "PIX") {
      const result = await processPixPayment({
        orderId: orderNumber,
        amount: amountCents,
        customerName: input.customer.name,
        customerEmail: input.customer.email,
      });
      const paymentId = result?.Payment?.PaymentId;
      const qrCodeBase64 = result?.Payment?.QrCodeBase64Image ?? result?.Payment?.QrCode ?? null;
      const qrCode = result?.Payment?.QrCodeString ?? result?.Payment?.PixQrCode ?? null;
      await prisma.order.update({ where: { id: order.id }, data: { payment: result } });
      return { success: true, type: "pix" as const, orderId: order.id, paymentId, qrCode, qrCodeBase64 };
    }
  } catch {
    await prisma.order.update({ where: { id: order.id }, data: { status: "CANCELLED" } });
    return { success: false, error: "Erro ao processar pagamento" };
  }

  return { success: false, error: "Método de pagamento inválido" };
}

export async function getMyOrders() {
  const userId = await getAuthUser();
  if (!userId) return [];
  return prisma.order.findMany({
    where: { userId },
    include: { items: { include: { product: { select: { id: true, name: true, images: true, slug: true, price: true } } } } },
    orderBy: { createdAt: "desc" },
  });
}
