import type { Metadata } from "next";
import { Geist, Geist_Mono, Cormorant_Garamond } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { APP_FULL_NAME, APP_DESCRIPTION } from "@/lib/constants";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300","400","500","600","700"],
  style: ["normal","italic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: `SLC — ${APP_FULL_NAME}`, template: `%s | SLC` },
  description: APP_DESCRIPTION,
  openGraph: { siteName: "SLC", locale: "pt_BR", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} ${cormorant.variable}`}>
        <body style={{ backgroundColor: "#F7F4EE", color: "#0D0B0B" }}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
