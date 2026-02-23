import { prisma } from "@/lib/prisma";
import type { AuditAction } from "@prisma/client";

/**
 * Audit Logger — Records sensitive actions for LGPD compliance
 *
 * Every action involving personal data, authentication, or financial
 * operations must be logged. This utility extracts IP and user-agent
 * from the request and stores an immutable record.
 *
 * Usage in API routes:
 * ```ts
 * await logAuditEvent({
 *   userId: user.id,
 *   action: "PASSWORD_CHANGED",
 *   request,
 *   details: { changedFields: ["password"] },
 * });
 * ```
 */

interface AuditLogParams {
  userId?: string | null;
  action: AuditAction;
  request?: Request;
  details?: Record<string, unknown>;
}

export async function logAuditEvent({
  userId,
  action,
  request,
  details,
}: AuditLogParams): Promise<void> {
  const ipAddress = request
    ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      null
    : null;

  const userAgent = request
    ? request.headers.get("user-agent") ?? null
    : null;

  try {
    await prisma.auditLog.create({
      data: {
        userId: userId ?? null,
        action,
        details: details ?? undefined,
        ipAddress,
        userAgent,
      },
    });
  } catch (error) {
    // Audit logging must never break the main flow.
    // Log the error for monitoring but don't throw.
    console.error("[AuditLog] Failed to write audit log:", error);
  }
}
