import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { PixPolling } from "@/components/checkout/pix-polling";

export const metadata: Metadata = {
  title: "PIX Payment",
};

interface Props {
  searchParams: Promise<{
    orderId?: string;
    paymentId?: string;
    qr?: string;
  }>;
}

export default async function CheckoutPixPage({ searchParams }: Props) {
  const { orderId, paymentId, qr } = await searchParams;

  if (!orderId || !paymentId || !qr) redirect("/");

  return (
    <div
      className="min-h-screen py-12 px-4 flex items-start justify-center"
      style={{ backgroundColor: "#0A0A0A" }}
    >
      <PixPolling orderId={orderId} paymentId={paymentId} pixQrCode={qr} />
    </div>
  );
}
