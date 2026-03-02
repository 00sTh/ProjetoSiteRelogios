"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { PaymentMethod } from "@prisma/client";
import { getServerAuth, getServerUser } from "@/lib/auth";
import {
  createCreditCardPayment,
  createPixPayment,
  detectCardBrand,
  isPaymentConfirmed,
  isPaymentDenied,
  type CieloCreditCard,
} from "@/lib/cielo";
import {
  sendOrderConfirmationToCustomer,
  sendNewOrderNotification,
} from "@/lib/mailer";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const addressSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  cpf: z
    .string()
    .optional()
    .transform((v) => (v ?? "").replace(/\D/g, ""))
    .refine((v) => v.length === 0 || v.length === 11, "CPF deve ter 11 dígitos"),
  phone: z.string().min(8).max(20).optional().or(z.literal("")),
  street: z.string().min(2).max(200),
  number: z.string().min(1).max(20),
  complement: z.string().max(100).optional().or(z.literal("")),
  city: z.string().min(2).max(100),
  state: z.string().length(2),
  zip: z.string().min(8).max(9),
  notes: z.string().max(500).optional().or(z.literal("")),
});

const guestItemSchema = z.array(
  z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().positive(),
  })
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getOrCreateUserProfile(userId: string) {
  const existing = await prisma.userProfile.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });
  if (existing) return existing;

  const user = await getServerUser();
  type ClerkUser = { emailAddresses?: Array<{ emailAddress: string }> };
  const email =
    (user as ClerkUser)?.emailAddresses?.[0]?.emailAddress ?? `${userId}@altheia.com`;

  return prisma.userProfile.create({
    data: { clerkId: userId, email },
    select: { id: true },
  });
}

async function getCartWithItems(userId: string) {
  return prisma.cart.findUnique({
    where: { clerkId: userId },
    include: {
      items: {
        include: {
          product: {
            select: { id: true, price: true, stock: true, name: true },
          },
        },
      },
    },
  });
}

// ─── createOrder ──────────────────────────────────────────────────────────────

/** Cria o pedido no banco + processa pagamento via Cielo ou fluxo WhatsApp */
export async function createOrder(
  formData: FormData
): Promise<
  | { success: false; error: string }
  | { success: true; type: "paid"; orderId: string }
  | { success: true; type: "pix"; orderId: string; cieloPaymentId: string; pixQrCode: string }
  | { success: true; type: "whatsapp"; orderId: string }
