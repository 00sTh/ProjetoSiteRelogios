/**
 * src/lib/cielo.ts — Cliente da Cielo eCommerce API 3.0
 *
 * Credenciais via env vars — NUNCA hardcodar no código.
 * CIELO_MERCHANT_ID e CIELO_MERCHANT_KEY em .env.local
 */

const CIELO_MERCHANT_ID = process.env.CIELO_MERCHANT_ID ?? "";
const CIELO_MERCHANT_KEY = process.env.CIELO_MERCHANT_KEY ?? "";
const CIELO_ENV = process.env.CIELO_ENV ?? "production";

const BASE_URL =
  CIELO_ENV === "sandbox"
    ? "https://apisandbox.cieloecommerce.cielo.com.br"
    : "https://api.cieloecommerce.cielo.com.br";

const QUERY_URL =
  CIELO_ENV === "sandbox"
    ? "https://apiquerysandbox.cieloecommerce.cielo.com.br"
    : "https://apiquery.cieloecommerce.cielo.com.br";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export type CieloCardBrand =
  | "Visa"
  | "Master"
  | "Amex"
  | "Elo"
  | "Hipercard"
  | "Diners";

/** Status do pagamento Cielo */
export const CIELO_STATUS: Record<number, string> = {
  0: "NotFinished",
  1: "Authorized",
  2: "PaymentConfirmed",
  3: "Denied",
  10: "Voided",
  11: "Refunded",
  12: "Pending",
  13: "Aborted",
  20: "Scheduled",
};

export interface CieloCustomer {
  Name: string;
  Email?: string;
  Phone?: string;
}

export interface CieloCreditCard {
  CardNumber: string;
  Holder: string;
  /** "MM/YYYY" */
  ExpirationDate: string;
  SecurityCode: string;
  Brand: CieloCardBrand;
}

export interface CieloPaymentResult {
  PaymentId: string;
  Type: string;
  Status: number;
  StatusDescription?: string;
  Amount: number;
  ReturnCode?: string;
  ReturnMessage?: string;
  AuthorizationCode?: string;
  // PIX
  QrCodeString?: string;
  QrCodeBase64Image?: string;
}

export interface CieloSaleResponse {
  MerchantOrderId: string;
  Customer: { Name: string };
  Payment: CieloPaymentResult;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function headers(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    MerchantId: CIELO_MERCHANT_ID,
    MerchantKey: CIELO_MERCHANT_KEY,
    RequestId: crypto.randomUUID(),
  };
}

/** Converte reais (float) para centavos (int) */
export function toCentavos(priceInReais: number): number {
  return Math.round(priceInReais * 100);
}

/** Detecta bandeira pelo número do cartão. Retorna null se não reconhecida. */
export function detectCardBrand(rawNumber: string): CieloCardBrand | null {
  const n = rawNumber.replace(/\D/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^(5[1-5]|2(2[2-9][1-9]|[3-6]\d{2}|7[01]\d|720))/.test(n)) return "Master";
  if (/^3[47]/.test(n)) return "Amex";
  if (/^(636368|438935|504175|451416|636297|5067|4576|4011|506699)/.test(n)) return "Elo";
  if (/^6062/.test(n)) return "Hipercard";
  if (/^3(0[0-5]|[68])/.test(n)) return "Diners";
  return null; // bandeira não reconhecida
}

// ─── Criação de pagamentos ────────────────────────────────────────────────────

/** Cria pagamento com cartão de crédito e captura imediata */
export async function createCreditCardPayment({
  merchantOrderId,
  customer,
  amountInReais,
  installments,
  card,
  softDescriptor = "CIELO",
}: {
  merchantOrderId: string;
  customer: CieloCustomer;
  amountInReais: number;
  installments: number;
  card: CieloCreditCard;
  softDescriptor?: string;
}): Promise<CieloSaleResponse> {
  const resp = await fetch(`${BASE_URL}/1/sales`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      MerchantOrderId: merchantOrderId,
      Customer: customer,
      Payment: {
        Type: "CreditCard",
        Amount: toCentavos(amountInReais),
        Installments: installments,
        SoftDescriptor: softDescriptor.slice(0, 13),
        Capture: true,
        CreditCard: {
          CardNumber: card.CardNumber.replace(/\s/g, ""),
          Holder: card.Holder.toUpperCase().slice(0, 25),
          ExpirationDate: card.ExpirationDate,
          SecurityCode: card.SecurityCode,
          Brand: card.Brand,
        },
      },
    }),
    // Timeout de 30s
    signal: AbortSignal.timeout(30_000),
  });

  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(`Cielo API ${resp.status}: ${body}`);
  }

  return resp.json() as Promise<CieloSaleResponse>;
}

/** Cria pagamento PIX — retorna QR code e copia-e-cola */
export async function createPixPayment({
  merchantOrderId,
  customer,
  amountInReais,
}: {
  merchantOrderId: string;
  customer: CieloCustomer;
  amountInReais: number;
}): Promise<CieloSaleResponse> {
  const resp = await fetch(`${BASE_URL}/1/sales`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      MerchantOrderId: merchantOrderId,
      Customer: customer,
      Payment: {
        Type: "Pix",
        Amount: toCentavos(amountInReais),
      },
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(`Cielo PIX ${resp.status}: ${body}`);
  }

  return resp.json() as Promise<CieloSaleResponse>;
}

/** Consulta o status atual de um pagamento pelo PaymentId */
export async function getPaymentStatus(
  paymentId: string
): Promise<CieloPaymentResult | null> {
  try {
    const resp = await fetch(`${QUERY_URL}/1/sales/${paymentId}`, {
      headers: headers(),
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!resp.ok) return null;
    const data = (await resp.json()) as { Payment?: CieloPaymentResult };
    return data.Payment ?? null;
  } catch {
    return null;
  }
}

/** Verifica se o status Cielo indica pagamento confirmado */
export function isPaymentConfirmed(status: number): boolean {
  return status === 1 || status === 2; // Authorized ou PaymentConfirmed
}

/** Verifica se o pagamento foi negado/abortado */
export function isPaymentDenied(status: number): boolean {
  return status === 3 || status === 13;
}

/** Verifica se o pagamento está pendente (PIX aguardando) */
export function isPaymentPending(status: number): boolean {
  return status === 0 || status === 12;
}
