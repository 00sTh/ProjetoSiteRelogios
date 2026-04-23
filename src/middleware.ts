import { clerkMiddleware, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default clerkMiddleware(async (auth, request: NextRequest) => {
  const { userId } = await auth();
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (!userId) return NextResponse.redirect(new URL("/sign-in?redirect_url=/admin", request.url));
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const role = user.publicMetadata?.role as string | undefined;
    if (role !== "admin") return NextResponse.redirect(new URL("/acesso-negado", request.url));
  }

  if ((pathname.startsWith("/conta") || pathname.startsWith("/wishlist")) && !userId) {
    return NextResponse.redirect(new URL(`/sign-in?redirect_url=${pathname}`, request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)", "/(api|trpc)(.*)"],
};
