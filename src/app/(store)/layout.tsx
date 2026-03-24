import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getCategories } from "@/actions/products";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const categories = await getCategories();
  return (
    <div className="flex min-h-screen flex-col" style={{ backgroundColor: "#F7F4EE" }}>
      <Navbar categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
