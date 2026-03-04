import Link from "next/link";
import { ShieldX } from "lucide-react";

export default function AcessoNegadoPage() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-4"
      style={{ backgroundColor: "#0A0A0A" }}
    >
      <div
        className="mb-8 flex h-20 w-20 items-center justify-center rounded-full"
        style={{
          backgroundColor: "rgba(212,175,55,0.1)",
          border: "1px solid rgba(212,175,55,0.25)",
        }}
      >
        <ShieldX className="h-9 w-9" style={{ color: "#D4AF37" }} />
      </div>

      <h1
        className="font-serif text-4xl font-bold mb-3 text-center"
        style={{ color: "#F5F5F5" }}
      >
        Acesso Negado
      </h1>

      <div
        className="mb-6 h-px w-16"
        style={{ backgroundColor: "rgba(212,175,55,0.4)" }}
      />

      <p
        className="text-center max-w-sm mb-10 leading-relaxed"
        style={{ color: "rgba(200,187,168,0.7)" }}
      >
        Você não tem permissão para acessar esta área. Esta seção é restrita a administradores.
      </p>

      <Link
        href="/"
        className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold tracking-wider uppercase transition-all duration-300 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
        style={{ backgroundColor: "#D4AF37", color: "#0A0A0A" }}
      >
        Voltar para a loja
      </Link>
    </div>
  );
}
