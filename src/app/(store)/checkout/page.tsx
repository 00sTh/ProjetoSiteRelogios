import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { CheckoutClient } from "@/components/checkout/checkout-client";

export default async function CheckoutPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/checkout");
  return <CheckoutClient />;
}
