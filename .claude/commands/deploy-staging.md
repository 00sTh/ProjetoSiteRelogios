Faça commit das mudanças e publique na branch staging do AltheiaSite.

Passos:
1. `cd /home/sth/AltheiaSite && git status` — veja o que mudou
2. `npx tsc --noEmit` — só avance se não houver erros de tipo
3. Stage os arquivos relevantes (não adicione .env.local, secrets, arquivos de build)
4. Crie um commit convencional (feat/fix/chore) descrevendo o que foi feito
5. `git checkout staging && git merge main` (se estiver na main com commits novos)
   OU `git add ... && git commit && git push origin staging` (se já estiver na staging)
6. Confirme: `git log origin/staging..HEAD --oneline` para ver o que foi publicado

Regras importantes:
- NUNCA faça push direto para main
- Sempre rode tsc antes de commitar
- Mensagens de commit em português ou inglês, formato: `tipo: descrição curta`
