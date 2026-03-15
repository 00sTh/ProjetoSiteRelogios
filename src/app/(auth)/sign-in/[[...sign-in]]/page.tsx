import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sign In" };

export default function SignInPage() {
  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-12"
      style={{
        backgroundColor: "#0A0A0A",
        background: "radial-gradient(ellipse 60% 50% at 50% 30%, rgba(201,201,201,0.05) 0%, transparent 70%)",
      }}
    >
      <SignIn />
    </div>
  );
}
