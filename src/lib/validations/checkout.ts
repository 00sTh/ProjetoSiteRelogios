import { z } from "zod";

/**
 * Zod Validation Schemas — Checkout
 *
 * Security considerations:
 * - All string inputs are trimmed and HTML-stripped (XSS defense-in-depth)
 * - CEP is validated against Brazilian postal code format
 * - Cart items enforce positive quantities and valid price ranges
 * - No raw card data is accepted — payment is delegated to a payment gateway
 *   (Stripe, PagSeguro, etc.) which handles PCI-DSS compliance. We only
 *   receive a payment token/ID from the gateway's client-side SDK.
 */

function stripHtmlTags(value: string): string {
  return value.replace(/<[^>]*>/g, "");
}

// --- Address Schema (Brazilian format) ---

const addressSchema = z.object({
  street: z
    .string()
    .trim()
    .min(3, "Logradouro é obrigatório")
    .max(200, "Logradouro deve ter no máximo 200 caracteres")
    .transform(stripHtmlTags),
  number: z
    .string()
    .trim()
    .min(1, "Número é obrigatório")
    .max(10, "Número deve ter no máximo 10 caracteres")
    .transform(stripHtmlTags),
  complement: z
    .string()
    .trim()
    .max(100, "Complemento deve ter no máximo 100 caracteres")
    .transform(stripHtmlTags)
    .optional(),
  neighborhood: z
    .string()
    .trim()
    .min(2, "Bairro é obrigatório")
    .max(100, "Bairro deve ter no máximo 100 caracteres")
    .transform(stripHtmlTags),
  city: z
    .string()
    .trim()
    .min(2, "Cidade é obrigatória")
    .max(100, "Cidade deve ter no máximo 100 caracteres")
    .transform(stripHtmlTags),
  state: z
    .string()
    .trim()
    .length(2, "Estado deve ter 2 caracteres (sigla)")
    .toUpperCase()
    .transform(stripHtmlTags),
  cep: z
    .string()
    .trim()
    .regex(/^\d{5}-?\d{3}$/, "CEP deve estar no formato XXXXX-XXX"),
});

// --- Cart Item Schema ---

const cartItemSchema = z.object({
  productId: z
    .string()
    .trim()
    .min(1, "ID do produto é obrigatório")
    .uuid("ID do produto deve ser um UUID válido"),
  quantity: z
    .number()
    .int("Quantidade deve ser um número inteiro")
    .min(1, "Quantidade mínima é 1")
    .max(10, "Quantidade máxima é 10 por item"),
  // Price is validated server-side against the database.
  // This field is here only for integrity checking — the canonical
  // price always comes from the database, never from the client.
  unitPriceCents: z
    .number()
    .int("Preço deve ser em centavos (inteiro)")
    .min(100, "Preço mínimo é R$ 1,00")
    .max(100_000_000, "Preço máximo é R$ 1.000.000,00"),
});

// --- Checkout Schema ---

export const checkoutSchema = z.object({
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  useSameAddressForBilling: z.boolean().default(true),

  items: z
    .array(cartItemSchema)
    .min(1, "O carrinho não pode estar vazio")
    .max(20, "Máximo de 20 itens por pedido"),

  // Payment token from the payment gateway's client-side SDK.
  // We NEVER handle raw card numbers — PCI-DSS compliance is
  // delegated to the gateway (Stripe, PagSeguro, etc.).
  paymentToken: z
    .string()
    .trim()
    .min(1, "Token de pagamento é obrigatório")
    .max(500, "Token de pagamento inválido"),

  // Coupon code (optional)
  couponCode: z
    .string()
    .trim()
    .max(50, "Código do cupom deve ter no máximo 50 caracteres")
    .regex(
      /^[A-Za-z0-9_-]*$/,
      "Código do cupom contém caracteres inválidos"
    )
    .transform(stripHtmlTags)
    .optional(),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type CartItemInput = z.infer<typeof cartItemSchema>;
