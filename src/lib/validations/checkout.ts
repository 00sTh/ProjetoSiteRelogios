import { z } from "zod";

/**
 * Schema Zod para o fluxo de checkout.
 *
 * Decisões de segurança:
 * - CPF validado com algoritmo oficial (dígitos verificadores):
 *   previne submissão de CPFs forjados e ataques de enumeração.
 * - CEP com regex estrita: previne injection via campo de endereço.
 * - Nenhum dado de cartão é coletado diretamente — use gateway (Stripe/PagSeguro)
 *   com tokenização client-side. Isso mantém PCI DSS compliance.
 * - Todos os campos com .max() contra payloads de DoS.
 * - Transform com sanitização contra XSS em campos de texto livre.
 */

function sanitizeText(val: string): string {
  return val.replace(/[<>"']/g, "");
}

/** Valida CPF com algoritmo oficial de dígitos verificadores */
function isValidCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length !== 11) return false;

  // Rejeita CPFs com todos os dígitos iguais (ex: 111.111.111-11)
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(9))) return false;

  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(10))) return false;

  return true;
}

const shippingAddressSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Nome completo é obrigatório")
    .max(200, "Nome muito longo")
    .transform(sanitizeText),

  street: z
    .string()
    .trim()
    .min(3, "Endereço é obrigatório")
    .max(300, "Endereço muito longo")
    .transform(sanitizeText),

  number: z
    .string()
    .trim()
    .min(1, "Número é obrigatório")
    .max(20, "Número muito longo"),

  complement: z
    .string()
    .trim()
    .max(100, "Complemento muito longo")
    .transform(sanitizeText)
    .optional()
    .default(""),

  neighborhood: z
    .string()
    .trim()
    .min(2, "Bairro é obrigatório")
    .max(100, "Bairro muito longo")
    .transform(sanitizeText),

  city: z
    .string()
    .trim()
    .min(2, "Cidade é obrigatória")
    .max(100, "Cidade muito longa")
    .transform(sanitizeText),

  state: z
    .string()
    .trim()
    .length(2, "UF deve ter 2 caracteres")
    .toUpperCase(),

  zipCode: z
    .string()
    .trim()
    .regex(/^\d{5}-?\d{3}$/, "CEP inválido (formato: 00000-000)"),

  cpf: z
    .string()
    .trim()
    .regex(/^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/, "CPF em formato inválido")
    .refine(isValidCPF, { message: "CPF inválido" }),

  phone: z
    .string()
    .trim()
    .regex(
      /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/,
      "Telefone inválido (formato: (11) 99999-9999)"
    ),
});

const checkoutItemSchema = z.object({
  productId: z.string().uuid("ID de produto inválido"),
  quantity: z
    .number()
    .int("Quantidade deve ser inteira")
    .min(1, "Quantidade mínima é 1")
    .max(10, "Quantidade máxima por item é 10"),
});

export const checkoutSchema = z.object({
  items: z
    .array(checkoutItemSchema)
    .min(1, "Carrinho não pode estar vazio")
    .max(20, "Máximo de 20 itens por pedido"),

  shippingAddress: shippingAddressSchema,

  /** Método de pagamento — dados do cartão ficam no gateway */
  paymentMethod: z.enum(["credit_card", "pix", "boleto"], {
    errorMap: () => ({ message: "Método de pagamento inválido" }),
  }),

  /** Token gerado pelo gateway de pagamento (Stripe, PagSeguro, etc.) */
  paymentToken: z
    .string()
    .min(1, "Token de pagamento é obrigatório")
    .max(500, "Token inválido"),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ShippingAddress = z.infer<typeof shippingAddressSchema>;
