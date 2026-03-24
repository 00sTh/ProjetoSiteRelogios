"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function PixContent() {
  const params = useSearchParams();
  const router = useRouter();
  const paymentId = params.get("paymentId");
  const qrCode = params.get("qrCode");
  const qrCodeBase64 = params.get("qrCodeBase64");

  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [status, setStatus] = useState<"pending" | "paid" | "expired">("pending");

  const pollPayment = useCallback(async () => {
    if (!paymentId || status !== "pending") return;
    try {
      const res = await fetch(`/api/check-payment?paymentId=${paymentId}`);
      const data = await res.json();
      if (data.status === "paid") {
        setStatus("paid");
        setTimeout(() => router.push("/checkout/sucesso"), 1500);
      }
    } catch {
      // ignore
    }
  }, [paymentId, status, router]);

  useEffect(() => {
    if (!paymentId) return;
    const poll = setInterval(pollPayment, 5000);
    return () => clearInterval(poll);
  }, [paymentId, pollPayment]);

  useEffect(() => {
    if (status !== "pending") return;
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { setStatus("expired"); clearInterval(timer); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  if (!paymentId && !qrCode) {
    return (
      <div className="pt-24 min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-sm opacity-50">Sessão de pagamento inválida.</p>
        <Link href="/checkout" className="cta-link">Voltar ao checkout</Link>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen flex flex-col items-center justify-center gap-6 px-6">
      {status === "paid" ? (
        <>
          <div className="w-16 h-16 rounded-full border-2 flex items-center justify-center" style={{ borderColor: "#B8963E" }}>
            <span className="text-2xl" style={{ color: "#B8963E" }}>✓</span>
          </div>
          <h1 className="font-serif text-3xl font-light">Pagamento Confirmado</h1>
          <p className="text-sm opacity-50">Redirecionando...</p>
        </>
      ) : status === "expired" ? (
        <>
          <h1 className="font-serif text-3xl font-light text-center">QR Code Expirado</h1>
          <p className="text-sm text-center opacity-50 max-w-xs">O tempo para pagamento expirou. Realize um novo pedido.</p>
          <Link href="/checkout" className="px-6 py-2.5 text-[10px] tracking-[0.4em] uppercase text-white" style={{ backgroundColor: "#0D0B0B" }}>Novo Checkout</Link>
        </>
      ) : (
        <>
          <h1 className="font-serif text-3xl font-light text-center">Pague via PIX</h1>
          <p className="text-sm text-center" style={{ color: "rgba(13,11,11,0.5)" }}>
            Escaneie o QR code abaixo com seu aplicativo bancário
          </p>

          {qrCodeBase64 ? (
            <img src={`data:image/png;base64,${qrCodeBase64}`} alt="QR Code PIX" className="w-56 h-56 border" style={{ borderColor: "rgba(13,11,11,0.1)" }} />
          ) : (
            <div className="w-56 h-56 border flex items-center justify-center" style={{ borderColor: "rgba(13,11,11,0.1)" }}>
              <p className="label-slc opacity-40">QR Code</p>
            </div>
          )}

          {qrCode && (
            <div className="w-full max-w-sm">
              <p className="label-slc mb-2 opacity-50">Ou copie o código PIX</p>
              <div className="flex gap-2">
                <input readOnly value={qrCode} className="flex-1 border px-3 py-2 text-xs font-mono outline-none truncate" style={{ borderColor: "rgba(13,11,11,0.2)" }} />
                <button onClick={() => navigator.clipboard.writeText(qrCode)} className="px-3 py-2 text-[10px] tracking-widest uppercase text-white flex-shrink-0" style={{ backgroundColor: "#0D0B0B" }}>
                  Copiar
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col items-center gap-1 mt-2">
            <p className="font-mono text-2xl" style={{ color: timeLeft < 120 ? "#6B1A2A" : "#0D0B0B" }}>{minutes}:{seconds}</p>
            <p className="label-slc opacity-40">Tempo restante</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#B8963E" }} />
            <p className="label-slc opacity-50">Aguardando confirmação automática...</p>
          </div>
        </>
      )}
    </div>
  );
}

export default function PixPage() {
  return (
    <Suspense fallback={
      <div className="pt-24 min-h-screen flex items-center justify-center">
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: "#B8963E" }} />
      </div>
    }>
      <PixContent />
    </Suspense>
  );
}
