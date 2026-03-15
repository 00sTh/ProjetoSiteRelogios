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
          PIX Confirmed!
        </h1>
        <p style={{ color: "#9A9A9A" }}>Redirecting...</p>
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
          PIX Expired
        </h1>
        <p className="mb-6" style={{ color: "#9A9A9A" }}>
          The 1-hour PIX payment window has closed. The order was cancelled and stock restored.
        </p>
        <a
          href="/cart"
          className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-sm font-semibold tracking-wider transition-all hover:shadow-[0_0_20px_rgba(201,201,201,0.3)]"
          style={{ backgroundColor: "#C9C9C9", color: "#0A0A0A" }}
        >
          Back to Cart
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
            backgroundColor: "rgba(201,201,201,0.08)",
            border: "1px solid rgba(201,201,201,0.2)",
            color: "#C9C9C9",
          }}
        >
          <Clock className="h-3 w-3 animate-pulse" />
          Awaiting Payment
        </div>
        <h1 className="font-serif text-3xl font-bold" style={{ color: "#F5F5F5" }}>
          Pay via PIX
        </h1>
        <p className="text-sm mt-2" style={{ color: "#9A9A9A" }}>
          Scan the QR code or copy the code
        </p>
      </div>

      {/* QR Code */}
      <div
        className="rounded-2xl p-6 text-center mb-5"
        style={{
          backgroundColor: "#111111",
          border: "1px solid rgba(201,201,201,0.2)",
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
            Checking payment...{elapsed > 0 ? ` (${elapsed}s)` : ""}
          </div>
        )}

        {/* Copia e cola */}
        <div
          className="rounded-xl p-3 mb-3 text-left break-all text-xs font-mono"
          style={{
            backgroundColor: "rgba(10,10,10,0.6)",
            border: "1px solid rgba(201,201,201,0.1)",
            color: "rgba(200,187,168,0.7)",
          }}
        >
          {pixQrCode.slice(0, 80)}…
        </div>

        <button
          onClick={copyToClipboard}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold transition-all"
          style={{
            backgroundColor: copied ? "rgba(74,222,128,0.1)" : "rgba(201,201,201,0.1)",
            border: `1px solid ${copied ? "rgba(74,222,128,0.3)" : "rgba(201,201,201,0.3)"}`,
            color: copied ? "#4ADE80" : "#C9C9C9",
          }}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copied!" : "Copy PIX Code"}
        </button>
      </div>

      {/* Instructions */}
      <div
        className="rounded-2xl p-5 space-y-2 mb-5"
        style={{
          backgroundColor: "rgba(20,20,20,0.6)",
          border: "1px solid rgba(201,201,201,0.1)",
        }}
      >
        {[
          "Open your bank app",
          "Choose PIX → Pay with QR Code",
          "Scan the code above or use PIX copy & paste",
          "Confirm the payment",
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-3 text-sm">
            <span
              className="h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
              style={{ backgroundColor: "rgba(201,201,201,0.15)", color: "#C9C9C9" }}
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
          Payment not confirmed. Please try again or choose another payment method.
        </div>
      )}

      <p className="text-center text-xs" style={{ color: "rgba(200,187,168,0.4)" }}>
        Order #{orderId.slice(0, 8).toUpperCase()} · This page updates automatically
      </p>
    </div>
  );
}
