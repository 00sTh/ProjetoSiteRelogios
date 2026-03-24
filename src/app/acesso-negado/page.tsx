import Link from "next/link";
export default function AccessDenied() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <p className="font-serif text-4xl font-light">403</p>
      <p className="label-slc">Acesso Negado</p>
      <Link href="/" className="cta-link mt-4">Voltar ao início</Link>
    </div>
  );
}
