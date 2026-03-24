"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useGuestCart } from "@/hooks/use-guest-cart";
import { createOrder } from "@/actions/orders";

export function CheckoutClient() {
  const { items, clearCart } = useGuestCart();
  const router = useRouter();
  const [method, setMethod] = useState<"CREDIT_CARD" | "PIX">("CREDIT_CARD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customer, setCustomer] = useState({ name: "", email: "", phone: "", cpf: "", cep: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "" });
  const [card, setCard] = useState({ number: "", holder: "", expiration: "", cvv: "", installments: 1 });

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    try {
      const result = await createOrder({ customer, items, paymentMethod: method, card: method === "CREDIT_CARD" ? card : undefined });
      if (!result.success) { setError(result.error ?? "Erro no pagamento"); return; }
      clearCart();
      if (result.type === "pix") router.push(`/checkout/pix?orderId=${result.orderId}&paymentId=${result.paymentId}&qrCode=${encodeURIComponent(result.qrCode ?? "")}`);
      else router.push(`/checkout/sucesso?orderId=${result.orderId}`);
    } catch { setError("Erro inesperado. Tente novamente."); }
    finally { setLoading(false); }
  }

  if (!items.length) return (
    <div className="pt-24 min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="font-serif text-2xl font-light">Carrinho vazio</p>
      <a href="/" className="cta-link">Continuar comprando</a>
    </div>
  );

  return (
    <div className="pt-24 min-h-screen">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="font-serif text-3xl font-light mb-10">Finalizar Pedido</h1>

        {/* Customer data */}
        <div className="mb-8">
          <p className="label-slc mb-4">Dados Pessoais</p>
          <div className="grid grid-cols-1 gap-3">
            {[
              { key: "name", label: "Nome Completo" },
              { key: "email", label: "E-mail" },
              { key: "phone", label: "Telefone" },
              { key: "cpf", label: "CPF" },
              { key: "cep", label: "CEP" },
              { key: "street", label: "Endereço" },
              { key: "number", label: "Número" },
              { key: "complement", label: "Complemento" },
              { key: "neighborhood", label: "Bairro" },
              { key: "city", label: "Cidade" },
              { key: "state", label: "Estado" },
            ].map(f => (
              <div key={f.key}>
                <label className="label-slc block mb-1">{f.label}</label>
                <input
                  value={(customer as Record<string, string>)[f.key]}
                  onChange={e => setCustomer(c => ({ ...c, [f.key]: e.target.value }))}
                  className="w-full border px-3 py-2.5 text-sm outline-none focus:border-yellow-600 transition-colors"
                  style={{ borderColor: "rgba(13,11,11,0.2)", backgroundColor: "white" }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Payment method */}
        <div className="mb-8">
          <p className="label-slc mb-4">Forma de Pagamento</p>
          <div className="flex gap-3 mb-5">
            {(["CREDIT_CARD", "PIX"] as const).map(m => (
              <button key={m} onClick={() => setMethod(m)}
                className="flex-1 py-3 text-xs tracking-wider border transition-all"
                style={{ borderColor: method === m ? "#B8963E" : "rgba(13,11,11,0.15)", backgroundColor: method === m ? "rgba(184,150,62,0.08)" : "white", color: "#0D0B0B" }}>
                {m === "CREDIT_CARD" ? "Cartão de Crédito" : "PIX"}
              </button>
            ))}
          </div>

          {method === "CREDIT_CARD" && (
            <div className="grid grid-cols-1 gap-3">
              {[
                { key: "number", label: "Número do Cartão" },
                { key: "holder", label: "Nome no Cartão" },
                { key: "expiration", label: "Validade (MM/AAAA)" },
                { key: "cvv", label: "CVV" },
              ].map(f => (
                <div key={f.key}>
                  <label className="label-slc block mb-1">{f.label}</label>
                  <input
                    value={(card as Record<string, string | number>)[f.key] as string}
                    onChange={e => setCard(c => ({ ...c, [f.key]: e.target.value }))}
                    className="w-full border px-3 py-2.5 text-sm outline-none focus:border-yellow-600 transition-colors"
                    style={{ borderColor: "rgba(13,11,11,0.2)", backgroundColor: "white" }}
                  />
                </div>
              ))}
              <div>
                <label className="label-slc block mb-1">Parcelas</label>
                <select value={card.installments} onChange={e => setCard(c => ({ ...c, installments: Number(e.target.value) }))}
                  className="w-full border px-3 py-2.5 text-sm outline-none"
                  style={{ borderColor: "rgba(13,11,11,0.2)", backgroundColor: "white" }}>
                  {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n}>{n}x {n <= 6 ? "sem juros" : "com juros"}</option>)}
                </select>
              </div>
            </div>
          )}

          {method === "PIX" && (
            <div className="p-4 border text-center" style={{ borderColor: "rgba(13,11,11,0.1)", backgroundColor: "rgba(184,150,62,0.05)" }}>
              <p className="label-slc mb-1">Pagamento instantâneo via PIX</p>
              <p className="text-xs" style={{ color: "rgba(13,11,11,0.5)" }}>QR Code válido por 30 minutos após confirmação</p>
            </div>
          )}
        </div>

        {error && <p className="text-sm mb-4 p-3 border" style={{ borderColor: "#6B1A2A", color: "#6B1A2A", backgroundColor: "rgba(107,26,42,0.05)" }}>{error}</p>}

        <button onClick={handleSubmit} disabled={loading}
          className="w-full py-4 text-[10px] tracking-[0.4em] uppercase text-white transition-opacity"
          style={{ backgroundColor: "#0D0B0B", opacity: loading ? 0.6 : 1 }}>
          {loading ? "Processando…" : method === "PIX" ? "Gerar QR Code PIX" : "Confirmar Pagamento"}
        </button>
      </div>
    </div>
  );
}
