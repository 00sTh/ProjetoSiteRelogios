Planeje a implementação de uma nova feature para o AltheiaSite. Argumento: descrição da feature desejada.

**Input:** $ARGUMENTS

**Analise o codebase e gere plano:**

1. **Entendimento**
   - O que a feature faz (user story)
   - Quem usa (cliente / admin / ambos)

2. **Impacto no schema Prisma**
   - Novos modelos ou campos necessários?
   - Relations afetadas?
   - Comando `db push` necessário?

3. **Arquivos a criar/modificar**
   - Páginas Next.js (app router)
   - Server Actions
   - Componentes (server vs client)
   - API routes (se necessário)

4. **Checklist de implementação** (ordenado por dependência)
   - [ ] Schema Prisma
   - [ ] Server Actions com Zod validation
   - [ ] UI components
   - [ ] Integração no fluxo existente
   - [ ] Testes smoke

5. **Riscos e decisões**
   - Breaking changes?
   - Performance impact?
   - Auth: quem pode acessar?

**Convenções do projeto:**
- Server Components por padrão, "use client" mínimo
- Preços sempre no servidor
- Zod em todas as Server Actions
- Visual: emerald #0A3D2F + gold #C9A227
