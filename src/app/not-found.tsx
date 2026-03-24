import Link from "next/link";
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: "#F7F4EE" }}>
      <p className="font-serif text-6xl font-light" style={{ color: "rgba(13,11,11,0.2)" }}>404</p>
      <p className="font-serif text-2xl font-light">Página não encontrada</p>
      <Link href="/" className="cta-link mt-4">Voltar ao início</Link>
    </div>
  );
}
