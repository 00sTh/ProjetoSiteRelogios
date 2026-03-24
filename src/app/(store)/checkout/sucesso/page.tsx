import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="pt-24 min-h-screen flex flex-col items-center justify-center gap-6 px-6">
      <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center" style={{ borderColor: "#B8963E" }}>
        <span className="text-xl" style={{ color: "#B8963E" }}>✓</span>
      </div>
      <h1 className="font-serif text-3xl font-light text-center">Pedido Confirmado</h1>
      <p className="text-sm text-center max-w-sm" style={{ color: "rgba(13,11,11,0.55)" }}>
        Obrigado pela sua compra. Você receberá um e-mail de confirmação em breve.
      </p>
      <div className="flex gap-4 mt-2">
        <Link href="/conta" className="cta-link">Ver Meus Pedidos</Link>
        <Link href="/" className="px-6 py-2.5 text-[10px] tracking-[0.4em] uppercase text-white" style={{ backgroundColor: "#0D0B0B" }}>Continuar Comprando</Link>
      </div>
    </div>
  );
}
