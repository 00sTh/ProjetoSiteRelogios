/**
 * src/lib/rede.ts — Cliente da Rede eRede API v1
 *
 * Credenciais via env vars — NUNCA hardcodar no código.
 * REDE_PV e REDE_KEY em .env.local / Vercel Environment Variables
 */

const REDE_PV = process.env.REDE_PV ?? "";
const REDE_KEY = process.env.REDE_KEY ?? "";
const BASE_URL = "https://api.userede.com.br/erede/v1";

// ─── Auth ──────────────────────────────────────────────────────────────────────

function authHeader(): string {
  const credentials = Buffer.from(`${REDE_PV}:${REDE_KEY}`).toString("base64");
  return `Basic ${credentials}`;
}

function headers() {
  return {
    "Content-Type": "application/json",
    Authorization: authHeader(),
  };
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface RedePaymentResult {
  tid: string;
  nsu: string;
  authorizationCode?: string;
  returnCode: string;
  returnMessage: string;
  amount: number;
  installments: number;
  status: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Converte reais (float) para centavos (int) */
export function toCentavosRede(priceInReais: number): number {
  return Math.round(priceInReais * 100);
}

/** returnCode "00" = aprovado */
export function isRedeApproved(result: RedePaymentResult): boolean {
  return result.returnCode === "00";
}

/** Qualquer returnCode != "00" = negado */
export function isRedeDenied(result: RedePaymentResult): boolean {
  return result.returnCode !== "00";
}

const REDE_CODE_MAP: Record<string, string> = {
  "01": "Transação não autorizada. Contate seu banco.",
  "04": "Cartão bloqueado. Contate seu banco.",
  "05": "Não autorizado pelo banco. Contate seu banco.",
  "12": "Transação inválida.",
  "14": "Número do cartão inválido.",
  "19": "Tente novamente.",
  "41": "Cartão perdido. Contate seu banco.",
  "43": "Cartão roubado. Contate seu banco.",
  "51": "Saldo insuficiente.",
  "54": "Cartão vencido.",
  "57": "Transação não permitida para este cartão.",
  "58": "Transação não permitida.",
  "78": "Cartão bloqueado.",
  "99": "Erro interno. Tente novamente.",
};

export function getRedeFriendlyError(
  returnCode: string,
  returnMessage: string
): string {
  return REDE_CODE_MAP[returnCode] ?? returnMessage ?? "Pagamento recusado pela Rede.";
}

// ─── Criação de pagamento ─────────────────────────────────────────────────────

/**
 * Cria pagamento com cartão de crédito via Rede eRede (captura imediata).
 * expirationMonth: número inteiro 1-12
 * expirationYear: número inteiro ex: 2028
 */
export async function createRedeCreditPayment({
  reference,
  amountInReais,
  installments,
  cardNumber,
  cardholderName,
  expirationMonth,
  expirationYear,
  securityCode,
  softDescriptor = "AMERICANAS",
}: {
  reference: string;
  amountInReais: number;
  installments: number;
  cardNumber: string;
  cardholderName: string;
  expirationMonth: number;
  expirationYear: number;
  securityCode: string;
  softDescriptor?: string;
}): Promise<RedePaymentResult> {
  // reference: máx 16 chars (Rede rejeita UUID completo de 36 chars)
  const ref = reference.replace(/-/g, "").slice(0, 16);

  const resp = await fetch(`${BASE_URL}/transactions`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      capture: true,
      kind: "credit",
      reference: ref,
      amount: toCentavosRede(amountInReais),
      installments,
      cardholderName: cardholderName.toUpperCase().slice(0, 30),
      cardNumber: cardNumber.replace(/\s/g, ""),
      expirationMonth,
      expirationYear,
      securityCode,
      softDescriptor: softDescriptor.slice(0, 18),
    }),
    signal: AbortSignal.timeout(30_000),
  });

  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new Error(`Rede API ${resp.status}: ${body}`);
  }

  return resp.json() as Promise<RedePaymentResult>;
}
