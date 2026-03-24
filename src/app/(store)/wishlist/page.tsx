import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getWishlist } from "@/actions/wishlist";
import { ProductCard } from "@/components/products/product-card";
import type { ProductWithRelations } from "@/types";

export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const wishlist = await getWishlist();
  return (
    <div className="pt-24 min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="font-serif text-3xl font-light mb-10">Wishlist</h1>
        {!wishlist.length && <p className="text-sm opacity-50">Sua wishlist está vazia.</p>}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {wishlist.map(item => (
            <ProductCard key={item.id} product={item.product as unknown as ProductWithRelations} />
          ))}
        </div>
      </div>
    </div>
  );
}