> {
  const { userId } = await getServerAuth();

  // Validate address fields
  const raw = Object.fromEntries(formData.entries());
  const parsed = addressSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }
  const d = parsed.data;

  const paymentMethod = (formData.get("paymentMethod") as string) || "WHATSAPP";

  const shippingAddress = JSON.stringify({
    street: d.street,
    number: d.number,
    complement: d.complement || null,
    city: d.city,
    state: d.state,
    zip: d.zip,
  });

  // ── Guest checkout ──────────────────────────────────────────────────────────
  if (!userId) {
    const guestItemsRaw = formData.get("guestItems") as string | null;
    if (!guestItemsRaw) {
      return { success: false, error: "Carrinho vazio" };
    }

    let guestItems: { productId: string; quantity: number }[];
    try {
      guestItems = guestItemSchema.parse(JSON.parse(guestItemsRaw));
    } catch {
      return { success: false, error: "Dados do carrinho inválidos" };
    }

    if (guestItems.length === 0) {
      return { success: false, error: "Carrinho vazio" };
    }

    // Validate stock + get prices
    const productIds = guestItems.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, active: true },
      select: { id: true, price: true, stock: true, name: true },
    });

    for (const item of guestItems) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return { success: false, error: "Produto não encontrado ou indisponível" };
      }
      if (product.stock < item.quantity) {
        return { success: false, error: `Estoque insuficiente para "${product.name}"` };
      }
    }

    const total = guestItems.reduce((acc, item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return acc + Number(product.price) * item.quantity;
    }, 0);

    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          status: "PENDING",
          price: total,
          paymentMethod: paymentMethod as PaymentMethod,
          customerName: d.name,
          customerEmail: d.email,
          customerPhone: d.phone || null,
          customerCpf: d.cpf || null,
          shippingAddress,
          notes: d.notes || null,
          userProfileId: null,
          items: {
            create: guestItems.map((item) => {
              const product = products.find((p) => p.id === item.productId)!;
              return {
                productId: item.productId,
                quantity: item.quantity,
                price: Number(product.price),
              };
            }),
          },
        },
      });

      for (const item of guestItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return created;
    });

    // Process payment (same logic as auth users)
    const guestResult = await processPayment({
      order,
      paymentMethod,
      formData,
      d,
      total,
      items: guestItems.map((item) => {
        const product = products.find((p) => p.id === item.productId)!;
        return { productId: item.productId, quantity: item.quantity, price: Number(product.price) };
      }),
    });
    if (guestResult.success) {
      sendOrderEmails({
        id: order.id,
        customerName: d.name,
        customerEmail: d.email,
        price: total,
        paymentMethod,
        itemCount: guestItems.reduce((a, i) => a + i.quantity, 0),
      });
    }
    return guestResult;
  }

  // ── Authenticated checkout ──────────────────────────────────────────────────
  const cart = await getCartWithItems(userId);
  if (!cart || cart.items.length === 0) {
    return { success: false, error: "Carrinho vazio" };
  }

  // Validate stock
  for (const item of cart.items) {
    if (item.product.stock < item.quantity) {
      return {
        success: false,
        error: `Estoque insuficiente para "${item.product.name}"`,
      };
    }
  }

  const userProfile = await getOrCreateUserProfile(userId);
  const total = cart.items.reduce(
    (acc, item) => acc + Number(item.product.price) * item.quantity,
    0
  );

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        status: "PENDING",
        price: total,
        paymentMethod: paymentMethod as PaymentMethod,
        customerName: d.name,
        customerEmail: d.email,
        customerPhone: d.phone || null,
        customerCpf: d.cpf || null,
        shippingAddress,
        notes: d.notes || null,
        userProfileId: userProfile.id,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: Number(item.product.price),
          })),
        },
      },
    });

    for (const item of cart.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } },
      });
    }

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

    return created;
  });

  revalidatePath("/cart");
  revalidatePath("/", "layout");

  const result = await processPayment({
    order,
    paymentMethod,
    formData,
    d,
    total,
    items: cart.items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      price: Number(item.product.price),
    })),
  });

  if (result.success) {
    sendOrderEmails({
      id: order.id,
      customerName: d.name,
      customerEmail: d.email,
      price: total,
      paymentMethod,
      itemCount: cart.items.reduce((a, i) => a + i.quantity, 0),
    });
  }

  return result;
}

// ─── sendOrderEmails (fire-and-forget) ────────────────────────────────────────

function sendOrderEmails(params: {
  id: string;
  customerName: string;
  customerEmail: string;
  price: number;
  paymentMethod: string;
  itemCount: number;
}) {
  const orderSummary = {
    id: params.id,
    customerName: params.customerName,
    customerEmail: params.customerEmail,
    price: params.price,
    paymentMethod: params.paymentMethod,
    itemCount: params.itemCount,
  };

  // Email para o cliente
  sendOrderConfirmationToCustomer(orderSummary).catch(console.error);

  // Email para o admin (se notificationEmail configurado)
  prisma.siteSettings
    .findUnique({ where: { id: "default" }, select: { notificationEmail: true } })
    .then((s) => {
      if (s?.notificationEmail) {
        sendNewOrderNotification(orderSummary, s.notificationEmail).catch(console.error);
      }
    })
    .catch(console.error);
}

// ─── processPayment ───────────────────────────────────────────────────────────

type OrderRecord = { id: string };
type ItemRecord = { productId: string; quantity: number; price: number };

async function processPayment({
  order,
  paymentMethod,
  formData,
  d,
  total,
  items,
}: {
  order: OrderRecord;
  paymentMethod: string;
  formData: FormData;
  d: { name: string; email: string };
  total: number;
  items: ItemRecord[];
}): Promise<
  | { success: false; error: string }
  | { success: true; type: "paid"; orderId: string }
  | { success: true; type: "pix"; orderId: string; cieloPaymentId: string; pixQrCode: string }
  | { success: true; type: "whatsapp"; orderId: string }
