import { PrismaClient } from "../src/generated/prisma";
import { PrismaNeon } from "@prisma/adapter-neon";
import "dotenv/config";

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .trim();
}

async function main() {
  console.log("🌱 Seeding SLC database...");

  // ── Categories ──────────────────────────────────────────────────────────────
  const relogios = await prisma.category.upsert({
    where: { slug: "relogios" },
    update: {},
    create: { name: "Relógios de Luxo", slug: "relogios", sortOrder: 1 },
  });
  const perfumes = await prisma.category.upsert({
    where: { slug: "perfumes" },
    update: {},
    create: { name: "Perfumes", slug: "perfumes", sortOrder: 2 },
  });
  const bolsas = await prisma.category.upsert({
    where: { slug: "bolsas" },
    update: {},
    create: { name: "Bolsas de Luxo", slug: "bolsas", sortOrder: 3 },
  });
  const sapatos = await prisma.category.upsert({
    where: { slug: "sapatos" },
    update: {},
    create: { name: "Sapatos de Luxo", slug: "sapatos", sortOrder: 4 },
  });

  // ── Brands ───────────────────────────────────────────────────────────────────
  const brandsData = [
    { name: "Rolex",                     categoryId: relogios.id, description: "Fundada em 1905, a Rolex é sinônimo de precisão e prestígio. Cada peça é uma obra-prima de relojoaria suíça." },
    { name: "Patek Philippe",            categoryId: relogios.id, description: "Desde 1839 em Genebra, a Patek Philippe é considerada a mais alta expressão da alta relojoaria." },
    { name: "Omega",                     categoryId: relogios.id, description: "A marca preferida de astronautas. Omega combina inovação técnica e elegância atemporal desde 1848." },
    { name: "Cartier",                   categoryId: relogios.id, description: "Joia da relojoaria francesa, a Cartier transforma cada relógio em uma peça de joalheria refinada." },
    { name: "IWC",                       categoryId: relogios.id, description: "International Watch Co. de Schaffhausen — engenharia suíça com alma artesanal desde 1868." },
    { name: "Audemars Piguet",           categoryId: relogios.id, description: "Criadores do Royal Oak, AP é sinônimo de ousadia e excelência na alta relojoaria desde 1875." },
    { name: "Tudor",                     categoryId: relogios.id, description: "A irmã robusta da Rolex. Tudor oferece qualidade suíça excepcional com design icônico." },
    { name: "TAG Heuer",                 categoryId: relogios.id, description: "Cronômetros de competição para quem vive intensamente. TAG Heuer — Don't Crack Under Pressure." },
    { name: "Tom Ford",                  categoryId: perfumes.id, description: "Fragrâncias ousadas e sedutoras que desafiam convenções. Tom Ford redefiniu o luxo olfativo contemporâneo." },
    { name: "Chanel",                    categoryId: perfumes.id, description: "A maison que criou o No. 5 e revolucionou a perfumaria. Elegância e feminilidade em estado puro." },
    { name: "Dior",                      categoryId: perfumes.id, description: "Da couture à perfumaria, Christian Dior criou fragrâncias que são patrimônio cultural da França." },
    { name: "Maison Francis Kurkdjian",  categoryId: perfumes.id, description: "O mais célebre nariz da perfumaria moderna. Kurkdjian cria obras olfativas para quem busca o raro." },
    { name: "Creed",                     categoryId: perfumes.id, description: "Fundada em 1760, Creed é a perfumaria das casas reais europeias. Tradição e exclusividade sem igual." },
    { name: "Amouage",                   categoryId: perfumes.id, description: "Do Sultanato de Omã para o mundo. Amouage cria as fragrâncias mais luxuosas e complexas do planeta." },
    { name: "Hermès",                    categoryId: bolsas.id,   description: "A Birkin e a Kelly são os maiores símbolos de status do mundo. Hermès eleva o couro à categoria de arte." },
    { name: "Louis Vuitton",             categoryId: bolsas.id,   description: "O monograma mais reconhecido do mundo. Louis Vuitton é a síntese do luxo francês desde 1854." },
    { name: "Chanel",                    categoryId: bolsas.id,   description: "O Flap 2.55 criado por Coco Chanel em 1955 permanece o acessório mais icônico da moda mundial." },
    { name: "Gucci",                     categoryId: bolsas.id,   description: "Maison florentina que une tradição artesanal italiana com estética contemporânea e arrojada." },
    { name: "Bottega Veneta",            categoryId: bolsas.id,   description: "O intrecciato, técnica de trançado exclusiva, elevou Bottega Veneta ao patamar do luxo absoluto." },
    { name: "Prada",                     categoryId: bolsas.id,   description: "Desde 1913 em Milão, Prada desafia e redefine o conceito de bom gosto no universo do luxo." },
    { name: "Christian Louboutin",       categoryId: sapatos.id,  description: "A sola vermelha mais famosa do mundo. Christian Louboutin transforma sapatos em objetos de desejo absoluto." },
    { name: "Jimmy Choo",                categoryId: sapatos.id,  description: "Favorito de celebridades e royalties. Jimmy Choo é sinônimo de glamour e feminilidade refinada." },
    { name: "Manolo Blahnik",            categoryId: sapatos.id,  description: "O designer que Sex and the City eternizou. Manolo Blahnik cria os sapatos mais desejados do mundo." },
    { name: "Salvatore Ferragamo",       categoryId: sapatos.id,  description: "O sapateiro das estrelas de Hollywood. Ferragamo une artesanato italiano incomparável e elegância clássica." },
  ];

  const brandMap: Record<string, string> = {};
  for (const b of brandsData) {
    const baseSlug = slugify(b.name);
    const catSlug = b.categoryId === relogios.id ? "rel" : b.categoryId === perfumes.id ? "perf" : b.categoryId === bolsas.id ? "bol" : "sap";
    const slug = `${catSlug}-${baseSlug}`;
    const brand = await prisma.brand.upsert({
      where: { slug },
      update: { description: b.description },
      create: { name: b.name, slug, description: b.description, categoryId: b.categoryId },
    });
    brandMap[`${b.categoryId}:${b.name}`] = brand.id;
  }
  console.log("✅ Brands seeded");

  // ── Products ─────────────────────────────────────────────────────────────────
  type ProductSeed = {
    name: string;
    brand: string;
    category: string;
    price: number;
    comparePrice?: number;
    stock: number;
    featured: boolean;
    description: string;
    images: string[];
    attributes: Record<string, string>;
  };

  const watchImg1 = "https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800&q=90";
  const watchImg2 = "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800&q=90";
  const watchImg3 = "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800&q=90";
  const watchImg4 = "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=800&q=90";
  const watchImg5 = "https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=800&q=90";
  const perfImg1  = "https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800&q=90";
  const perfImg2  = "https://images.unsplash.com/photo-1590156562745-5c0b13f06a5a?w=800&q=90";
  const perfImg3  = "https://images.unsplash.com/photo-1541643600914-78b084683702?w=800&q=90";
  const perfImg4  = "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800&q=90";
  const bagImg1   = "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=90";
  const bagImg2   = "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&q=90";
  const bagImg3   = "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=90";
  const bagImg4   = "https://images.unsplash.com/photo-1566150905458-1bf1ffe05bd6?w=800&q=90";
  const shoeImg1  = "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=90";
  const shoeImg2  = "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&q=90";
  const shoeImg3  = "https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=800&q=90";
  const shoeImg4  = "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=800&q=90";

  const products: ProductSeed[] = [
    // ── RELÓGIOS ─────────────────────────────────────────────────────────────
    { name: "Rolex Submariner Date Oystersteel", brand: `${relogios.id}:Rolex`, category: relogios.id, price: 89500, stock: 3, featured: true,
      description: "O ícone máximo da relojoaria esportiva. O Submariner Date em aço Oystersteel é resistente a 300m, com bisel Cerachrom preto e mostrador lacre preto. Movimento Calibre 3235.",
      images: [watchImg1, watchImg2], attributes: { movimento: "Automático, Calibre 3235", diametro: "41mm", material: "Oystersteel", cristal: "Safira", resistencia: "300m" } },

    { name: "Rolex Daytona Ouro Branco", brand: `${relogios.id}:Rolex`, category: relogios.id, price: 245000, stock: 1, featured: true,
      description: "O cronógrafo mais desejado do mundo. Daytona em ouro branco 18k com mostrador preto e escala taquimétrica. O relógio dos campeões de Le Mans.",
      images: [watchImg3, watchImg4], attributes: { movimento: "Automático, Calibre 4130", diametro: "40mm", material: "Ouro Branco 18k", cristal: "Safira", resistencia: "100m" } },

    { name: "Rolex GMT-Master II Pepsi Jubilee", brand: `${relogios.id}:Rolex`, category: relogios.id, price: 115000, stock: 2, featured: false,
      description: "Criado para pilotos da Pan Am, o GMT-Master II com bisel 'Pepsi' azul-vermelho em Jubilee é o relógio de viajantes de elite.",
      images: [watchImg5], attributes: { movimento: "Automático, Calibre 3285", diametro: "40mm", material: "Oystersteel", cristal: "Safira", resistencia: "100m" } },

    { name: "Rolex Datejust 41 Arlequim", brand: `${relogios.id}:Rolex`, category: relogios.id, price: 98000, stock: 2, featured: false,
      description: "O Datejust é o relógio clássico por excelência. Este modelo 41mm com mostrador Arlequim multicolor em ouro Rolesor é a ousadia rara dentro da linha clássica.",
      images: [watchImg2], attributes: { movimento: "Automático, Calibre 3235", diametro: "41mm", material: "Rolesor (Aço + Ouro Amarelo)", cristal: "Safira", resistencia: "100m" } },

    { name: "Patek Philippe Nautilus 5711 Azul", brand: `${relogios.id}:Patek Philippe`, category: relogios.id, price: 580000, stock: 1, featured: true,
      description: "O relógio mais cobiçado do século XXI. O Nautilus 5711 com mostrador azul-gradiente é a obra-prima de Gerald Genta. Lista de espera de anos nas boutiques oficiais.",
      images: [watchImg3, watchImg1], attributes: { movimento: "Automático, Cal. 26-330 S C", diametro: "40mm", material: "Aço Inoxidável", cristal: "Safira", resistencia: "120m" } },

    { name: "Patek Philippe Aquanaut 5168G Ouro Branco", brand: `${relogios.id}:Patek Philippe`, category: relogios.id, price: 320000, stock: 1, featured: false,
      description: "O Aquanaut em ouro branco 18k com mostrador verde-gradiente é a versão aventureira da maison de Genebra. Pulseira tropical texturizada.",
      images: [watchImg4], attributes: { movimento: "Automático, Cal. 324 S C", diametro: "38mm", material: "Ouro Branco 18k", cristal: "Safira", resistencia: "120m" } },

    { name: "Omega Seamaster Diver 300M Azul", brand: `${relogios.id}:Omega`, category: relogios.id, price: 32000, comparePrice: 35000, stock: 5, featured: false,
      description: "O relógio de James Bond desde 1995. Seamaster Diver 300M com mostrador azul, bisel cerâmico e pulseira em aço. Resistente a 300m, movimento Co-Axial Master Chronometer.",
      images: [watchImg1], attributes: { movimento: "Automático Co-Axial, Cal. 8800", diametro: "42mm", material: "Aço Inoxidável", cristal: "Safira", resistencia: "300m" } },

    { name: "Omega Speedmaster Moonwatch Professional", brand: `${relogios.id}:Omega`, category: relogios.id, price: 38500, stock: 4, featured: true,
      description: "O único relógio certificado pela NASA para missões lunares. Speedmaster Moonwatch com movimento manual Calibre 3861. Na lua desde 1969.",
      images: [watchImg2, watchImg5], attributes: { movimento: "Manual, Calibre 3861", diametro: "42mm", material: "Aço Inoxidável", cristal: "Hesalita", resistencia: "50m" } },

    { name: "Cartier Santos de Cartier Aço e Ouro", brand: `${relogios.id}:Cartier`, category: relogios.id, price: 42000, stock: 3, featured: false,
      description: "Criado em 1904 para Alberto Santos Dumont, o Santos é o primeiro relógio de pulso masculino. Caixa quadrada icônica com parafusos aparentes dourados.",
      images: [watchImg4], attributes: { movimento: "Automático 1847 MC", diametro: "39,8mm", material: "Aço e Ouro Amarelo", cristal: "Safira", resistencia: "100m" } },

    { name: "Cartier Tank Must ADLC", brand: `${relogios.id}:Cartier`, category: relogios.id, price: 28000, stock: 6, featured: false,
      description: "Inspirado nos tanques da Primeira Guerra, o Tank é o relógio mais copiado da história. Elegância geométrica atemporal em aço ADLC.",
      images: [watchImg5], attributes: { movimento: "Quartzo Calibre 157", diametro: "33,7x25,5mm", material: "Aço ADLC", cristal: "Safira", resistencia: "30m" } },

    { name: "Audemars Piguet Royal Oak 15202 Aço", brand: `${relogios.id}:Audemars Piguet`, category: relogios.id, price: 420000, stock: 1, featured: true,
      description: "O relógio esportivo de luxo original, criado por Gerald Genta em 1972. Caixa octagonal icônica em aço polido e escovado com mostrador 'Grande Tapisserie'.",
      images: [watchImg3], attributes: { movimento: "Automático Cal. 2121", diametro: "39mm", material: "Aço Inoxidável", cristal: "Safira", resistencia: "50m" } },

    { name: "Tudor Black Bay 58 Azul", brand: `${relogios.id}:Tudor`, category: relogios.id, price: 18500, stock: 8, featured: false,
      description: "Homenagem ao histórico Submariner dos anos 50, o Black Bay 58 tem tamanho vintage de 39mm com mostrador azul e movimento MT5402 com reserva de 70h.",
      images: [watchImg1], attributes: { movimento: "Automático MT5402", diametro: "39mm", material: "Aço Inoxidável", cristal: "Safira", resistencia: "200m" } },

    { name: "TAG Heuer Monaco Gulf", brand: `${relogios.id}:TAG Heuer`, category: relogios.id, price: 24500, stock: 4, featured: false,
      description: "Imortalizado por Steve McQueen em Le Mans, o Monaco Gulf Edition em azul e laranja é o cronógrafo mais cinematográfico da história.",
      images: [watchImg4], attributes: { movimento: "Automático Cal. Heuer 02", diametro: "39mm", material: "Aço Inoxidável", cristal: "Safira", resistencia: "100m" } },

    // ── PERFUMES ─────────────────────────────────────────────────────────────
    { name: "Tom Ford Black Orchid EDP 100ml", brand: `${perfumes.id}:Tom Ford`, category: perfumes.id, price: 1890, stock: 12, featured: true,
      description: "O lançamento que revolucionou a perfumaria em 2006. Black Orchid é dark, sensual e hipnótico. Notas de orquídea preta, especiarias e patchouli.",
      images: [perfImg1, perfImg3], attributes: { concentracao: "EDP", volume: "100ml", notas_topo: "Bergamota, Especiarias", notas_coracao: "Orquídea Preta, Trufa, Ylang-Ylang", notas_fundo: "Patchouli, Sândalo, Âmbar", familia: "Oriental Floral" } },

    { name: "Tom Ford Tobacco Vanille EDP 50ml", brand: `${perfumes.id}:Tom Ford`, category: perfumes.id, price: 2350, stock: 8, featured: false,
      description: "Um dos perfumes de nicho mais populares do mundo. Tobacco Vanille evoca a atmosfera de um clube inglês dos anos 40 — tabaco, especiarias e baunilha cremosa.",
      images: [perfImg2], attributes: { concentracao: "EDP", volume: "50ml", notas_topo: "Tabaco, Especiarias", notas_coracao: "Tabaco, Baunilha, Cacau", notas_fundo: "Âmbar, Benzoin, Baunilha", familia: "Oriental Gourmand" } },

    { name: "Tom Ford Oud Wood EDP 50ml", brand: `${perfumes.id}:Tom Ford`, category: perfumes.id, price: 2650, stock: 6, featured: false,
      description: "O Oud Wood tornou o oud — ingrediente mais precioso da perfumaria árabe — acessível ao Ocidente. Madeiroso, defumado e absolutamente viciante.",
      images: [perfImg4], attributes: { concentracao: "EDP", volume: "50ml", notas_topo: "Oud, Cardamomo, Pimenta Chinesa", notas_coracao: "Sândalo, Vetiver, Tonka", notas_fundo: "Âmbar, Almíscar", familia: "Oriental Madeiroso" } },

    { name: "Tom Ford Lost Cherry EDP 50ml", brand: `${perfumes.id}:Tom Ford`, category: perfumes.id, price: 2800, stock: 5, featured: true,
      description: "Sedutor e irresistível. Lost Cherry captura a essência de uma cereja madura com licor de amêndoas, cola de tonka e âmbar — o cheiro da tentação.",
      images: [perfImg3], attributes: { concentracao: "EDP", volume: "50ml", notas_topo: "Cereja Preta, Licor de Cereja", notas_coracao: "Cola de Tonka, Amêndoa Amarga", notas_fundo: "Baunilha, Âmbar, Almíscar", familia: "Oriental Gourmand" } },

    { name: "Chanel No. 5 EDP 100ml", brand: `${perfumes.id}:Chanel`, category: perfumes.id, price: 1450, stock: 15, featured: true,
      description: "O perfume mais famoso da história. Criado em 1921, o No. 5 é uma obra-prima de aldeídos, jasmim e ylang-ylang. 'Apenas com Chanel No. 5' — Marilyn Monroe.",
      images: [perfImg3, perfImg1], attributes: { concentracao: "EDP", volume: "100ml", notas_topo: "Aldeídos, Neroli, Ylang-Ylang", notas_coracao: "Rosa, Jasmim, Íris", notas_fundo: "Sândalo, Âmbar, Algália, Baunilha", familia: "Floral Aldeídico" } },

    { name: "Chanel Coco Mademoiselle EDP 100ml", brand: `${perfumes.id}:Chanel`, category: perfumes.id, price: 1380, stock: 10, featured: false,
      description: "O perfume da mulher moderna e independente. Coco Mademoiselle abre com bergamota vibrante e evolui para um coração de patchouli e rosa.",
      images: [perfImg2], attributes: { concentracao: "EDP", volume: "100ml", notas_topo: "Bergamota, Laranja", notas_coracao: "Rosa, Jasmim, Mimosa, Patchouli", notas_fundo: "Vetiver, Âmbar, Almíscar Branco", familia: "Chypre Floral" } },

    { name: "Chanel Bleu de Chanel EDP 100ml", brand: `${perfumes.id}:Chanel`, category: perfumes.id, price: 1290, stock: 14, featured: false,
      description: "O masculino mais vendido da Chanel. Bleu é um fougère madeiroso com cítricos vibrantes, cedro e incenso — a elegância masculina destilada.",
      images: [perfImg4], attributes: { concentracao: "EDP", volume: "100ml", notas_topo: "Toranja, Bergamota, Menta", notas_coracao: "Jasmim, Gengibre, Noz-moscada", notas_fundo: "Cedro, Sândalo, Incenso, Vetiver", familia: "Aromático Madeiroso" } },

    { name: "Dior Sauvage EDP 100ml", brand: `${perfumes.id}:Dior`, category: perfumes.id, price: 1280, stock: 20, featured: true,
      description: "O perfume masculino mais vendido do mundo. Sauvage evoca a vastidão das planícies desertas. Fresco, especiado e magneticamente masculino.",
      images: [perfImg2, perfImg1], attributes: { concentracao: "EDP", volume: "100ml", notas_topo: "Pimenta de Calawama, Bergamota", notas_coracao: "Lavanda, Gengibre, Vetiver, Patchouli", notas_fundo: "Ambroxan, Cedro", familia: "Fougère Aromático" } },

    { name: "Dior J'adore EDP 100ml", brand: `${perfumes.id}:Dior`, category: perfumes.id, price: 1350, stock: 12, featured: false,
      description: "O símbolo da feminilidade dourada. J'adore é um buquê floral luminoso com jasmim, rosa e ylang-ylang. Charlize Theron eternizou este ícone.",
      images: [perfImg3], attributes: { concentracao: "EDP", volume: "100ml", notas_topo: "Pêra, Melão", notas_coracao: "Orquídea, Violeta, Rosa, Jasmim, Ylang-Ylang", notas_fundo: "Almíscar, Baunilha, Âmbar", familia: "Floral" } },

    { name: "Dior Miss Dior EDP 100ml", brand: `${perfumes.id}:Dior`, category: perfumes.id, price: 1290, stock: 9, featured: false,
      description: "A essência de um buquê de peônia e rosa damascena. Miss Dior em sua versão EDP é feminino, poético e absolutamente francês.",
      images: [perfImg4], attributes: { concentracao: "EDP", volume: "100ml", notas_topo: "Bergamota, Toranja", notas_coracao: "Peônia, Rosa Damascena", notas_fundo: "Âmbar, Patchouli, Almíscar", familia: "Floral Chypre" } },

    { name: "Maison Francis Kurkdjian Baccarat Rouge 540 EDP 70ml", brand: `${perfumes.id}:Maison Francis Kurkdjian`, category: perfumes.id, price: 3850, stock: 5, featured: true,
      description: "O perfume de nicho mais fotografado da última década. Baccarat Rouge 540 — açafrão, amberwood e cedro se fundem em algo absolutamente único.",
      images: [perfImg3, perfImg2], attributes: { concentracao: "EDP", volume: "70ml", notas_topo: "Açafrão, Jasmim", notas_coracao: "Amberwood, Amargris", notas_fundo: "Cedro, Almíscar", familia: "Floral Amadeirado" } },

    { name: "Maison Francis Kurkdjian Grand Soir EDP 70ml", brand: `${perfumes.id}:Maison Francis Kurkdjian`, category: perfumes.id, price: 2950, stock: 6, featured: false,
      description: "Para as noites que ficam na memória. Grand Soir é um oriental quente de couro, âmbar e baunilha — o perfume das grandes ocasiões.",
      images: [perfImg1], attributes: { concentracao: "EDP", volume: "70ml", notas_topo: "Bergamota, Cardamomo", notas_coracao: "Almíscar", notas_fundo: "Âmbar, Baunilha, Couro, Benzoin", familia: "Oriental Ambarado" } },

    { name: "Creed Aventus EDP 100ml", brand: `${perfumes.id}:Creed`, category: perfumes.id, price: 4200, stock: 4, featured: true,
      description: "Inspirado em Napoleão Bonaparte, Aventus é o perfume do líder, do conquistador. Abacaxi, bétula fumada e almíscar criam a fragrância masculina mais imitada do mundo.",
      images: [perfImg4, perfImg1], attributes: { concentracao: "EDP", volume: "100ml", notas_topo: "Abacaxi, Groselha Preta, Maçã, Bergamota", notas_coracao: "Bétula, Patchouli, Jasmim, Rosa", notas_fundo: "Almíscar, Âmbar, Carvalho", familia: "Chypre Frutal" } },

    { name: "Amouage Interlude Man EDP 100ml", brand: `${perfumes.id}:Amouage`, category: perfumes.id, price: 2800, stock: 4, featured: false,
      description: "O perfume que captura a transição entre dois mundos. Interlude Man é um oriental especiado com incenso, oud e âmbar — a obra-prima da Amouage.",
      images: [perfImg2], attributes: { concentracao: "EDP", volume: "100ml", notas_topo: "Incenso, Orégano, Bergamota", notas_coracao: "Oud, Ambrete, Patchouli", notas_fundo: "Âmbar, Sândalo, Feno", familia: "Oriental Especiado" } },

    // ── BOLSAS ───────────────────────────────────────────────────────────────
    { name: "Hermès Birkin 30 Togo Noir", brand: `${bolsas.id}:Hermès`, category: bolsas.id, price: 185000, stock: 1, featured: true,
      description: "A bolsa mais famosa do mundo. Birkin 30 em couro Togo preto com ferragens douradas. Lista de espera de anos. Um investimento que valoriza mais que ouro.",
      images: [bagImg1, bagImg2], attributes: { material: "Couro Togo", dimensoes: "30x22x16cm", fecho: "Duas correias com cadeado", ferragens: "Douradas (GHW)" } },

    { name: "Hermès Kelly 28 Sellier Epsom", brand: `${bolsas.id}:Hermès`, category: bolsas.id, price: 165000, stock: 1, featured: true,
      description: "Imortalizada pela Princesa Grace de Mônaco em 1956, a Kelly Sellier em couro Epsom é a bolsa mais elegante já criada.",
      images: [bagImg3, bagImg4], attributes: { material: "Couro Epsom", dimensoes: "28x22x10cm", fecho: "Trapézio com cadeado", ferragens: "Prateadas (PHW)" } },

    { name: "Hermès Constance 18 Etoupe", brand: `${bolsas.id}:Hermès`, category: bolsas.id, price: 98000, stock: 1, featured: false,
      description: "A bolsa favorita de Jackie Kennedy. Constance 18 em couro swift cinza etoupe — um ícone de elegância discreta que atravessa décadas.",
      images: [bagImg2], attributes: { material: "Couro Swift", dimensoes: "18x14x5cm", fecho: "H em metal dourado", ferragens: "Douradas (GHW)" } },

    { name: "Hermès Picotin Lock 18 Vert Criquet", brand: `${bolsas.id}:Hermès`, category: bolsas.id, price: 52000, stock: 2, featured: false,
      description: "A bolsa balde mais charmosa de Hermès. Picotin Lock 18 em couro Clemence verde cricket com cadeado em prata. Casual e sofisticada ao mesmo tempo.",
      images: [bagImg4], attributes: { material: "Couro Clemence", dimensoes: "18x13x19cm", fecho: "Cadeado", ferragens: "Prateadas (PHW)" } },

    { name: "Louis Vuitton Neverfull MM Monogram", brand: `${bolsas.id}:Louis Vuitton`, category: bolsas.id, price: 14500, stock: 4, featured: false,
      description: "A bolsa mais vendida da história do luxo. Neverfull MM em Monogram Canvas — o ícone do estilo parisienne que nunca sai de moda.",
      images: [bagImg1], attributes: { material: "Canvas Monogram", dimensoes: "31x28x14cm", fecho: "Aberto com alças laterais" } },

    { name: "Louis Vuitton Capucines MM Noir", brand: `${bolsas.id}:Louis Vuitton`, category: bolsas.id, price: 52000, stock: 2, featured: true,
      description: "O jóia da coroa da LV. Capucines MM em couro taurillon preto com a flor Capucines bordada. Elegância parisiense em estado puro.",
      images: [bagImg2, bagImg3], attributes: { material: "Couro Taurillon", dimensoes: "31,5x20x11cm", fecho: "Zíper + botão de pressão" } },

    { name: "Louis Vuitton Speedy Bandoulière 25 Damier", brand: `${bolsas.id}:Louis Vuitton`, category: bolsas.id, price: 12800, stock: 5, featured: false,
      description: "A versão moderna do clássico Speedy com alça de ombro. Damier Ebène com interior vermelho — a elegância do xadrez marrom LV.",
      images: [bagImg4], attributes: { material: "Canvas Damier Ebène", dimensoes: "25x19x15cm", fecho: "Zíper" } },

    { name: "Chanel Classic Flap Medium Caviar Preto", brand: `${bolsas.id}:Chanel`, category: bolsas.id, price: 72000, stock: 2, featured: true,
      description: "A 2.55 redesenhada por Karl Lagerfeld em 1983 com o fecho CC dourado. A Classic Flap em couro caviar é a bolsa mais valorizada de todos os tempos.",
      images: [bagImg3, bagImg1], attributes: { material: "Couro Caviar Acolchoado", dimensoes: "25,5x15,5x6,5cm", fecho: "CC Dourado", corrente: "Dupla em couro entretecido" } },

    { name: "Chanel Boy Bag Medium Couro de Cordeiro", brand: `${bolsas.id}:Chanel`, category: bolsas.id, price: 68000, stock: 1, featured: false,
      description: "Criada por Karl Lagerfeld em 2011, a Boy é o oposto da Flap — ousada, estruturada e rock. Em couro de cordeiro preto com corrente ruthenium.",
      images: [bagImg2], attributes: { material: "Couro de Cordeiro", dimensoes: "25x14x8cm", fecho: "Clipe de pressão CC", corrente: "Simples ruthenium" } },

    { name: "Gucci Dionysus GG Supreme", brand: `${bolsas.id}:Gucci`, category: bolsas.id, price: 18500, stock: 3, featured: false,
      description: "Inspirada no deus do vinho, a Dionysus em canvas GG com fecho de tigre dourado é a peça mais icônica da Gucci contemporânea.",
      images: [bagImg4], attributes: { material: "Canvas GG Supreme", dimensoes: "28x17x9cm", fecho: "Fivela Tigre Dourada" } },

    { name: "Bottega Veneta Cassette Maxi Intrecciato", brand: `${bolsas.id}:Bottega Veneta`, category: bolsas.id, price: 32000, stock: 2, featured: true,
      description: "A reinvenção contemporânea do intrecciato. A Cassette com maxi-trançado em couro azul paon é a bolsa favorita da geração que rejeita logos.",
      images: [bagImg1, bagImg3], attributes: { material: "Couro de Bezerro Intrecciato", dimensoes: "27x18x5cm", fecho: "Aba magnética" } },

    { name: "Prada Galleria Saffiano Nero", brand: `${bolsas.id}:Prada`, category: bolsas.id, price: 24000, stock: 3, featured: false,
      description: "A bolsa de trabalho de uma mulher com poder. Galleria em couro Saffiano preto com logo triangular de metal — estruturada, elegante e absolutamente funcional.",
      images: [bagImg2], attributes: { material: "Couro Saffiano", dimensoes: "38x27x17cm", fecho: "Duplo zíper" } },

    // ── SAPATOS ──────────────────────────────────────────────────────────────
    { name: "Christian Louboutin So Kate 120 Preto", brand: `${sapatos.id}:Christian Louboutin`, category: sapatos.id, price: 5800, stock: 6, featured: true,
      description: "A musa do criador. So Kate com salto stiletto de 120mm em couro envernizado preto e a inconfundível sola vermelha. O símbolo máximo de poder feminino.",
      images: [shoeImg1, shoeImg2], attributes: { material: "Couro Envernizado", salto: "120mm", bico: "Fino", sola: "Vermelha Louboutin" } },

    { name: "Christian Louboutin Pigalle 100 Nude", brand: `${sapatos.id}:Christian Louboutin`, category: sapatos.id, price: 5200, stock: 4, featured: false,
      description: "O clássico infalível de Christian Louboutin. Pigalle em couro nude com salto de 100mm alonga e afina as pernas. A escolha das mulheres que sabem o que querem.",
      images: [shoeImg3], attributes: { material: "Couro", salto: "100mm", bico: "Fino", sola: "Vermelha Louboutin" } },

    { name: "Christian Louboutin Bianca 140 Preto", brand: `${sapatos.id}:Christian Louboutin`, category: sapatos.id, price: 6200, stock: 3, featured: false,
      description: "A Bianca 140 é o maximalismo de Louboutin em sua forma mais pura. Plataforma de 40mm com salto de 140mm — para quem não passa despercebida.",
      images: [shoeImg4], attributes: { material: "Couro Envernizado", salto: "140mm", plataforma: "40mm", bico: "Fino", sola: "Vermelha Louboutin" } },

    { name: "Jimmy Choo Anouk 100 Preto", brand: `${sapatos.id}:Jimmy Choo`, category: sapatos.id, price: 3800, stock: 5, featured: true,
      description: "O clássico de Jimmy Choo. Anouk de bico fino em couro preto com salto agulha de 100mm — elegância e sofisticação para todas as ocasiões.",
      images: [shoeImg1], attributes: { material: "Couro", salto: "100mm", bico: "Fino" } },

    { name: "Jimmy Choo Romy 85 Nude", brand: `${sapatos.id}:Jimmy Choo`, category: sapatos.id, price: 3400, stock: 7, featured: false,
      description: "O favorito das noivas de todo o mundo. Romy 85 em couro nude — a cor que alonga as pernas e combina com tudo. Favorito de Kate Middleton.",
      images: [shoeImg2], attributes: { material: "Couro", salto: "85mm", bico: "Fino" } },

    { name: "Jimmy Choo Lance 100 Glitter", brand: `${sapatos.id}:Jimmy Choo`, category: sapatos.id, price: 4200, stock: 3, featured: false,
      description: "Para as noites que merecem brilho. Lance 100 em glitter prata é o scarpin que transforma qualquer look em look de passarela.",
      images: [shoeImg4], attributes: { material: "Glitter", salto: "100mm", bico: "Fino" } },

    { name: "Manolo Blahnik BB 105 Cetim Marfim", brand: `${sapatos.id}:Manolo Blahnik`, category: sapatos.id, price: 4500, stock: 4, featured: true,
      description: "O protagonista de Sex and the City. BB em cetim marfim com laço — Carrie Bradshaw ensinou ao mundo inteiro que há sapatos que mudam a vida.",
      images: [shoeImg3, shoeImg1], attributes: { material: "Cetim", salto: "105mm", bico: "Fino", detalhe: "Laço" } },

    { name: "Manolo Blahnik Hangisi 70 Azul Real", brand: `${sapatos.id}:Manolo Blahnik`, category: sapatos.id, price: 5100, stock: 3, featured: false,
      description: "O sapato que Carrie usou no final de SATC. Hangisi em cetim azul real com broche de cristal — o sapato de noiva mais cobiçado do século XXI.",
      images: [shoeImg2], attributes: { material: "Cetim", salto: "70mm", bico: "Quadrado", detalhe: "Broche de Cristal" } },

    { name: "Manolo Blahnik Chaos 105 Leopardo", brand: `${sapatos.id}:Manolo Blahnik`, category: sapatos.id, price: 4800, stock: 2, featured: false,
      description: "A mule icônica de Manolo em estampa leopardo. Chaos 105 em cetim animal print — o animal do glamour em sua expressão mais sofisticada.",
      images: [shoeImg4], attributes: { material: "Cetim Animal Print", salto: "105mm", bico: "Fino" } },

    { name: "Salvatore Ferragamo Vara Bow Pump", brand: `${sapatos.id}:Salvatore Ferragamo`, category: sapatos.id, price: 3200, comparePrice: 3800, stock: 6, featured: false,
      description: "O sapato mais icônico de Ferragamo. Vara com o laço característico em couro envernizado preto — elegância italiana clássica que atravessa gerações.",
      images: [shoeImg1], attributes: { material: "Couro Envernizado", salto: "55mm", bico: "Redondo", detalhe: "Laço Vara" } },

    { name: "Salvatore Ferragamo Varina Couro Marrom", brand: `${sapatos.id}:Salvatore Ferragamo`, category: sapatos.id, price: 2850, stock: 8, featured: false,
      description: "O sapato plano perfeito para o dia a dia luxuoso. Varina em couro marrom — a ballerina que se torna companheira fiel das mulheres elegantes.",
      images: [shoeImg3], attributes: { material: "Couro", salto: "Plano", bico: "Arredondado", detalhe: "Laço Vara" } },
  ];

  let count = 0;
  for (const p of products) {
    const brandId = brandMap[p.brand];
    if (!brandId) { console.warn(`⚠ Brand not found: ${p.brand}`); continue; }
    const slug = slugify(p.name);
    await prisma.product.upsert({
      where: { slug },
      update: {},
      create: {
        name: p.name,
        slug,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice ?? null,
        stock: p.stock,
        images: p.images,
        featured: p.featured,
        active: true,
        attributes: p.attributes as any,
        brandId,
        categoryId: p.category,
      },
    });
    count++;
  }

  console.log(`✅ ${count} products seeded`);
  console.log("🎉 SLC database ready!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
