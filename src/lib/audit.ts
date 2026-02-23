import { db } from "@/lib/db";

/**
 * Utilitário de Audit Log.
 *
 * Decisões de segurança:
 * - Registra ações sensíveis para compliance LGPD (Art. 37) e OWASP Logging.
 * - Nunca armazena dados sensíveis (senhas, tokens, cartões) no metadata.
 * - IP e User-Agent registrados para forense em caso de incidente.
 * - Operação assíncrona com fire-and-forget: não bloqueia a resposta ao usuário
 *   e falha silenciosamente (logs de auditoria não devem quebrar o fluxo).
 */

export type AuditAction =
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILURE"
  | "REGISTER"
  | "PASSWORD_CHANGE"
  | "PURCHASE"
  | "DATA_DELETION_REQUEST"
  | "DATA_ANONYMIZED"
  | "PROFILE_UPDATE"
  | "CONSENT_UPDATE";

interface AuditLogParams {
  userId?: string;
  action: AuditAction;
  entity?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export async function createAuditLog(params: AuditLogParams): Promise<void> {
  try {
    await db.auditLog.create({
      data: {
        userId: params.userId ?? null,
        action: params.action,
        entity: params.entity ?? null,
        entityId: params.entityId ?? null,
        metadata: params.metadata ?? null,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
      },
    });
  } catch (error) {
    // Log para observabilidade mas não propaga o erro
    console.error("[AUDIT_LOG_ERROR]", error);
  }
}

/**
 * Extrai IP e User-Agent dos headers de um Request.
 * Usa x-forwarded-for (proxy/load balancer) com fallback.
 */
export function extractRequestMeta(request: Request) {
  const headers = new Headers(request.headers);
  const forwarded = headers.get("x-forwarded-for");
  const ipAddress = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  const userAgent = headers.get("user-agent") ?? "unknown";
  return { ipAddress, userAgent };
}
