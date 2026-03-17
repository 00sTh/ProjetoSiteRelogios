"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  Loader2,
  MessageCircle,
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
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  const [focused, setFocused] = useState(false);
  const { style: externalStyle, ...rest } = props;
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
  const [cpf, setCpf] = useState("");

  const cartLines = (cart?.items ?? []).map((i) => ({
    name: i.product.name,
    quantity: i.quantity,
    price: Number(i.product.price),
    images: Array.isArray(i.product.images) ? i.product.images as string[] : [],
  }));

  const total = cartLines.reduce((acc, i) => acc + i.price * i.quantity, 0);

  const defaultName = user?.fullName ?? "";
  const defaultEmail = user?.primaryEmailAddress?.emailAddress ?? "";

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (cartLines.length === 0) {
      setError("Seu carrinho está vazio.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("cpf", cpf.replace(/\D/g, ""));
    formData.set("paymentMethod", "WHATSAPP");

    startTransition(async () => {
      const result = await createOrder(formData);

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push(`/checkout/sucesso?orderId=${result.orderId}`);
    });
  }

  // Empty cart
  if (cartLines.length === 0) {
    return (
      <div
        className="p-10 text-center space-y-4"
        style={{ backgroundColor: "#111111" }}
      >
        <ShoppingCart className="h-12 w-12 mx-auto" style={{ color: "rgba(201,201,201,0.3)" }} />
        <p className="font-serif text-xl" style={{ color: "#F5F5F5" }}>
          Seu Carrinho está Vazio
        </p>
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold"
          style={{ backgroundColor: "#C9C9C9", color: "#0A0A0A" }}
        >
          Ver Produtos <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <form
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
          Resumo do Pedido
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
        <h3 className="label-luxury" style={{ color: "#C9C9C9" }}>Informações de Contato</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Nome Completo *" className="sm:col-span-2">
            <FocusInput name="name" placeholder="João Silva" required defaultValue={defaultName} />
          </Field>
          <Field label="Email *">
            <FocusInput name="email" type="email" placeholder="joao@email.com" required defaultValue={defaultEmail} />
          </Field>
          <Field label="CPF *">
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
          <Field label="Telefone" className="sm:col-span-2">
            <FocusInput name="phone" type="tel" placeholder="(11) 99999-9999" />
          </Field>
        </div>
      </div>

      {/* Address */}
      <div className="space-y-4">
        <h3 className="label-luxury" style={{ color: "#C9C9C9" }}>Endereço de Entrega</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="CEP *" className="sm:col-span-2">
            <FocusInput name="zip" placeholder="01310-100" required maxLength={9} />
          </Field>
          <Field label="Endereço *" className="sm:col-span-2">
            <FocusInput name="street" placeholder="Rua das Flores" required />
          </Field>
          <Field label="Número *">
            <FocusInput name="number" placeholder="42" required />
          </Field>
          <Field label="Complemento">
            <FocusInput name="complement" placeholder="Apto 3B" />
          </Field>
          <Field label="Cidade *">
            <FocusInput name="city" placeholder="São Paulo" required />
          </Field>
          <Field label="Estado *">
            <FocusInput name="state" placeholder="SP" maxLength={2} required />
          </Field>
        </div>
      </div>

      {/* Payment — WhatsApp only */}
      <div
        className="rounded-2xl p-5 flex items-start gap-3"
        style={{
          backgroundColor: "rgba(10,10,10,0.5)",
          border: "1px solid rgba(37,211,102,0.25)",
        }}
      >
        <MessageCircle className="h-8 w-8 shrink-0" style={{ color: "#25D366" }} />
        <div>
          <p className="font-semibold text-sm mb-1" style={{ color: "#F5F5F5" }}>
            Pagamento via WhatsApp
          </p>
          <p className="text-xs" style={{ color: "rgba(200,187,168,0.65)" }}>
            Após confirmar seu pedido, nossa equipe entrará em contato via WhatsApp para combinar o pagamento e os detalhes de envio.
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center justify-center gap-2 w-full py-4 rounded-full text-sm font-semibold tracking-widest uppercase transition-all disabled:opacity-60 hover:shadow-[0_0_25px_rgba(201,201,201,0.4)]"
        style={{ backgroundColor: "#C9C9C9", color: "#0A0A0A" }}
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        {isPending ? "Processando..." : `Confirmar Pedido · ${formatPrice(total)}`}
      </button>
    </form>
  );
}
