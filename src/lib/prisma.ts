import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client Singleton
 *
 * In development, Next.js hot-reloading creates new PrismaClient instances
 * on every reload, which can exhaust database connections. This pattern
 * stores the client on `globalThis` to reuse it across reloads.
 *
 * In production, a single instance is created normally.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
