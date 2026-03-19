import type { Cart, CartItem, Category, Order, OrderItem, Product } from "@prisma/client";

// ── Produto com categoria ─────────────────────────────────────────────
// imagesArray and colorsArray are computed fields added by the Prisma client extension in src/lib/prisma.ts
export type ProductWithCategory = Product & {
  category: Category;
  imagesArray: string[];
  colorsArray: string[];
};

// ── Item do carrinho com produto completo ─────────────────────────────
export type CartItemWithProduct = CartItem & {
  product: Product;
};

// ── Carrinho completo ─────────────────────────────────────────────────
export type CartWithItems = Cart & {
  items: CartItemWithProduct[];
};

// ── Pedido com itens e produto ────────────────────────────────────────
export type OrderItemWithProduct = OrderItem & {
  product: Product;
};

export type OrderWithItems = Order & {
  items: OrderItemWithProduct[];
};

// ── Resposta padrão de Server Actions ────────────────────────────────
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };
