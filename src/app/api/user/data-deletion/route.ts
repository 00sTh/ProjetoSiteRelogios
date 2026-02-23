import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createAuditLog, extractRequestMeta } from "@/lib/audit";

/**
 * POST /api/user/data-deletion
 *
 * Direito à eliminação (LGPD Art. 18, V).
 *
 * Decisões de segurança e compliance:
 * - Anonimização ao invés de DELETE: preserva integridade referencial
 *   de pedidos e notas fiscais (obrigação fiscal de 5 anos).
 * - Remove PII (nome, email) e marca anonymized=true.
 * - Gera email aleatório para manter constraint UNIQUE sem expor dados.
 * - Audit log registra a solicitação para prova de compliance.
 * - Sessão é invalidada após anonimização.
 */

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const userId = session.user.id;
    const meta = extractRequestMeta(request);

    // Registrar a solicitação ANTES da exclusão (para auditoria)
    await createAuditLog({
      userId,
      action: "DATA_DELETION_REQUEST",
      entity: "User",
      entityId: userId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    // Anonimizar dados pessoais
    const anonymizedEmail = `deleted-${crypto.randomUUID()}@anonymized.local`;

    await db.user.update({
      where: { id: userId },
      data: {
        name: "Usuário Removido",
        email: anonymizedEmail,
        passwordHash: "ANONYMIZED",
        image: null,
        marketingConsent: false,
        anonymized: true,
        anonymizedAt: new Date(),
      },
    });

    // Deletar sessões ativas
    await db.session.deleteMany({ where: { userId } });

    await createAuditLog({
      userId,
      action: "DATA_ANONYMIZED",
      entity: "User",
      entityId: userId,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return NextResponse.json(
      { message: "Seus dados foram anonimizados com sucesso conforme a LGPD." },
      { status: 200 }
    );
  } catch (error) {
    console.error("[DATA_DELETION_ERROR]", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
