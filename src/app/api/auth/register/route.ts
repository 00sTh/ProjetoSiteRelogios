import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations/auth";
import { rateLimit } from "@/lib/rate-limit";
import { logAuditEvent } from "@/lib/audit-log";

/**
 * POST /api/auth/register
 *
 * User registration endpoint with:
 * - Rate limiting (3 attempts / 15 min)
 * - Zod input validation
 * - bcrypt password hashing (cost factor 12)
 * - LGPD consent recording
 * - Audit logging
 */
export async function POST(request: Request) {
  // --- Rate Limiting ---
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { allowed, retryAfterMs } = rateLimit("register", ip);

  if (!allowed) {
    return NextResponse.json(
      { error: "Muitas tentativas. Tente novamente mais tarde." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) },
      }
    );
  }

  // --- Input Validation ---
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Corpo da requisição inválido." },
      { status: 400 }
    );
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Dados inválidos.",
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 422 }
    );
  }

  const { name, email, cpf, phone, password, marketingConsent } = parsed.data;

  // --- Check for existing user ---
  const existingUser = await prisma.user.findFirst({
    where: { OR: [{ email }, { cpf }] },
    select: { id: true },
  });

  if (existingUser) {
    // Generic message: don't reveal which field is taken
    return NextResponse.json(
      { error: "Não foi possível criar a conta. Verifique os dados informados." },
      { status: 409 }
    );
  }

  // --- Hash Password ---
  // Cost factor 12: ~250ms on modern hardware. Balances security and UX.
  // Higher than the default 10 for a premium e-commerce where login attempts
  // are less frequent than in social media apps.
  const passwordHash = await bcrypt.hash(password, 12);

  // --- Create User ---
  const user = await prisma.user.create({
    data: {
      name,
      email,
      cpf,
      phone: phone ?? null,
      passwordHash,
      marketingConsent,
      termsAcceptedAt: new Date(),
    },
    select: { id: true, email: true, name: true },
  });

  // --- Audit Log ---
  await logAuditEvent({
    userId: user.id,
    action: "USER_REGISTERED",
    request,
    details: { marketingConsent },
  });

  return NextResponse.json(
    { message: "Conta criada com sucesso.", user: { id: user.id } },
    { status: 201 }
  );
}
