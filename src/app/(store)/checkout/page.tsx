import type { Metadata } from "next";
import { Lock, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { CheckoutForm } from "@/components/checkout/checkout-form";
import { getCart } from "@/actions/cart";
import { getServerAuth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Complete Your Order",
};

export default async function CheckoutPage() {
  const { userId } = await getServerAuth();

  // Guests must sign in to checkout
  if (!userId) {
    redirect("/sign-in?redirect_url=%2Fcheckout");
  }

  const cart = await getCart();

  return (
    <div
      className="min-h-screen py-10 px-4"
      style={{ backgroundColor: "#0A0A0A" }}
    >
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4 text-xs"
            style={{
              backgroundColor: "rgba(201,201,201,0.08)",
              border: "1px solid rgba(201,201,201,0.2)",
              color: "#C9C9C9",
            }}
          >
            <Lock className="h-3 w-3" />
            <span className="label-luxury">SSL Encrypted</span>
          </div>
          <h1
            className="font-serif text-3xl md:text-4xl font-bold"
            style={{ color: "#F5F5F5" }}
          >
            Complete Your Order
          </h1>
        </div>

        {/* Security badges */}
        <div
          className="flex items-center justify-center gap-6 mb-8 py-4 rounded-2xl"
          style={{
            backgroundColor: "rgba(20,20,20,0.5)",
            border: "1px solid rgba(201,201,201,0.1)",
          }}
        >
          {["SSL Encrypted", "Secure Payment", "Data Protected"].map((badge) => (
            <div key={badge} className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" style={{ color: "#C9C9C9" }} />
              <span className="text-xs hidden sm:inline" style={{ color: "#9A9A9A" }}>
                {badge}
              </span>
            </div>
          ))}
        </div>

        {/* Checkout form */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{ border: "1px dashed rgba(201,201,201,0.25)" }}
        >
          <CheckoutForm cart={cart} />
        </div>
      </div>
    </div>
  );
}
