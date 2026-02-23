# CLAUDE.md — AI Assistant Guide for ProjetoSiteRelogios

This file provides context and conventions for AI assistants (Claude, Copilot, etc.) working in this repository.

---

## Project Overview

**ProjetoSiteRelogios** is a web sales platform for high-quality watch replicas ("super clones"). The project is currently in its **initial setup phase** — no technology stack has been selected yet and no source code exists beyond this documentation.

- **Language of the project**: Portuguese (Brazil)
- **Domain**: E-commerce / Watch retail
- **Repository**: `00sTh/ProjetoSiteRelogios`
- **Primary branch**: `master`

---

## Current Repository State

| Item | Status |
|---|---|
| Source code | Not yet created |
| Framework/stack | Not yet decided |
| Build system | Not yet configured |
| Tests | Not yet configured |
| CI/CD | Not yet configured |
| Database | Not yet decided |
| Styling | Not yet decided |

The repository currently contains:
- `README.md` — minimal project description
- `CLAUDE.md` — this file

---

## Development Conventions (to be followed as the project grows)

### Branch Strategy

- `master` — stable, production-ready code
- Feature branches: `feature/<short-description>` (e.g., `feature/product-listing`)
- Bug fix branches: `fix/<short-description>`
- Always branch off `master` and open a pull request to merge back

### Commit Messages

Use clear, descriptive commit messages in English or Portuguese. Follow this format:

```
<type>: <short summary>

[optional body with more detail]
```

Common types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat: adicionar página de listagem de produtos`
- `fix: corrigir erro no carrinho de compras`
- `docs: atualizar CLAUDE.md com estrutura do projeto`

### Code Style

Until a linter/formatter is configured, follow these general principles:
- Use consistent indentation (2 or 4 spaces — decide once and enforce project-wide)
- Keep files small and focused on a single responsibility
- Use descriptive variable and function names
- Comment non-obvious logic, especially business rules related to product pricing or catalog

---

## Intended Product Features (based on project description)

The site is expected to include some or all of the following:
- Product catalog browsing (watches / super clones)
- Product detail pages with images and descriptions
- Shopping cart / checkout flow
- User registration and login
- Order management
- Contact / customer support page

AI assistants should keep these domain concepts in mind when suggesting code structures, component names, or database schemas.

---

## Tech Stack Decision Checklist

When the stack is decided, update this section and the conventions below:

- [ ] Front-end framework (e.g., React, Vue, plain HTML/CSS/JS)
- [ ] Back-end framework (e.g., Node.js/Express, Django, Laravel, Next.js)
- [ ] Database (e.g., PostgreSQL, MySQL, SQLite, MongoDB)
- [ ] CSS approach (e.g., Tailwind CSS, Bootstrap, CSS Modules, SASS)
- [ ] Hosting / deployment target (e.g., Vercel, Railway, VPS)
- [ ] Package manager (e.g., npm, yarn, pnpm, pip, composer)
- [ ] Linter / formatter (e.g., ESLint + Prettier, Flake8, PHP CS Fixer)
- [ ] Test framework (e.g., Jest, Pytest, PHPUnit)

---

## Instructions for AI Assistants

1. **Read this file first** before making any code changes or suggestions.
2. **Do not assume a stack** — always check whether `package.json`, `requirements.txt`, `composer.json`, or similar files exist before recommending tooling.
3. **Update this file** whenever the tech stack, project structure, or conventions change significantly.
4. **Work on the correct branch** — never push to `master` directly; use feature branches.
5. **Ask before adding dependencies** — this is an early-stage project and unnecessary dependencies should be avoided.
6. **Keep changes minimal and focused** — prefer small, targeted commits over large sweeping changes.
7. **Respect the domain language** — UI text, variable names, and comments may be in Portuguese; do not translate without being asked.

---

## Updating This File

Whenever a significant architectural decision is made, update the relevant section of this file in the same commit/PR that introduces the change. This file should always reflect the current state of the project.
