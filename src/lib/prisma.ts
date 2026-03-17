import { PrismaClient } from "@prisma/client";

function createPrismaClient() {
  const base = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });

  /**
   * Extensão que auto-parseia o campo `images` (String JSON → string[]).
   * Necessário porque SQLite não suporta arrays nativos.
   * Em produção com PostgreSQL, pode ser removida.
   */
  return base.$extends({
    result: {
      product: {
        imagesArray: {
          needs: { images: true },
          compute(product) {
            // PostgreSQL: images já é string[]. SQLite: images é JSON string.
            if (Array.isArray(product.images)) return product.images as string[];
            try {
              const parsed = JSON.parse(product.images as unknown as string);
              return Array.isArray(parsed) ? (parsed as string[]) : [];
            } catch {
              return [] as string[];
            }
          },
        },
        colorsArray: {
          needs: { colors: true },
          compute(product) {
            // PostgreSQL: colors já é string[]. SQLite: colors é JSON string ou null.
            if (Array.isArray(product.colors)) return product.colors as string[];
            if (!product.colors) return [] as string[];
            try {
              const parsed = JSON.parse(product.colors as unknown as string);
              return Array.isArray(parsed) ? (parsed as string[]) : [];
            } catch {
              return [] as string[];
            }
          },
        },
      },
    },
  });
}

type PrismaClientSingleton = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClientSingleton;
};

function getOrCreateClient(): PrismaClientSingleton {
  return globalForPrisma.prisma ?? createPrismaClient();
}

/** Singleton do Prisma — evita múltiplas instâncias em dev com hot-reload */
export const prisma: PrismaClientSingleton = getOrCreateClient();

globalForPrisma.prisma = prisma;
