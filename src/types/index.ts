import type {
  Category,
  Brand,
  Product,
  Order,
  OrderItem,
  UserProfile,
  WishlistItem,
  OrderStatus,
  PaymentMethod,
} from "@/generated/prisma";

export type { Category, Brand, Product, Order, OrderItem, UserProfile, WishlistItem, OrderStatus, PaymentMethod };

export type ProductWithRelations = Product & {
  brand: Brand & { category: Category };
  category: Category;
};

export type BrandWithCategory = Brand & { category: Category };

export type BrandWithProducts = Brand & {
  category: Category;
  products: Product[];
  _count: { products: number };
};

export type CategoryWithBrands = Category & {
  brands: (Brand & { _count: { products: number } })[];
  _count: { brands: number; products: number };
};

export type OrderWithItems = Order & {
  items: (OrderItem & {
    product: Pick<Product, "id" | "name" | "images" | "slug" | "price">;
  })[];
  user?: UserProfile | null;
};

// Guest cart (localStorage)
export interface CartItem {
  productId: string;
  quantity: number;
}

// Hydrated cart item (productId + fetched data)
export interface HydratedCartItem extends CartItem {
  name: string;
  price: number;
  image: string;
  slug: string;
  brandName: string;
  stock: number;
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// Checkout form data
export interface CheckoutCustomer {
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}
