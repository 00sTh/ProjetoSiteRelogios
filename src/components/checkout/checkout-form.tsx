"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Loader2,
  CreditCard,
  QrCode,
  MessageCircle,
  ChevronDown,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { formatPrice, parseImages } from "@/lib/utils";
import { createOrder } from "@/actions/orders";
import { ProductImage } from "@/components/ui/product-image";
import type { CartWithItems } from "@/types";

interface CheckoutFormProps {
  cart: CartWithItems | null;
}

// ─── Styles ────────────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  backgroundColor: "rgba(20,20,20,0.8)",
  border: "1px solid rgba(201,201,201,0.25)",
  color: "#F5F5F5",
  borderRadius: "0.75rem",
  padding: "0.75rem 1rem",
  fontSize: "0.875rem",
  outline: "none",
  width: "100%",
};

const labelStyle: React.CSSProperties = {
  color: "rgba(220,220,220,0.7)",
  fontSize: "0.72rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  display: "block",
  marginBottom: "0.375rem",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function FocusInput(
  props: React.InputHTMLAttributes<HTMLInputElement> & { wrapperClass?: string }
) {
  const [focused, setFocused] = useState(false);
  const { wrapperClass, style: externalStyle, ...rest } = props;
  return (
    <input
      {...rest}
      style={{
        ...inputStyle,
        ...externalStyle,
        borderColor: focused ? "rgba(201,201,201,0.6)" : "rgba(201,201,201,0.25)",
        boxShadow: focused ? "0 0 10px rgba(201,201,201,0.1)" : "none",
      }}
      onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
      onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
    />
  );
}

type PaymentMethod = "CREDIT_CARD" | "PIX" | "WHATSAPP";
type CreditGateway = "CIELO" | "REDE";

// ─── Card validators ──────────────────────────────────────────────────────────

function detectCardBrandClient(n: string): string | null {
  if (/^4/.test(n)) return "Visa";
  if (/^(5[1-5]|2(2[2-9][1-9]|[3-6]\d{2}|7[01]\d|720))/.test(n)) return "Mastercard";
  if (/^3[47]/.test(n)) return "Amex";
  if (/^(636368|438935|504175|451416|636297|5067|4576|4011|506699)/.test(n)) return "Elo";
  if (/^6062/.test(n)) return "Hipercard";
  if (/^3(0[0-5]|[68])/.test(n)) return "Diners";
  return null;
}

function luhnCheck(n: string): boolean {
  let sum = 0;
  let alt = false;
  for (let i = n.length - 1; i >= 0; i--) {
    let d = parseInt(n[i], 10);
    if (alt) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    alt = !alt;
  }
  return sum % 10 === 0;
}

// ─── Card formatters ──────────────────────────────────────────────────────────

function formatCardNumber(val: string) {
  return val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(val: string) {
  const digits = val.replace(/\D/g, "").slice(0, 6);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function formatCpf(val: string) {
  const digits = val.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function CheckoutForm({ cart }: CheckoutFormProps) {
  const router = useRouter();
  const { user } = useUser();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>("PIX");
  const [creditGateway, setCreditGateway] = useState<CreditGateway>("CIELO");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cpf, setCpf] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const cartLines = (cart?.items ?? []).map((i) => ({
    name: i.product.name,
    quantity: i.quantity,
    price: Number(i.product.price),
    images: Array.isArray(i.product.images) ? i.product.images as string[] : [],
  }));

  const total = cartLines.reduce((acc, i) => acc + i.price * i.quantity, 0);

  // Pre-fill from Clerk profile
  const defaultName = user?.fullName ?? "";
  const defaultEmail = user?.primaryEmailAddress?.emailAddress ?? "";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (cartLines.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    const formData = new FormData(e.currentTarget);

    if (method === "CREDIT_CARD") {
      formData.set("cardNumber", cardNumber.replace(/\s/g, ""));
      formData.set("cardExpiry", cardExpiry);
      formData.set("creditGateway", creditGateway);
    }

    formData.set("cpf", cpf.replace(/\D/g, ""));

    if (method === "CREDIT_CARD") {
      const rawCard = cardNumber.replace(/\s/g, "");

      if (rawCard.length < 13 || !luhnCheck(rawCard)) {
        setError("Número do cartão inválido.");
        return;
      }

      const detectedBrand = detectCardBrandClient(rawCard);
      if (!detectedBrand) {
        setError("Bandeira do cartão não reconhecida. Aceitamos Visa, Mastercard, Amex, Elo, Hipercard e Diners.");
        return;
      }

      const parts = cardExpiry.split("/");
      const mm = parseInt(parts[0] ?? "0", 10);
      const yyyy = parseInt(parts[1] ?? "0", 10);
      const now = new Date();
      if (
        !mm || !yyyy || mm < 1 || mm > 12 ||
        yyyy < now.getFullYear() ||
        (yyyy === now.getFullYear() && mm < now.getMonth() + 1)
      ) {
        setError("Data de validade inválida ou cartão vencido.");
        return;
      }

      const cardCvvValue = (formData.get("cardCvv") as string) ?? "";
      const expectedCvvLen = detectedBrand === "Amex" ? 4 : 3;
      if (cardCvvValue.length !== expectedCvvLen) {
        setError(`CVV deve ter ${expectedCvvLen} dígitos para ${detectedBrand}.`);
        return;
      }
    }

    startTransition(async () => {
      const result = await createOrder(formData);

      if (!result.success) {
        setError(result.error);
        return;
      }

      if (result.type === "paid") {
        router.push(`/checkout/sucesso?orderId=${result.orderId}&paid=1`);
      } else if (result.type === "pix") {
        const params = new URLSearchParams({
          orderId: result.orderId,
          paymentId: result.cieloPaymentId,
          qr: result.pixQrCode,
        });
        router.push(`/checkout/pix?${params.toString()}`);
      } else {
        router.push(`/checkout/sucesso?orderId=${result.orderId}`);
      }
    });
  }

  const methodButton = (
    m: PaymentMethod,
    Icon: React.ElementType,
    label: string,
    desc: string
  ) => (
    <button
      type="button"
      onClick={() => setMethod(m)}
      className="flex items-start gap-3 rounded-xl p-4 text-left transition-all w-full"
      style={{
        border: method === m ? "2px solid #C9C9C9" : "1px solid rgba(201,201,201,0.2)",
        backgroundColor: method === m ? "rgba(201,201,201,0.08)" : "rgba(20,20,20,0.8)",
      }}
    >
      <div
        className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
        style={{ backgroundColor: method === m ? "rgba(201,201,201,0.15)" : "rgba(201,201,201,0.07)" }}
      >
        <Icon className="h-4.5 w-4.5" style={{ color: "#C9C9C9" }} />
      </div>
      <div>
        <p className="font-semibold text-sm" style={{ color: "#F5F5F5" }}>{label}</p>
        <p className="text-xs mt-0.5" style={{ color: "rgba(200,187,168,0.6)" }}>{desc}</p>
      </div>
      {method === m && (
        <div
          className="ml-auto h-4 w-4 rounded-full shrink-0 mt-1 flex items-center justify-center"
          style={{ backgroundColor: "#C9C9C9" }}
        >
          <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "#0A0A0A" }} />
        </div>
      )}
    </button>
  );

  // Empty cart
  if (cartLines.length === 0) {
    return (
      <div
        className="p-10 text-center space-y-4"
        style={{ backgroundColor: "#111111" }}
      >
        <ShoppingCart className="h-12 w-12 mx-auto" style={{ color: "rgba(201,201,201,0.3)" }} />
        <p className="font-serif text-xl" style={{ color: "#F5F5F5" }}>
          Your Cart is Empty
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold"
          style={{ backgroundColor: "#C9C9C9", color: "#0A0A0A" }}
        >
          Explore Products <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="space-y-6 p-6"
      style={{ backgroundColor: "#111111" }}
    >
      {error && (
        <div
          className="rounded-xl px-4 py-3 text-sm"
          style={{
            backgroundColor: "rgba(239,68,68,0.1)",
            color: "#F87171",
            border: "1px solid rgba(239,68,68,0.2)",
          }}
        >
          {error}
        </div>
      )}

      {/* Order summary */}
      <div
        className="rounded-2xl p-5 space-y-3"
        style={{
          backgroundColor: "rgba(10,10,10,0.5)",
          border: "1px solid rgba(201,201,201,0.15)",
        }}
      >
        <h3 className="font-serif font-semibold" style={{ color: "#F5F5F5" }}>
          Order Summary
        </h3>
        {cartLines.map((item, idx) => {
          const imgs = parseImages(item.images as unknown as string);
          const img = imgs[0] ?? "/placeholder.svg";
          return (
            <div key={idx} className="flex items-center gap-3">
              <div
                className="relative h-10 w-10 shrink-0 rounded-lg overflow-hidden"
                style={{ backgroundColor: "#1A1A1A" }}
              >
                <ProductImage src={img} alt={item.name} fill className="object-cover" />
              </div>
              <span className="flex-1 text-sm" style={{ color: "#9A9A9A" }}>
                {item.name} × {item.quantity}
              </span>
              <span className="text-sm" style={{ color: "#F5F5F5" }}>
                {formatPrice(item.price * item.quantity)}
              </span>
            </div>
          );
        })}
        <div
          className="pt-3 flex justify-between font-bold"
          style={{ borderTop: "1px solid rgba(201,201,201,0.15)" }}
        >
          <span style={{ color: "#F5F5F5" }}>Total</span>
          <span style={{ color: "#C9C9C9" }}>{formatPrice(total)}</span>
        </div>
      </div>

      {/* Personal data */}
      <div className="space-y-4">
        <h3 className="label-luxury" style={{ color: "#C9C9C9" }}>Contact Information</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Full Name *" className="sm:col-span-2">
            <FocusInput name="name" placeholder="John Smith" required defaultValue={defaultName} />
          </Field>
          <Field label="Email *">
            <FocusInput name="email" type="email" placeholder="john@email.com" required defaultValue={defaultEmail} />
          </Field>
          <Field label="CPF / Tax ID *">
            <FocusInput
              name="cpfDisplay"
              value={cpf}
              onChange={(e) => setCpf(formatCpf(e.target.value))}
              placeholder="000.000.000-00"
              inputMode="numeric"
              required
              maxLength={14}
            />
          </Field>
          <Field label="Phone" className="sm:col-span-2">
            <FocusInput name="phone" type="tel" placeholder="(11) 99999-9999" />
          </Field>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-4">
        <h3 className="label-luxury" style={{ color: "#C9C9C9" }}>Shipping Address</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="ZIP Code *" className="sm:col-span-2">
            <FocusInput name="zip" placeholder="01310-100" required maxLength={9} />
          </Field>
          <Field label="Street Address *" className="sm:col-span-2">
            <FocusInput name="street" placeholder="Main Street" required />
          </Field>
          <Field label="Number *">
            <FocusInput name="number" placeholder="42" required />
          </Field>
          <Field label="Complement / Apt">
            <FocusInput name="complement" placeholder="Apto 3B" />
          </Field>
          <Field label="City *">
            <FocusInput name="city" placeholder="City Name" required />
          </Field>
          <Field label="State *">
            <FocusInput name="state" placeholder="ST" maxLength={2} required />
          </Field>
        </div>
      </div>

      {/* Payment method */}
      <input type="hidden" name="paymentMethod" value={method} />
      <div className="space-y-3">
        <h3 className="label-luxury" style={{ color: "#C9C9C9" }}>Payment Method</h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {methodButton("PIX", QrCode, "PIX", "Instant approval & discount")}
          {methodButton("CREDIT_CARD", CreditCard, "Credit Card", "Up to 12x interest-free")}
          {methodButton("WHATSAPP", MessageCircle, "WhatsApp", "Coordinate with our team")}
        </div>
      </div>

      {/* Credit card fields */}
      {method === "CREDIT_CARD" && (
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{
            backgroundColor: "rgba(10,10,10,0.5)",
            border: "1px solid rgba(201,201,201,0.2)",
          }}
        >
          <h3 className="label-luxury" style={{ color: "#C9C9C9" }}>Card Details</h3>

          {/* Gateway selector */}
          <div>
            <label style={labelStyle}>Payment Platform</label>
            <div className="flex gap-2">
              {(["CIELO", "REDE"] as CreditGateway[]).map((gw) => (
                <button
                  key={gw}
                  type="button"
                  onClick={() => setCreditGateway(gw)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    border: creditGateway === gw ? "2px solid #C9C9C9" : "1px solid rgba(201,201,201,0.2)",
                    backgroundColor: creditGateway === gw ? "rgba(201,201,201,0.12)" : "rgba(20,20,20,0.8)",
                    color: creditGateway === gw ? "#C9C9C9" : "rgba(200,187,168,0.6)",
                  }}
                >
                  {creditGateway === gw && (
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: "#C9C9C9" }}
                    />
                  )}
                  {gw === "CIELO" ? "Cielo" : "Rede"}
                </button>
              ))}
            </div>
          </div>

          <Field label="Card Number *">
            <FocusInput
              name="cardNumberDisplay"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="0000 0000 0000 0000"
              inputMode="numeric"
              required={method === "CREDIT_CARD"}
              maxLength={19}
            />
          </Field>

          <Field label="Cardholder Name *">
            <FocusInput
              name="cardHolder"
              placeholder="JOHN SMITH"
              style={{ textTransform: "uppercase" }}
              required={method === "CREDIT_CARD"}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Expiry Date *">
              <FocusInput
                name="cardExpiryDisplay"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YYYY"
                inputMode="numeric"
                required={method === "CREDIT_CARD"}
                maxLength={7}
              />
            </Field>
            <Field label="CVV *">
              <FocusInput
                name="cardCvv"
                placeholder="123"
                inputMode="numeric"
                maxLength={4}
                required={method === "CREDIT_CARD"}
              />
            </Field>
          </div>

          <Field label="Installments">
            <div className="relative">
              <select
                name="installments"
                defaultValue="1"
                style={{ ...inputStyle, cursor: "pointer", appearance: "none" }}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
                  <option key={n} value={n}>
                    {n === 1
                      ? `1× de ${formatPrice(total)} (à vista)`
                      : `${n}× de ${formatPrice(total / n)}`}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none"
                style={{ color: "rgba(201,201,201,0.7)" }}
              />
            </div>
          </Field>

          <p className="text-xs" style={{ color: "rgba(200,187,168,0.5)" }}>
            🔒 Your card data is sent directly to {creditGateway === "REDE" ? "Rede" : "Cielo"} via secure connection (TLS 1.3) and is never stored on our servers.
          </p>
        </div>
      )}

      {/* PIX info */}
      {method === "PIX" && (
        <div
          className="rounded-2xl p-5 flex items-start gap-3"
          style={{
            backgroundColor: "rgba(10,10,10,0.5)",
            border: "1px solid rgba(201,201,201,0.2)",
          }}
        >
          <QrCode className="h-8 w-8 shrink-0" style={{ color: "#C9C9C9" }} />
          <div>
            <p className="font-semibold text-sm mb-1" style={{ color: "#F5F5F5" }}>
              Instant PIX Payment
            </p>
            <p className="text-xs" style={{ color: "rgba(200,187,168,0.65)" }}>
              After confirming, you will receive a PIX QR Code. Payment is processed in seconds and your order is automatically confirmed.
            </p>
          </div>
        </div>
      )}

      {/* WhatsApp info */}
      {method === "WHATSAPP" && (
        <div
          className="rounded-2xl p-5 flex items-start gap-3"
          style={{
            backgroundColor: "rgba(10,10,10,0.5)",
            border: "1px solid rgba(201,201,201,0.2)",
          }}
        >
          <MessageCircle className="h-8 w-8 shrink-0" style={{ color: "#25D366" }} />
          <div>
            <p className="font-semibold text-sm mb-1" style={{ color: "#F5F5F5" }}>
              Complete via WhatsApp
            </p>
            <p className="text-xs" style={{ color: "rgba(200,187,168,0.65)" }}>
              Your order will be registered and you will be redirected to WhatsApp to arrange payment with our team.
            </p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-2 w-full py-4 rounded-full text-sm font-semibold tracking-widest uppercase transition-all disabled:opacity-60 hover:shadow-[0_0_25px_rgba(201,201,201,0.4)]"
        style={{ backgroundColor: "#C9C9C9", color: "#0A0A0A" }}
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending
          ? "Processing..."
          : method === "CREDIT_CARD"
          ? `Pay ${formatPrice(total)}`
          : method === "PIX"
          ? `Generate PIX QR · ${formatPrice(total)}`
          : `Confirm Order · ${formatPrice(total)}`}
      </button>
    </form>
  );
}
