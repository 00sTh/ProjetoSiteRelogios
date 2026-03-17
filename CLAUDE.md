# CLAUDE.md — LuxImport v1.0.0

> **REGRA:** Sempre atualizar este arquivo após qualquer mudança significativa de arquitetura, features ou convenções.

## Visão Geral
E-commerce de produtos importados de luxo. Plataforma com tema Dark + Gold ultra premium.
Versão atual: **1.0.0** (fork do AltheiaSite).

## Stack
| Tecnologia | Versão | Propósito |
|---|---|---|
| Next.js | ^16 | Framework (App Router + Server Components) |
| TypeScript | strict | Linguagem |
| Tailwind CSS | v4 | Estilo (`@theme inline` no globals.css) |
| Prisma | ^6 | ORM |
| SQLite (dev) / PostgreSQL (prod) | — | Banco |
| Clerk | ^6 | Autenticação |
| Cielo | — | Gateway de pagamento (cartão + PIX) |
| framer-motion | ^12 | Animações |
| Zod | ^3 | Validação |
| nodemailer | ^8 | E-mail |
| cloudinary | ^2 | Upload de imagens |

## Node
Via nvm — sempre rodar `source /home/sth/.nvm/nvm.sh` antes de npm/npx.

## Tema Visual (Dark + Gold)
- **Fundo:** `#0A0A0A` (dark-bg)
- **Surface:** `#111111` (dark-surface), `#1A1A1A` (dark-surface-2)
- **Gold:** `#D4AF37` (principal), `#F0D060` (gold-light)
- **Texto:** `#F5F5F5` (primário), `#9A9A9A` (muted)
- **Tipografia:** Playfair Display (headings serif) + Geist Sans (body)
- CSS utilities: `.gold-glow`, `.text-gradient-gold`, `.label-luxury`, `.border-gold-subtle`

## Banco de Dados

### Desenvolvimento (SQLite local)
- `DATABASE_URL="file:./prisma/dev.db"` no `.env.local`
- `prisma/schema.prisma` = SQLite (sem enums, sem String[], sem @db.Decimal)
  - `images String @default("[]")` — JSON string
  - `status String @default("PENDING")` — sem enum
  - `paymentMethod String @default("WHATSAPP")` — sem enum
  - `price Decimal` — sem @db.Decimal

### Produção (PostgreSQL — Neon)
- `prisma/schema.production.prisma` — fonte da verdade para prod
- `npm run build:prod` copia schema.production.prisma → schema.prisma

### Comandos
```bash
# Dev
source /home/sth/.nvm/nvm.sh && cd /home/sth/LuxImport
npx prisma db push
npm run db:seed
npm run dev
npx tsc --noEmit
```

## Auth (Clerk — import estático)
- `middleware.ts` — `clerkMiddleware` + import **estático** (nunca dinâmico)
- Role admin: `{ "role": "admin" }` em Public metadata no Clerk Dashboard
- JWT template: `{ "metadata": "{{user.public_metadata}}" }` em Configure → Sessions

## Categorias de Produto
1. **Relógios** — slug: `relogios` (~507 produtos)
2. **Acessórios** — slug: `acessorios` (joias, perfumes, cintos — óculos foram separados)
3. **Eletrônicos** — slug: `eletronicos` (desativados)
4. **Sapatos** — slug: `sapatos` (~515 produtos, antes era `moda`)
5. **Bolsas & Carteiras** — slug: `bolsas` (~387 produtos)
6. **Óculos** — slug: `oculos` (~576 produtos, migrados de acessorios)

## Convenções
- Server Components por padrão; `"use client"` somente quando necessário
- `images` em Product: sempre `JSON.stringify()` na escrita (SQLite dev)
- `parseImages()` em `src/lib/utils.ts` — usar para ler imagens
- Em prod PostgreSQL: `images String[]` (schema.production.prisma)
- Preços sempre calculados no servidor
- `formatPrice()` em `src/lib/utils.ts`

## Bugs Críticos (não regredir)
- Middleware Clerk: import **estático** — nunca `await import(...)`
- Schema change: sempre `prisma db push` antes/após deploy em prod
- Prisma objects: NÃO passar direto para "use client" (têm symbol properties)
- Server Components: SEM event handlers — separar em server + client wrapper

## Deploy (Vercel + Neon)
Env vars obrigatórias:
- `DATABASE_URL` (pooled), `DIRECT_URL` (direta)
- `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
