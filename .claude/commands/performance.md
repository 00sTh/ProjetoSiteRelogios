Otimize Core Web Vitals e performance de uma página do AltheiaSite. Argumento: caminho da página (ex: "/", "/products", "/products/[slug]").

**Input:** $ARGUMENTS

**Analise o arquivo da página e componentes usados:**

1. **LCP (Largest Contentful Paint)**
   - Identifique o maior elemento visual (hero image, banner)
   - Verifique `priority` em `next/image` para LCP element
   - Cheque se há `fetchPriority="high"` no hero

2. **CLS (Cumulative Layout Shift)**
   - Toda imagem tem `width` e `height` definidos?
   - Fontes com `display: swap`?
   - Skeleton loaders em loading.tsx?

3. **INP / FID (Interação)**
   - Componentes client desnecessários ("use client" sem necessidade)?
   - Event handlers pesados sem debounce?

4. **Bundle size**
   - Imports pesados sem lazy loading?
   - framer-motion: usar `LazyMotion` + `domAnimation`?

5. **DB queries (render time)**
   - Queries em paralelo com `Promise.all`?
   - Cache com React `cache()` aplicado?
   - `skipCount` onde não precisa de total?

**Output:** lista de otimizações com arquivo:linha + código corrigido pronto para aplicar.
