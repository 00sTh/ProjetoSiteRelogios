import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Premium Watches | E-commerce de Relógios",
  description: "E-commerce premium de relógios com segurança e conformidade LGPD.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
