/**
 * Seed do banco de dados — produtos exemplo LuxImport
 * Execução: npm run db:seed
 *
 * Schema SQLite: images é String (JSON serializado)
 * Schema PostgreSQL: images é String[] nativo
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function img(url: string): string {
  // SQLite: serializa JSON; PostgreSQL: retorna array (ajustado via cast no upsert)
  return JSON.stringify([url]);
}

async function main() {
  console.log("🌱 Iniciando seed LuxImport...");

  // ── Categorias ──────────────────────────────────────────────────────────────
  const relogios = await prisma.category.upsert({
    where: { slug: "relogios" },
    update: {},
    create: {
      name: "Relógios",
      slug: "relogios",
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80",
    },
  });

  const acessorios = await prisma.category.upsert({
    where: { slug: "acessorios" },
    update: {},
    create: {
      name: "Acessórios",
      slug: "acessorios",
      imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&q=80",
    },
  });

  const eletronicos = await prisma.category.upsert({
    where: { slug: "eletronicos" },
    update: {},
    create: {
      name: "Eletrônicos",
      slug: "eletronicos",
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80",
    },
  });

  const moda = await prisma.category.upsert({
    where: { slug: "moda" },
    update: {},
    create: {
      name: "Moda",
      slug: "moda",
      imageUrl: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&q=80",
    },
  });

  const bolsas = await prisma.category.upsert({
    where: { slug: "bolsas" },
    update: {},
    create: {
      name: "Bolsas & Carteiras",
      slug: "bolsas",
      imageUrl: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&q=80",
    },
  });

  console.log("✅ 5 categorias criadas");

  // ── Produtos ─────────────────────────────────────────────────────────────────
  const produtos = [
    // ── Relógios ────────────────────────────────────────────────────────────────
    {
      name: "Relógio Swiss Movement Automático",
      slug: "relogio-swiss-movement-automatico",
      description:
        "Relógio masculino com movimento automático suíço. Caixa de aço inoxidável 316L, vidro safira antirrisco, pulseira de couro italiano marrom. Resistente à água 50m. Garantia internacional de 2 anos.",
      price: 2890,
      stock: 8,
      featured: true,
      categoryId: relogios.id,
      images: img("https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=85"),
    },
    {
      name: "Relógio Feminino Slim Rose Gold",
      slug: "relogio-feminino-slim-rose-gold",
      description:
        "Elegância e sofisticação em um design ultraslim. Caixa 34mm em aço inoxidável com banho rose gold, mostrador branco com índices diamantados, pulseira de aço. Movimento quartzo japonês de alta precisão.",
      price: 1490,
      stock: 12,
      featured: true,
      categoryId: relogios.id,
      images: img("https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=800&q=85"),
    },
    {
      name: "Smartwatch Premium Pro",
      slug: "smartwatch-premium-pro",
      description:
        "Smartwatch de última geração com monitoramento de saúde avançado: ECG, SpO2, frequência cardíaca. Tela AMOLED 1.9\", GPS integrado, 5ATM resistente à água, bateria 7 dias. Compatible com iOS e Android.",
      price: 1990,
      stock: 15,
      featured: false,
      categoryId: relogios.id,
      images: img("https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&q=85"),
    },
    {
      name: "Relógio Cronógrafo Sport Titanium",
      slug: "relogio-cronografo-sport-titanium",
      description:
        "Cronógrafo esportivo de alta performance em titânio leve e resistente. Movimento cronógrafo mecânico, bisel cerâmico, pulseira de borracha, resistente a 200m. Para aventureiros exigentes.",
      price: 4290,
      stock: 5,
      featured: false,
      categoryId: relogios.id,
      images: img("https://images.unsplash.com/photo-1619134778706-7015533a6150?w=800&q=85"),
    },

    // ── Acessórios ─────────────────────────────────────────────────────────────
    {
      name: "Óculos de Sol Aviador Polarizado",
      slug: "oculos-sol-aviador-polarizado",
      description:
        "Óculos aviador com armação metálica dourada e lentes polarizadas UV400. Reduz reflexos e proporciona visão cristalina. Inclui estojo de couro e pano de limpeza. Proteção total contra raios UVA e UVB.",
      price: 890,
      stock: 20,
      featured: true,
      categoryId: acessorios.id,
      images: img("https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=85"),
    },
    {
      name: "Cinto de Couro Legítimo Full Grain",
      slug: "cinto-couro-legitimo-full-grain",
      description:
        "Cinto masculino em couro full grain italiano, o mais nobre tipo de couro. Fivela em aço inoxidável escovado. Disponível em 3 cores: preto, marrom escuro e conhaque. Durabilidade garantida por décadas.",
      price: 380,
      stock: 30,
      featured: false,
      categoryId: acessorios.id,
      images: img("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=85"),
    },
    {
      name: "Porta-Documentos Executivo",
      slug: "porta-documentos-executivo",
      description:
        "Pasta executiva em couro italiano com compartimentos para laptop 15\", tablet, documentos e canetas. Fecho magnético, alça de ombro removível. Design minimalista para o profissional moderno.",
      price: 1290,
      stock: 10,
      featured: false,
      categoryId: acessorios.id,
      images: img("https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&q=85"),
    },

    // ── Eletrônicos ─────────────────────────────────────────────────────────────
    {
      name: "Fone de Ouvido Noise Cancelling Hi-Fi",
      slug: "fone-ouvido-noise-cancelling-hifi",
      description:
        "Fone over-ear com cancelamento ativo de ruído de última geração. Drivers de 40mm de alta resolução, conexão sem fio Bluetooth 5.3, autonomia de 30h, dobrável para viagem. Som de referência audiófilo.",
      price: 2490,
      stock: 18,
      featured: true,
      categoryId: eletronicos.id,
      images: img("https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=85"),
    },
    {
      name: "Câmera de Ação 8K Ultra HD",
      slug: "camera-acao-8k-ultra-hd",
      description:
        "Câmera de ação com filmagem 8K/30fps e 4K/120fps para slow motion extremo. Estabilização HyperSmooth 6.0, resistente à água sem case até 10m, autonomia 2h. Ideal para aventura e esportes.",
      price: 3290,
      stock: 7,
      featured: true,
      categoryId: eletronicos.id,
      images: img("https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=85"),
    },
    {
      name: "Carregador Sem Fio MagSafe Premium",
      slug: "carregador-sem-fio-magsafe-premium",
      description:
        "Estação de carregamento sem fio 3 em 1: smartphone, smartwatch e earbuds simultaneamente. Potência de 15W, compatível com todos os dispositivos Qi. Base em alumínio e silicone premium.",
      price: 490,
      stock: 25,
      featured: false,
      categoryId: eletronicos.id,
      images: img("https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&q=85"),
    },

    // ── Moda ───────────────────────────────────────────────────────────────────
    {
      name: "Blazer Masculino Premium Wool Blend",
      slug: "blazer-masculino-premium-wool-blend",
      description:
        "Blazer slim fit em blend de lã merino e cashmere. Forro de seda, botões de chifre natural, dois bolsos frontais. Versatilidade para o escritório ou jantares especiais. Disponível em cinza, azul marinho e carvão.",
      price: 1890,
      stock: 15,
      featured: true,
      categoryId: moda.id,
      images: img("https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=85"),
    },
    {
      name: "Vestido Feminino Midi Luxo",
      slug: "vestido-feminino-midi-luxo",
      description:
        "Vestido midi elegante em crepe de seda italiana. Decote V delicado, corte evasê fluido, zíper invisible nas costas. Perfeito para ocasiões especiais e eventos formais. Forro em seda.",
      price: 1290,
      stock: 20,
      featured: false,
      categoryId: moda.id,
      images: img("https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=85"),
    },
    {
      name: "Camiseta Premium Pima Cotton",
      slug: "camiseta-premium-pima-cotton",
      description:
        "Camiseta em 100% algodão Pima peruano, a fibra mais fina e macia do mundo. Corte regular fit, caimento perfeito, respirável e durável. Disponível em 8 cores neutras. O básico elevado ao máximo.",
      price: 290,
      stock: 50,
      featured: false,
      categoryId: moda.id,
      images: img("https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=85"),
    },

    // ── Bolsas & Carteiras ─────────────────────────────────────────────────────
    {
      name: "Bolsa Tote de Couro Artesanal",
      slug: "bolsa-tote-couro-artesanal",
      description:
        "Bolsa tote grande confeccionada artesanalmente em couro vegetal italiano. Interior forrado em linho com bolso com zíper e porta-cartões. Alças de ombro resistentes. Capacidade generosa para o dia a dia.",
      price: 2190,
      stock: 8,
      featured: true,
      categoryId: bolsas.id,
      images: img("https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=85"),
    },
    {
      name: "Carteira Slim RFID Blocking",
      slug: "carteira-slim-rfid-blocking",
      description:
        "Carteira ultrafina em couro napa com proteção RFID integrada para segurança dos seus cartões. 8 slots para cartões, 2 compartimentos para notas, plaqueta metálica de identificação. Design minimalista.",
      price: 480,
      stock: 35,
      featured: true,
      categoryId: bolsas.id,
      images: img("https://images.unsplash.com/photo-1627123424574-724758594785?w=800&q=85"),
    },
    {
      name: "Mochila Executiva Anti-Furto",
      slug: "mochila-executiva-anti-furto",
      description:
        "Mochila para notebook 15.6\" com fechos anti-furto, carregador USB embutido e entrada para fone de ouvido. 30L de capacidade, impermeável, costas acolchoadas ergonômicas. Ideal para viagens de negócios.",
      price: 890,
      stock: 12,
      featured: false,
      categoryId: bolsas.id,
      images: img("https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=85"),
    },
  ];

  for (const produto of produtos) {
    await prisma.product.upsert({
      where: { slug: produto.slug },
      update: {},
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      create: produto as any,
    });
    console.log(`  📦 ${produto.name}`);
  }

  console.log(`\n✅ ${produtos.length} produtos criados`);

  // ── SiteSettings ──────────────────────────────────────────────────────────────
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      heroTitle: "Importados de Luxo Direto para Você",
      heroSubtitle: "Os melhores produtos do mundo com curadoria rigorosa",
      whyTitle: "Por que LuxImport?",
      whySubtitle: "Qualidade, autenticidade e sofisticação em cada produto.",
      aboutTitle: "Nossa História",
      aboutText: "A LuxImport nasceu da paixão por trazer ao Brasil o que há de melhor no mercado internacional. Curadoria rigorosa, autenticidade garantida e experiência de compra premium.",
      newsletterTitle: "Ofertas Exclusivas",
      newsletterSubtitle: "Cadastre-se e seja o primeiro a saber das novidades",
      benefit1Title: "Frete grátis acima de R$299",
      benefit1Text: "Entrega em todo o Brasil sem custo adicional.",
      benefit2Title: "Devolução em 30 dias",
      benefit2Text: "Satisfação garantida ou seu dinheiro de volta.",
      benefit3Title: "Pagamento seguro",
      benefit3Text: "Transações criptografadas e dados protegidos.",
      shippingFreeThreshold: 299,
    },
  });

  console.log("✅ SiteSettings criado");
  console.log("\n🎉 Seed LuxImport concluído com sucesso!");
  console.log("   16 produtos em 5 categorias (Relógios, Acessórios, Eletrônicos, Moda, Bolsas & Carteiras)");
}

main()
  .catch((e) => {
    console.error("❌ Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