> {
  // ── WhatsApp ──────────────────────────────────────────────────────────────
  if (paymentMethod === "WHATSAPP") {
    return { success: true, type: "whatsapp", orderId: order.id };
  }

  // ── Cielo — Cartão de Crédito ──────────────────────────────────────────────
  if (paymentMethod === "CREDIT_CARD") {
    const cardNumber = (formData.get("cardNumber") as string) ?? "";
    const cardHolder = (formData.get("cardHolder") as string) ?? "";
    const cardExpiry = (formData.get("cardExpiry") as string) ?? "";
    const cardCvv = (formData.get("cardCvv") as string) ?? "";
    const installments = parseInt((formData.get("installments") as string) || "1", 10);

    const brand = detectCardBrand(cardNumber);
    if (!brand) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      });
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
      return {
        success: false,
        error: "Bandeira do cartão não reconhecida. Aceitamos Visa, Mastercard, Amex, Elo, Hipercard e Diners.",
      };
    }

    const card: CieloCreditCard = {
      CardNumber: cardNumber,
      Holder: cardHolder,
      ExpirationDate: cardExpiry,
      SecurityCode: cardCvv,
      Brand: brand,
    };

    let cieloResp;
    try {
      cieloResp = await createCreditCardPayment({
        merchantOrderId: order.id,
        customer: { Name: d.name, Email: d.email },
        amountInReais: total,
        installments,
        card,
      });
    } catch (err) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      });
      // Restore stock
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
      console.error("Cielo error:", err);
      return { success: false, error: "Erro ao conectar com o gateway de pagamento. Tente novamente." };
    }

    const { Payment } = cieloResp;

    if (isPaymentConfirmed(Payment.Status)) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "PAID", cieloPaymentId: Payment.PaymentId },
      });
      return { success: true, type: "paid", orderId: order.id };
    }

    if (isPaymentDenied(Payment.Status)) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED", cieloPaymentId: Payment.PaymentId },
      });
      for (const item of items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
      const code = Payment.ReturnCode ?? "";
      const codeMap: Record<string, string> = {
        "05": "Não autorizado pelo banco. Contate seu banco.",
        "14": "Número do cartão inválido.",
        "78": "Cartão vencido.",
        "57": "Transação não permitida para este cartão.",
        "62": "Cartão restrito a crédito.",
        "63": "Violação de segurança.",
        "99": "Erro interno. Tente novamente.",
      };
      const friendly = codeMap[code] ?? (Payment.ReturnMessage ?? "Pagamento recusado");
      return { success: false, error: `Pagamento recusado: ${friendly} Verifique os dados ou tente outro cartão.` };
    }

    // Status pendente (0=NotFinished, 12=Pending, 20=Scheduled):
    // Pedido mantém status PENDING no banco.
    // O webhook /api/webhooks/cielo atualizará para PAID quando confirmado.
    await prisma.order.update({
      where: { id: order.id },
      data: { cieloPaymentId: Payment.PaymentId },
    });
    return { success: true, type: "paid", orderId: order.id };
  }

  // ── Cielo — PIX ───────────────────────────────────────────────────────────
  if (paymentMethod === "PIX") {
    let pixResp;
    try {
      pixResp = await createPixPayment({
        merchantOrderId: order.id,
        customer: { Name: d.name, Email: d.email },
        amountInReais: total,
      });
    } catch (err) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "CANCELLED" },
      });
      console.error("Cielo PIX error:", err);
      return { success: false, error: "Erro ao gerar PIX. Tente novamente." };
    }

    const { Payment } = pixResp;
    const pixQrCode = Payment.QrCodeString ?? "";

    await prisma.order.update({
      where: { id: order.id },
      data: { cieloPaymentId: Payment.PaymentId, pixQrCode },
    });

    return {
      success: true,
      type: "pix",
      orderId: order.id,
      cieloPaymentId: Payment.PaymentId,
      pixQrCode,
    };
  }

  return { success: true, type: "whatsapp", orderId: order.id };
}

// ─── getOrder ─────────────────────────────────────────────────────────────────

/** Busca pedido pelo ID — suporta usuários autenticados e guests */
export async function getOrder(orderId: string) {
  const { userId } = await getServerAuth();

  const include = {
    items: {
      include: {
        product: { select: { name: true, images: true, slug: true } },
      },
    },
  };

  if (userId) {
    const userProfile = await prisma.userProfile.findUnique({
      where: { clerkId: userId },
      select: { id: true },
    });

    // Authenticated user: only return their own order
    // If no profile exists yet, they can't own any order — return null
    if (!userProfile) return null;

    return prisma.order.findUnique({
      where: { id: orderId, userProfileId: userProfile.id },
      include,
    });
  }

  // Unauthenticated: only allow viewing guest orders (userProfileId is null)
  return prisma.order.findFirst({
    where: { id: orderId, userProfileId: null },
    include,
  });
}

