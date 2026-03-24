import { NavbarClient } from "./navbar-client";
import type { CategoryWithBrands } from "@/types";

export function Navbar({ categories }: { categories: CategoryWithBrands[] }) {
  return <NavbarClient categories={categories} />;
}
