"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { logErrorAction } from "@/actions/log-error";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/** Error boundary global — captura erros não tratados em Server Components */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
    logErrorAction(
      error.digest ?? "no-digest",
      window.location.pathname,
      error.message
    ).catch(() => {});
  }, [error]);

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ backgroundColor: "#0A3D2F" }}
    >
      {/* Ícone */}
      <div
        className="mb-8 flex h-20 w-20 items-center justify-center rounded-full"
        style={{
          backgroundColor: "rgba(201,162,39,0.1)",
          border: "1px solid rgba(201,162,39,0.25)",
        }}
      >
        <AlertTriangle className="h-9 w-9" style={{ color: "#C9A227" }} />
      </div>

      {/* Título */}
      <h1
        className="font-serif text-4xl font-bold mb-3 text-center"
        style={{ color: "#F5F0E6" }}
      >
        Algo deu errado
      </h1>

      {/* Separador dourado */}
      <div
        className="mb-6 h-px w-16"
        style={{ backgroundColor: "rgba(201,162,39,0.4)" }}
      />

      {/* Mensagem */}
      <p
        className="text-center max-w-sm mb-10 leading-relaxed"
        style={{ color: "rgba(200,187,168,0.7)" }}
      >
        Ocorreu um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver o problema.
      </p>

      {/* Ações */}
      <div className="flex items-center gap-4">
        <button
          onClick={reset}
          className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold tracking-wider uppercase transition-all duration-300 hover:shadow-[0_0_20px_rgba(201,162,39,0.4)]"
          style={{ backgroundColor: "#C9A227", color: "#0A3D2F" }}
        >
          <RefreshCw className="h-4 w-4" />
          Tentar novamente
        </button>

        <Link
          href="/"
          className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold tracking-wider uppercase transition-all duration-300"
          style={{
            border: "1px solid rgba(201,162,39,0.3)",
            color: "#C9A227",
          }}
        >
          <Home className="h-4 w-4" />
          Ir para home
        </Link>
      </div>

      {/* Digest para debug */}
      {error.digest && (
        <p
          className="mt-8 text-xs font-mono"
          style={{ color: "rgba(200,187,168,0.3)" }}
        >
          ref: {error.digest}
        </p>
      )}
    </div>
  );
}
