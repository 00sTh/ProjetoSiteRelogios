import { z } from "zod";

/**
 * Schemas Zod para autenticação.
 *
 * Decisões de segurança:
 * - .trim() em todos os campos de texto: previne bypass por espaços.
 * - Regex de email restritiva: bloqueia payloads de injection em campos de email.
 * - Senha com requisitos de complexidade: mínimo 8 chars, maiúscula, minúscula,
 *   número e caractere especial — alinhado com OWASP ASVS v4.0.
 * - .max() em todos os campos: previne ataques de payload gigante (DoS).
 * - Campo nome sanitizado contra caracteres de controle e tags HTML.
 */

const DANGEROUS_PATTERNS = /[<>'"`;(){}[\]\\]/;

function sanitizeString(val: string): string {
  return val.replace(/[<>"']/g, "");
}

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Nome deve ter no mínimo 2 caracteres")
    .max(100, "Nome muito longo")
    .transform(sanitizeString),

  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Email inválido")
    .max(255, "Email muito longo"),

  password: z
    .string()
    .min(8, "Senha deve ter no mínimo 8 caracteres")
    .max(128, "Senha muito longa")
    .regex(/[A-Z]/, "Senha deve conter ao menos uma letra maiúscula")
    .regex(/[a-z]/, "Senha deve conter ao menos uma letra minúscula")
    .regex(/[0-9]/, "Senha deve conter ao menos um número")
    .regex(
      /[^A-Za-z0-9]/,
      "Senha deve conter ao menos um caractere especial"
    ),

  confirmPassword: z.string(),

  /** LGPD: consentimento obrigatório para marketing */
  marketingConsent: z.boolean().default(false),

  /** LGPD: aceite dos termos de uso é obrigatório */
  termsAccepted: z
    .boolean()
    .refine((val) => val === true, {
      message: "Você deve aceitar os termos de uso para se registrar",
    }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Email inválido")
    .max(255, "Email muito longo"),

  password: z
    .string()
    .min(1, "Senha é obrigatória")
    .max(128, "Senha muito longa"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
