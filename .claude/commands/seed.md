Popule o banco de dados com dados iniciais usando o seed do AltheiaSite.

Passos:
1. Leia `prisma/seed.ts` para entender o que será criado
2. Confirme com o usuário se ele quer apagar os dados existentes ou só adicionar
3. Execute:
```bash
source /home/sth/.nvm/nvm.sh && cd /home/sth/AltheiaSite && npm run db:seed
```
4. Mostre o resumo do que foi criado (categorias, produtos, configurações)

⚠️ Aviso: O seed pode sobrescrever dados existentes dependendo de como está implementado.
Recomendado apenas para ambiente de desenvolvimento ou banco recém-criado.
