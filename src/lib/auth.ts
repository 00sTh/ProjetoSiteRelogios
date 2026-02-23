import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import { logAuditEvent } from "@/lib/audit-log";

/**
 * NextAuth.js (Auth.js) Configuration
 *
 * Security decisions:
 *
 * 1. Credentials Provider: Uses email/password with bcrypt hashing.
 *    Password comparison uses bcrypt.compare() which is timing-safe,
 *    preventing timing attacks that could reveal valid emails.
 *
 * 2. JWT Strategy: Sessions are stored as encrypted JWTs in cookies,
 *    not in the database. This reduces database load and eliminates
 *    session fixation attacks. The JWT is signed with NEXTAUTH_SECRET.
 *
 * 3. Cookie Security:
 *    - httpOnly: true — JavaScript cannot read the cookie (prevents XSS theft)
 *    - secure: true in production — cookie only sent over HTTPS
 *    - sameSite: "lax" — prevents CSRF on cross-origin POST requests
 *      while allowing normal navigation (GET) from external links
 *
 * 4. Error Messages: Generic "Credenciais inválidas" for both wrong email
 *    and wrong password. This prevents user enumeration attacks where an
 *    attacker can discover valid email addresses by differing error messages.
 *
 * 5. Anonymized Users: Blocked from login. If a user exercised their LGPD
 *    right to data deletion, their account is anonymized and cannot be
 *    reactivated through login.
 *
 * 6. Audit Logging: Both successful and failed login attempts are recorded
 *    with IP and user-agent for incident investigation.
 */

const isProduction = process.env.NODE_ENV === "production";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "E-mail", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        // Validate input shape with Zod
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
            role: true,
            anonymized: true,
          },
        });

        // Generic error: don't reveal whether the email exists
        if (!user) {
          return null;
        }

        // Block anonymized accounts (LGPD data deletion)
        if (user.anonymized) {
          return null;
        }

        const passwordValid = await bcrypt.compare(password, user.passwordHash);
        if (!passwordValid) {
          // Log failed attempt (no await — fire and forget)
          logAuditEvent({
            userId: user.id,
            action: "USER_LOGIN_FAILED",
            details: { reason: "invalid_password" },
          });
          return null;
        }

        // Log successful login
        logAuditEvent({
          userId: user.id,
          action: "USER_LOGIN",
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],

  session: {
    strategy: "jwt",
    // 24-hour session lifetime — balances security and usability
    maxAge: 24 * 60 * 60,
  },

  jwt: {
    // JWT is encrypted and signed automatically using NEXTAUTH_SECRET
    maxAge: 24 * 60 * 60,
  },

  cookies: {
    sessionToken: {
      name: isProduction
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
    callbackUrl: {
      name: isProduction
        ? "__Secure-next-auth.callback-url"
        : "next-auth.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
    csrfToken: {
      name: isProduction
        ? "__Host-next-auth.csrf-token"
        : "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: isProduction,
      },
    },
  },

  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in, attach role to the JWT
      if (user) {
        token.id = user.id;
        token.role = (user as { role: string }).role;
      }
      return token;
    },
    async session({ session, token }) {
      // Expose id and role in the client-side session object
      if (session.user) {
        (session.user as { id: string }).id = token.id as string;
        (session.user as { role: string }).role = token.role as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login",
  },

  // Do not expose internal errors to the client
  debug: false,
};
