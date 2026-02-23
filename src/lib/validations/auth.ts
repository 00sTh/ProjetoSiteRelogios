import { z } from "zod";

/**
 * Zod Validation Schemas — Authentication
 *
 * Defense layers provided:
 *
 * 1. XSS Protection: All string fields are trimmed and constrained by length.
 *    The `sanitizeString` transform strips any HTML tags, preventing stored XSS
 *    if data is ever rendered without escaping. React auto-escapes by default,
 *    but defense-in-depth means we sanitize at the input layer too.
 *
 * 2. SQL Injection Protection: Prisma uses parameterized queries by default,
 *    so SQL injection via ORM is not possible. These schemas add an extra layer
 *    by rejecting obviously malicious patterns and constraining input format.
 *
 * 3. Data Integrity: Strict type coercion, length limits, and format validation
 *    ensure only well-formed data reaches the business logic layer.
 *
 * 4. LGPD Compliance: Registration requires explicit consent fields.
 */

// --- Utility: Strip HTML tags from strings (defense-in-depth against XSS) ---
function stripHtmlTags(value: string): string {
  return value.replace(/<[^>]*>/g, "");
}

// --- Common field schemas ---

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "E-mail é obrigatório")
  .max(254, "E-mail deve ter no máximo 254 caracteres")
  .email("Formato de e-mail inválido")
  .transform(stripHtmlTags);

const passwordSchema = z
  .string()
  .min(8, "Senha deve ter pelo menos 8 caracteres")
  .max(128, "Senha deve ter no máximo 128 caracteres")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    "Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número"
  );

const nameSchema = z
  .string()
  .trim()
  .min(2, "Nome deve ter pelo menos 2 caracteres")
  .max(100, "Nome deve ter no máximo 100 caracteres")
  .regex(
    /^[\p{L}\p{M}\s'-]+$/u,
    "Nome deve conter apenas letras, espaços, apóstrofos e hifens"
  )
  .transform(stripHtmlTags);

const cpfSchema = z
  .string()
  .trim()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, "CPF deve estar no formato XXX.XXX.XXX-XX")
  .refine((cpf) => {
    // Validate CPF check digits (Brazilian tax ID)
    const digits = cpf.replace(/\D/g, "");
    if (digits.length !== 11) return false;
    // Reject known invalid sequences (all same digit)
    if (/^(\d)\1{10}$/.test(digits)) return false;

    // First check digit
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(digits[i]) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(digits[9])) return false;

    // Second check digit
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(digits[i]) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10) remainder = 0;
    if (remainder !== parseInt(digits[10])) return false;

    return true;
  }, "CPF inválido");

const phoneSchema = z
  .string()
  .trim()
  .regex(
    /^\(\d{2}\)\s?\d{4,5}-\d{4}$/,
    "Telefone deve estar no formato (XX) XXXXX-XXXX"
  )
  .transform(stripHtmlTags);

// --- Login Schema ---

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Senha é obrigatória").max(128),
});

export type LoginInput = z.infer<typeof loginSchema>;

// --- Registration Schema ---

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    cpf: cpfSchema,
    phone: phoneSchema.optional(),
    password: passwordSchema,
    passwordConfirmation: z.string(),

    // LGPD: explicit, granular consent
    termsAccepted: z
      .literal(true, {
        errorMap: () => ({
          message: "Você deve aceitar os termos de uso para se registrar",
        }),
      }),
    marketingConsent: z.boolean().default(false),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "As senhas não coincidem",
    path: ["passwordConfirmation"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
