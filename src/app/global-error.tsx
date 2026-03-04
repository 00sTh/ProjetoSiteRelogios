"use client";

import { useEffect } from "react";
import { logErrorAction } from "@/actions/log-error";

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * global-error.tsx — captura erros no root layout (ClerkProvider, etc.)
 * Deve envolver html + body pois substitui o layout inteiro.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
    if (error.digest) {
      logErrorAction(error.digest, window.location.pathname).catch(() => {});
    }
  }, [error]);

  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, backgroundColor: "#0A0A0A" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            padding: "2rem",
            fontFamily: "sans-serif",
            color: "#F5F5F5",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              backgroundColor: "rgba(212,175,55,0.1)",
              border: "1px solid rgba(212,175,55,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "2rem",
              fontSize: "2rem",
            }}
          >
            ⚠
          </div>

          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "0.75rem",
              color: "#F5F5F5",
            }}
          >
            Erro crítico
          </h1>

          <div
            style={{
              width: 64,
              height: 1,
              backgroundColor: "rgba(212,175,55,0.4)",
              margin: "0 auto 1.5rem",
            }}
          />

          <p
            style={{
              color: "rgba(200,187,168,0.7)",
              maxWidth: 360,
              lineHeight: 1.6,
              marginBottom: "2rem",
            }}
          >
            Ocorreu um erro inesperado na aplicação. Tente recarregar a página.
          </p>

          <button
            onClick={reset}
            style={{
              backgroundColor: "#D4AF37",
              color: "#0A0A0A",
              border: "none",
              borderRadius: "9999px",
              padding: "0.75rem 1.75rem",
              fontWeight: 600,
              fontSize: "0.875rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              cursor: "pointer",
            }}
          >
            Recarregar
          </button>

          {error.digest && (
            <p
              style={{
                marginTop: "2rem",
                fontSize: "0.75rem",
                fontFamily: "monospace",
                color: "rgba(200,187,168,0.3)",
              }}
            >
              ref: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
