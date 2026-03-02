Sincronize o schema Prisma com o banco Neon (produção).

Use quando: adicionar/remover campos no schema.prisma, criar tabelas novas, alterar tipos.

Passos:
1. Leia `prisma/schema.prisma` para confirmar que está correto (provider = postgresql)
2. Confirme com o usuário o que mudou no schema
3. Execute:
```bash
source /home/sth/.nvm/nvm.sh && cd /home/sth/AltheiaSite
DIRECT_URL="postgresql://neondb_owner:npg_YsKua7IcRP4t@ep-damp-tree-aihieket.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require" \
DATABASE_URL="postgresql://neondb_owner:npg_YsKua7IcRP4t@ep-damp-tree-aihieket-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=15" \
npx prisma db push
```
4. Se aparecer aviso de data loss: descreva ao usuário o que será perdido e aguarde confirmação antes de usar `--accept-data-loss`
5. Confirme: `npx prisma generate` para atualizar o client

⚠️ Regras críticas:
- SEMPRE use DIRECT_URL (sem -pooler) para migrations — URL pooled quebra o push
- NUNCA rode `prisma migrate dev` em produção — use apenas `db push`
- Após push em produção: o Vercel precisa ser redeploy se o schema mudou estruturalmente
