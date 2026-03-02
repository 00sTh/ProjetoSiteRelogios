Publique staging → main para fazer deploy em produção no AltheiaSite (Vercel).

⚠️ ATENÇÃO: Esta ação afeta o site em produção. Confirme com o usuário antes de executar.

Pré-requisitos (verifique tudo antes de avançar):
1. `cd /home/sth/AltheiaSite && git status` — working tree limpa
2. `git log staging..main` — staging deve estar à frente ou igual à main
3. `source /home/sth/.nvm/nvm.sh && npx tsc --noEmit` — sem erros de tipo
4. Pergunte ao usuário: "Confirma deploy para produção? (s/n)"

Deploy:
1. `git checkout main`
2. `git merge staging --no-ff -m "merge: staging → main (deploy vX.Y.Z)"`
3. `git push origin main`
4. Vercel detecta o push e faz deploy automático

Pós-deploy:
- Acesse https://altheia.vercel.app para confirmar que está no ar
- Se houver schema changes novas: rode `prisma db push` com DIRECT_URL do Neon
- Avise o usuário para testar: home, login Clerk, carrinho, checkout
