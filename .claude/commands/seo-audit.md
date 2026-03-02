Auditoria SEO completa do AltheiaSite. Argumento: URL ou página específica (ex: "/products", "/sobre-nos").

**Input:** $ARGUMENTS

**Passos:**
1. Leia o arquivo da página indicada em `src/app/`
2. Verifique: metadata (title, description, og:*), heading structure, alt texts, canonical
3. Analise sitemap.ts e robots.ts para cobertura de indexação
4. Verifique se imagens usam `next/image` com `alt` preenchido
5. Cheque se há `export const metadata` em todas as páginas importantes
6. Verifique structured data (schema.org)
7. Liste problemas encontrados por severidade (crítico / médio / baixo)

**Output:**
- Score estimado SEO (0-100)
- Lista de problemas com arquivo:linha
- Correções prontas para aplicar
- Páginas sem metadata definida
