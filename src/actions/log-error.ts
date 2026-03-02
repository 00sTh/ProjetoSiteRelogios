"use server";

import { prisma } from "@/lib/prisma";

/**
 * Server Action chamada pelo client error.tsx.
 * Recebe apenas digest + path (não stack — segurança).
 */
export async function logErrorAction(
  digest: string,
  path: string,
  message?: string
): Promise<void> {
  try {
    await prisma.errorLog.create({
      data: {
        message: message
          ? `Client error — ${message.slice(0, 500)}`
          : `Client error — digest: ${digest}`,
        digest,
        path: path.slice(0, 500),
      },
    });
  } catch {
    // Silencioso
  }
}
