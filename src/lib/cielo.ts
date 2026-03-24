import { CIELO_BASE_URL, CIELO_QUERY_URL, SOFT_DESCRIPTOR } from "./constants";

const MERCHANT_ID = process.env.CIELO_MERCHANT_ID!;
const MERCHANT_KEY = process.env.CIELO_MERCHANT_KEY!;

const headers = {
  "Content-Type": "application/json",
  MerchantId: MERCHANT_ID,
  MerchantKey: MERCHANT_KEY,
};

export interface CieloCardPayment {
  orderId: string;
  amount: number; // centavos
  installments: number;
  cardNumber: string;
  holderName: string;
  expirationDate: string; // MM/AAAA
  securityCode: string;
  customerName: string;
  customerEmail: string;
  customerCpf: string;
  softDescriptor?: string;
}

export interface CieloPixPayment {
  orderId: string;
  amount: number; // centavos
  customerName: string;
  customerEmail: string;
  softDescriptor?: string;
}

export async function processCardPayment(data: CieloCardPayment) {
  const body = {
    MerchantOrderId: data.orderId,
    Customer: {
      Name: data.customerName,
      Email: data.customerEmail,
      Identity: data.customerCpf.replace(/\D/g, ""),
      IdentityType: "CPF",
    },
    Payment: {
      Type: "CreditCard",
      Amount: data.amount,
      Installments: data.installments,
      SoftDescriptor: data.softDescriptor ?? SOFT_DESCRIPTOR,
      CreditCard: {
        CardNumber: data.cardNumber.replace(/\s/g, ""),
        Holder: data.holderName,
        ExpirationDate: data.expirationDate,
        SecurityCode: data.securityCode,
        SaveCard: false,
        Brand: detectCardBrand(data.cardNumber),
      },
    },
  };

  const res = await fetch(`${CIELO_BASE_URL}/1/sales`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function processPixPayment(data: CieloPixPayment) {
  const body = {
    MerchantOrderId: data.orderId,
    Customer: { Name: data.customerName, Email: data.customerEmail },
    Payment: {
      Type: "Pix",
      Amount: data.amount,
      SoftDescriptor: data.softDescriptor ?? SOFT_DESCRIPTOR,
    },
  };

  const res = await fetch(`${CIELO_BASE_URL}/1/sales`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  return res.json();
}

export async function queryPayment(paymentId: string) {
  const res = await fetch(
    `${CIELO_QUERY_URL}/1/sales/${paymentId}`,
    { headers }
  );
  return res.json();
}

export function detectCardBrand(number: string): string {
  const n = number.replace(/\s/g, "");
  if (/^4/.test(n)) return "Visa";
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return "Master";
  if (/^3[47]/.test(n)) return "Amex";
  if (/^(636368|438935|504175|451416|636297|5067|4576|4011)/.test(n)) return "Elo";
  if (/^6370/.test(n)) return "Hipercard";
  if (/^30[0-5]|^36|^38/.test(n)) return "Diners";
  return "Visa";
}
