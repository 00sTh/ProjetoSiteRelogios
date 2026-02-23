# CLAUDE.md — ProjetoSiteRelogios

This file provides guidance for AI assistants (Claude and others) working on this codebase.

---

## Project Overview

**ProjetoSiteRelogios** is an e-commerce website for selling super-clone watches.
The site is written in Brazilian Portuguese and targets Portuguese-speaking customers.

**Current state:** Early-stage repository. Only a README exists.
All architecture decisions below represent the intended direction for the project.

---

## Repository Structure (Intended)

```
ProjetoSiteRelogios/
├── public/               # Static assets served directly
│   ├── images/           # Product and UI images
│   └── favicon.ico
├── src/
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page-level components / route views
│   ├── styles/           # Global CSS / theme variables
│   ├── data/             # Static product data or mock data
│   └── utils/            # Shared helper functions
├── CLAUDE.md             # This file
└── README.md             # Project description
```

Adjust this structure as the technology stack is chosen and the project grows.

---

## Technology Stack

No stack has been selected yet. When one is chosen, update this section.
Recommended candidates for a static/semi-static e-commerce site:

| Layer | Options to consider |
|-------|-------------------|
| Frontend | HTML/CSS/JS (vanilla), React, Vue, Astro |
| Styling | Tailwind CSS, plain CSS, SCSS |
| Backend/API | Node.js + Express, Next.js API routes, Supabase |
| Database | PostgreSQL (Supabase), SQLite, MongoDB |
| Hosting | Vercel, Netlify, GitHub Pages |

---

## Development Workflow

### Getting Started

Once the project is initialized, the standard workflow will be:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

Update these commands when a framework/toolchain is added to the project.

### Branch Strategy

- `master` — production-ready code; never commit directly
- `develop` — main integration branch for ongoing work
- `feature/<description>` — individual feature work
- `fix/<description>` — bug fixes
- `claude/<session-id>` — branches created by AI assistant sessions

All changes should be developed on a non-master branch and merged via pull request.

### Commit Message Convention

Use the following format:

```
<type>: <short description in Portuguese or English>

[optional body]
```

Types: `feat`, `fix`, `style`, `refactor`, `docs`, `chore`, `test`

Examples:
```
feat: adicionar página de listagem de produtos
fix: corrigir layout do carrinho no mobile
docs: atualizar CLAUDE.md com stack escolhida
```

---

## Key Conventions

### Language

- **UI text and comments**: Brazilian Portuguese preferred.
- **Variable names, function names, and code identifiers**: English (improves compatibility with libraries and tools).
- **Git commit messages**: Either Portuguese or English is acceptable; be consistent within a PR.

### Coding Style

- Prefer clarity over cleverness.
- Keep functions small and single-purpose.
- Avoid adding abstractions until there are at least two concrete use cases (no premature generalisation).
- Do not add comments that merely restate what the code does; only comment non-obvious logic.

### Product Data

- Watch product information (names, prices, descriptions) should be stored in a structured format (JSON or a database table), not hardcoded in markup.
- Images should be optimised before committing (prefer WebP, max ~200 KB per product image).

### Security

- Never commit API keys, passwords, or secrets. Use environment variables and a `.env` file (add `.env` to `.gitignore`).
- Validate and sanitise all user input on the server side.
- If a payment gateway is integrated, follow PCI-DSS guidelines; never handle raw card numbers yourself — delegate to the provider's SDK.

---

## AI Assistant Guidelines

When an AI assistant (e.g., Claude) works on this project:

1. **Read before editing.** Always read an existing file before modifying it.
2. **Stay minimal.** Only make changes that are directly requested or clearly necessary.
3. **No invented features.** Do not add functionality that was not asked for.
4. **Update this file** when significant architectural decisions are made (new framework chosen, new directory added, new conventions established).
5. **Use the correct branch.** All AI-driven changes must be committed to a `claude/<session-id>` branch and pushed before the session ends.
6. **Commit frequently.** Small, focused commits are easier to review and revert.
7. **Test changes.** Run available tests and linters before committing; do not commit if they fail.

---

## Updating This File

This file should be updated whenever:
- A technology stack is chosen and initialised.
- New top-level directories are added.
- New scripts are added to `package.json` (or equivalent).
- Team or project conventions change.
- A new AI session significantly extends the project.

---

*Last updated: 2026-02-23*
