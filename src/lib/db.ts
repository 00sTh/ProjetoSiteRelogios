import { PrismaClient } from "@prisma/client";

/**
 * Singleton do Prisma Client.
 * Em desenvolvimento o hot-reload do Next.js recriaria conexões;
 * guardar no globalThis previne connection pool exhaustion.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
