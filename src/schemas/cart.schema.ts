import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().uuid("ID de produto inválido"),
  quantity: z.number().int().min(1, "Quantidade mínima é 1").max(99),
  observations: z.string().max(200).optional(),
});

export const updateQuantitySchema = z.object({
  cartItemId: z.string().uuid("ID do item inválido"),
  quantity: z.number().int().min(0).max(99),
});

export const removeFromCartSchema = z.object({
  cartItemId: z.string().uuid("ID do item inválido"),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateQuantityInput = z.infer<typeof updateQuantitySchema>;
