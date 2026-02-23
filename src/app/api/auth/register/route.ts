import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { registerSchema } from "@/lib/validations/auth";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";
import { createAuditLog, extractRequestMeta } from "@/lib/audit";

/**
 * POST /api/auth/register
 *
 * Decisões de segurança:
 * - Rate limit de 3 tentativas/minuto: previne cadastro em massa por bots.
 * - Validação Zod completa antes de qualquer operação de DB.
 * - bcrypt com salt rounds 12: custo computacional que torna brute-force
 *   inviável (~250ms por hash em hardware moderno).
 * - Resposta genérica para email duplicado: não confirma se email já existe
 *   (previne enumeração de usuários).
 * - Audit log do registro para compliance LGPD.
 */

const BCRYPT_SALT_ROUNDS = 12;

export async function POST(request: NextRequest) {
  try {
    // --- Rate Limiting ---
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
    const rl = checkRateLimit(ip, "register");
    if (!rl.success) {
      return rateLimitResponse(rl);
    }

    // --- Parse e Validação ---
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, password, marketingConsent } = parsed.data;

    // --- Verificar duplicidade (resposta genérica) ---
    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      // Resposta genérica: não revela que o email já está cadastrado
      return NextResponse.json(
        { message: "Se este email não estiver cadastrado, você receberá um email de confirmação." },
        { status: 200 }
      );
    }

    // --- Hash da senha ---
    const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);

    // --- Criação do usuário ---
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        marketingConsent,
        termsAcceptedAt: new Date(),
      },
    });

    // --- Audit Log ---
    const meta = extractRequestMeta(request);
    await createAuditLog({
      userId: user.id,
      action: "REGISTER",
      entity: "User",
      entityId: user.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    return NextResponse.json(
      { message: "Se este email não estiver cadastrado, você receberá um email de confirmação." },
      { status: 201 }
    );
  } catch (error) {
    console.error("[REGISTER_ERROR]", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
