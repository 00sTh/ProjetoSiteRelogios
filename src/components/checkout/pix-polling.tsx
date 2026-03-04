"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Clock, Copy, Check, RefreshCw, AlertCircle } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import QRCode from "react-qr-code";

interface Props {
  orderId: string;
  paymentId: string;
  pixQrCode: string;
}

type Status = "pending" | "paid" | "error" | "expired";

export function PixPolling({ orderId, paymentId, pixQrCode }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>("pending");
  const [copied, setCopied] = useState(false);
  const [elapsed, setElapsed] = useState(0);


  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch(`/api/check-payment?paymentId=${encodeURIComponent(paymentId)}&orderId=${encodeURIComponent(orderId)}`);
      if (!res.ok) return;
      const data = (await res.json()) as { paid: boolean; denied: boolean; expired?: boolean };
      if (data.paid) {
        setStatus("paid");
        setTimeout(() => {
          router.push(`/checkout/sucesso?orderId=${orderId}&paid=1`);
        }, 2000);
      } else if (data.expired) {
        setStatus("expired");
      } else if (data.denied) {
        setStatus("error");
      }
    } catch {
      // ignore network errors during polling
    }
  }, [paymentId, orderId, router]);

  useEffect(() => {
    if (status !== "pending") return;
    // Poll every 4 seconds
    const interval = setInterval(() => {
      checkStatus();
      setElapsed((e) => e + 4);
    }, 4000);
    return () => clearInterval(interval);
  }, [status, checkStatus]);

  function copyToClipboard() {
    navigator.clipboard.writeText(pixQrCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  if (status === "paid") {
    return (
      <div className="w-full max-w-md text-center py-16">
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
          style={{ backgroundColor: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)" }}
        >
          <CheckCircle className="h-10 w-10" style={{ color: "#4ADE80" }} />
        </div>
        <h1 className="font-serif text-3xl font-bold mb-2" style={{ color: "#F5F5F5" }}>
          PIX confirmado!
        </h1>
        <p style={{ color: "#9A9A9A" }}>Redirecionando...</p>
      </div>
    );
  }

  if (status === "expired") {
    return (
      <div className="w-full max-w-md text-center py-16">
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6"
          style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
        >
          <AlertCircle className="h-10 w-10" style={{ color: "#F87171" }} />
        </div>
        <h1 className="font-serif text-3xl font-bold mb-2" style={{ color: "#F5F5F5" }}>
          PIX expirado
        </h1>
        <p className="mb-6" style={{ color: "#9A9A9A" }}>
          O prazo de 1 hora para pagamento via PIX foi encerrado. O pedido foi cancelado e o estoque restaurado.
        </p>
        <a
          href="/cart"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold tracking-wider transition-all hover:shadow-[0_0_20px_rgba(212,175,55,0.3)]"
          style={{ backgroundColor: "#D4AF37", color: "#0A0A0A" }}
        >
          Voltar ao carrinho
        </a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      {/* Header */}
      <div className="text-center mb-8">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-xs"
          style={{
            backgroundColor: "rgba(212,175,55,0.08)",
            border: "1px solid rgba(212,175,55,0.2)",
            color: "#D4AF37",
          }}
        >
          <Clock className="h-3 w-3 animate-pulse" />
          Aguardando pagamento
        </div>
        <h1 className="font-serif text-3xl font-bold" style={{ color: "#F5F5F5" }}>
          Pague via PIX
        </h1>
        <p className="text-sm mt-2" style={{ color: "#9A9A9A" }}>
          Escaneie o QR code ou copie o código
        </p>
      </div>

      {/* QR Code */}
      <div
        className="rounded-2xl p-6 text-center mb-5"
        style={{
          backgroundColor: "#111111",
          border: "1px solid rgba(212,175,55,0.2)",
        }}
      >
        <div className="inline-block p-4 rounded-xl bg-white mb-4">
          <QRCode
            value={pixQrCode}
            size={200}
            bgColor="#ffffff"
            fgColor="#000000"
          />
        </div>

        {status === "pending" && (
          <div className="flex items-center justify-center gap-2 text-sm mb-4" style={{ color: "#9A9A9A" }}>
            <RefreshCw className="h-3 w-3 animate-spin" />
            Verificando pagamento...{elapsed > 0 ? ` (${elapsed}s)` : ""}
          </div>
        )}

        {/* Copia e cola */}
        <div
          className="rounded-xl p-3 mb-3 text-left break-all text-xs font-mono"
          style={{
            backgroundColor: "rgba(10,10,10,0.6)",
            border: "1px solid rgba(212,175,55,0.1)",
            color: "rgba(200,187,168,0.7)",
          }}
        >
          {pixQrCode.slice(0, 80)}…
        </div>

        <button
          onClick={copyToClipboard}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all"
          style={{
            backgroundColor: copied ? "rgba(74,222,128,0.1)" : "rgba(212,175,55,0.1)",
            border: `1px solid ${copied ? "rgba(74,222,128,0.3)" : "rgba(212,175,55,0.3)"}`,
            color: copied ? "#4ADE80" : "#D4AF37",
          }}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copiado!" : "Copiar código PIX (copia e cola)"}
        </button>
      </div>

      {/* Instructions */}
      <div
        className="rounded-2xl p-5 space-y-2 mb-5"
        style={{
          backgroundColor: "rgba(15,74,55,0.4)",
          border: "1px solid rgba(212,175,55,0.1)",
        }}
      >
        {[
          "Abra o app do seu banco",
          "Escolha Pix → Pagar com QR Code",
          "Escaneie o código acima ou use Pix copia e cola",
          "Confirme o pagamento",
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-3 text-sm">
            <span
              className="h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
              style={{ backgroundColor: "rgba(212,175,55,0.15)", color: "#D4AF37" }}
            >
              {i + 1}
            </span>
            <span style={{ color: "#9A9A9A" }}>{step}</span>
          </div>
        ))}
      </div>

      {status === "error" && (
        <div
          className="rounded-xl px-4 py-3 text-sm mb-4"
          style={{ backgroundColor: "rgba(239,68,68,0.1)", color: "#F87171", border: "1px solid rgba(239,68,68,0.2)" }}
        >
          Pagamento não confirmado. Por favor, tente novamente ou escolha outra forma de pagamento.
        </div>
      )}

      <p className="text-center text-xs" style={{ color: "rgba(200,187,168,0.4)" }}>
        Pedido #{orderId.slice(0, 8).toUpperCase()} · Esta página é atualizada automaticamente
      </p>
    </div>
  );
}
