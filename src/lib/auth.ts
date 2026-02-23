import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";

/**
 * Configuração central do NextAuth (Auth.js v5).
 *
 * Decisões de segurança:
 * - Estratégia JWT: stateless, sem necessidade de session store.
 *   O token é assinado com NEXTAUTH_SECRET (HMAC-SHA256).
 * - Cookies HttpOnly + Secure + SameSite=lax:
 *   - HttpOnly: impede acesso via document.cookie (mitiga XSS).
 *   - Secure: só transmite via HTTPS (mitiga MITM).
 *   - SameSite=lax: bloqueia CSRF em requisições cross-site POST.
 * - Validação Zod no provider Credentials: mesmo schema usado no frontend.
 * - Comparação de senha com bcrypt.compare (timing-safe).
 * - Mensagens de erro genéricas: não revela se email existe ou senha está errada
 *   (previne enumeração de usuários).
 * - Usuários anonimizados (LGPD) não podem fazer login.
 */

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 horas
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  cookies: {
    sessionToken: {
      name: "__Secure-next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    callbackUrl: {
      name: "__Secure-next-auth.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: "__Host-next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        // Valida input com Zod antes de qualquer operação de DB
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        const user = await db.user.findUnique({
          where: { email },
        });

        // Mensagem genérica — não revela se é email ou senha inválidos
        if (!user) return null;

        // Usuário anonimizado pela LGPD não pode autenticar
        if (user.anonymized) return null;

        const passwordValid = await bcrypt.compare(password, user.passwordHash);
        if (!passwordValid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
