Gerencie estoque de produtos via Prisma no AltheiaSite. Argumento: ação + produto + quantidade (ex: "atualize Sérum Elixir Noir para 50 unidades").

**Input:** $ARGUMENTS

**Ações disponíveis:**

**Ver estoque atual:**
```bash
npx prisma studio
# ou consulta direta:
```
Gere query Prisma para listar produtos com stock < threshold.

**Atualizar estoque:**
Gere o Server Action ou script para atualizar via `prisma.product.update`.

**Alerta de estoque baixo:**
Identifique produtos com `stock < 10` e liste no admin dashboard.

**Relatório:**
- Produtos mais vendidos (por OrderItem count)
- Produtos sem estoque (stock = 0, mas active = true)
- Produtos com estoque crítico (stock ≤ 5)

**Regras do projeto:**
- Estoque nunca vai negativo (validado em `addToCart` e `createOrder`)
- Decremento ocorre na transaction de criação do pedido
- Incremento (reposição) só via admin ou script
- Nunca alterar estoque diretamente no banco sem passar pela lógica de negócio
