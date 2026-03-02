Rode verificação completa do projeto AltheiaSite:

1. TypeScript: `source /home/sth/.nvm/nvm.sh && cd /home/sth/AltheiaSite && npx tsc --noEmit`
2. Se houver erros de tipo, leia os arquivos envolvidos, corrija e rode novamente
3. Smoke tests: `TEST_BASE_URL=http://localhost:3000 npx playwright test --reporter=list`
   - Se o servidor não estiver rodando, avise o usuário
4. Mostre um resumo: quantos testes passaram, quantos falharam, e lista de erros se houver
