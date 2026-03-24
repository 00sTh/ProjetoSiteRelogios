import { PrismaClient } from '../src/generated/prisma';
import { PrismaNeon } from '@prisma/adapter-neon';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter } as any);

cloudinary.config({
  cloud_name: 'dwmkytbxf',
  api_key: '269497256568459',
  api_secret: 'UxOUTUUClCtlLj1DG9tBY9nu3Pg',
});

const SERPER_KEY = 'cd997fc33c9a6729c8adef285e619d284e0e5be6';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function searchImages(query: string): Promise<string[]> {
  try {
    const res = await fetch('https://google.serper.dev/images', {
      method: 'POST',
      headers: {
        'X-API-KEY': SERPER_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ q: query + ' luxury official', num: 5 }),
    });
    const data = (await res.json()) as any;
    return ((data.images || []) as any[])
      .slice(0, 3)
      .map((img: any) => img.imageUrl)
      .filter(Boolean);
  } catch (e) {
    console.error('  [Serper error]', e);
    return [];
  }
}

async function uploadFromUrl(url: string, folder: string): Promise<string | null> {
  try {
    const result = await cloudinary.uploader.upload(url, {
      folder,
      resource_type: 'image',
    });
    return result.secure_url;
  } catch {
    return null;
  }
}

interface ProductSpec {
  brandSlug: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  featured?: boolean;
  attributes: Record<string, string>;
  searchQuery: string;
}

const PRODUCTS_TO_CREATE: ProductSpec[] = [
  // ─── RELÓGIOS ───────────────────────────────────────────────────────────────
  {
    brandSlug: 'rel-rolex',
    name: 'Rolex Datejust 36mm Jubilé Branco',
    description:
      'O Datejust 36 é o relógio clássico por excelência da Rolex, com mostrador branco lacado e pulseira Jubilé em Oystersteel. Sua janela de data com lupa Cyclops é inconfundível, símbolo de elegância atemporal. Certificado pelo COSC como cronômetro de alta precisão.',
    price: 52000,
    comparePrice: 65000,
    featured: true,
    attributes: {
      Movimento: 'Rolex Calibre 3235 (automático)',
      Diâmetro: '36mm',
      'Material caixa': 'Oystersteel (aço 904L)',
      Vidro: 'Safira com anti-reflexo',
      'Resistência à água': '100 metros',
    },
    searchQuery: 'Rolex Datejust 36 white dial Jubilee',
  },
  {
    brandSlug: 'rel-patek-philippe',
    name: 'Patek Philippe Calatrava 5196 Ouro Amarelo',
    description:
      'O Calatrava 5196 representa a essência do design minimalista de Patek Philippe em ouro amarelo 18k, com mostrador prateado e indices aplicados. Considerado o relógio de pulso mais puro já criado, encarna séculos de tradição relojoeira suíça. Uma obra de arte destinada a atravessar gerações.',
    price: 185000,
    comparePrice: 220000,
    featured: true,
    attributes: {
      Movimento: 'Patek Philippe 215 PS (manual)',
      Diâmetro: '37mm',
      'Material caixa': 'Ouro Amarelo 18k',
      Vidro: 'Safira',
      'Resistência à água': '30 metros',
    },
    searchQuery: 'Patek Philippe Calatrava 5196 yellow gold',
  },
  {
    brandSlug: 'rel-patek-philippe',
    name: 'Patek Philippe Aquanaut 5167 Aço',
    description:
      'O Aquanaut 5167 combina sofisticação contemporânea com espírito aventureiro em aço inoxidável. Seu mostrador em relevo xadrez e pulseira de borracha composta são icônicos. É o relógio esportivo de luxo definitivo da maison de Genebra.',
    price: 145000,
    comparePrice: 175000,
    featured: false,
    attributes: {
      Movimento: 'Patek Philippe 324 S C (automático)',
      Diâmetro: '40mm',
      'Material caixa': 'Aço inoxidável',
      Vidro: 'Safira com anti-reflexo',
      'Resistência à água': '120 metros',
    },
    searchQuery: 'Patek Philippe Aquanaut 5167 steel',
  },
  {
    brandSlug: 'rel-omega',
    name: 'Omega Constellation 38mm Aço e Ouro',
    description:
      'O Constellation combina precisão e elegância com sua caixa bicolor em aço e ouro Sedna 18k. As famosas garras que emolduram o mostrador são assinatura inconfundível desta linha lendária. Um relógio que vestiu presidentes e estrelas de cinema por décadas.',
    price: 32000,
    comparePrice: 41000,
    featured: false,
    attributes: {
      Movimento: 'Omega Co-Axial Master Chronometer 8800',
      Diâmetro: '38mm',
      'Material caixa': 'Aço e Ouro Sedna 18k',
      Vidro: 'Safira',
      'Resistência à água': '100 metros',
    },
    searchQuery: 'Omega Constellation 38mm steel gold',
  },
  {
    brandSlug: 'rel-cartier',
    name: 'Cartier Ballon Bleu 42mm Aço',
    description:
      'O Ballon Bleu de Cartier em aço escovado é reconhecível à primeira vista pela coroa protegida em forma de cabochon azul safira. Seu mostrador prateado com ponteiros de espada guilhochê irradia elegância parisiense. Um ícone moderno do luxo relojoeiro.',
    price: 42000,
    comparePrice: 53000,
    featured: true,
    attributes: {
      Movimento: 'Cartier 1847 MC (automático)',
      Diâmetro: '42mm',
      'Material caixa': 'Aço inoxidável escovado',
      Vidro: 'Safira anti-risco',
      'Resistência à água': '30 metros',
    },
    searchQuery: 'Cartier Ballon Bleu 42mm steel',
  },
  {
    brandSlug: 'rel-iwc',
    name: 'IWC Portugieser Chronograph IW371617',
    description:
      'O Portugieser Chronograph da IWC é um ícone da relojoaria clássica com mostradores de cronógrafo de 30 minutos e 12 horas em design de estilo bolso. Seu mostrador branco com indices arábicos é elegância pura de Schaffhausen. Um cronógrafo artesanal que une tradição náutica portuguesa à precisão suíça.',
    price: 48000,
    comparePrice: 61000,
    featured: true,
    attributes: {
      Movimento: 'IWC Calibre 69355 (automático)',
      Diâmetro: '41mm',
      'Material caixa': 'Aço inoxidável',
      Vidro: 'Safira dupla face anti-reflexo',
      'Resistência à água': '30 metros',
    },
    searchQuery: 'IWC Portugieser Chronograph IW371617',
  },
  {
    brandSlug: 'rel-iwc',
    name: "IWC Pilot's Watch Mark XX Aço",
    description:
      'O Pilot\'s Watch Mark XX honra décadas de história aviadora da IWC com seu mostrador preto estilo cockpit e ponteiro adicional central. Construído com resistência anti-magnética e iluminação por Super-LumiNova para legibilidade em qualquer condição de voo. O relógio de piloto de referência para aviadores exigentes.',
    price: 29500,
    comparePrice: 37000,
    featured: false,
    attributes: {
      Movimento: 'IWC Calibre 32111 (automático)',
      Diâmetro: '40mm',
      'Material caixa': 'Aço inoxidável',
      Vidro: 'Safira anti-reflexo',
      'Resistência à água': '60 metros',
    },
    searchQuery: "IWC Pilot's Watch Mark XX black dial",
  },
  {
    brandSlug: 'rel-iwc',
    name: 'IWC Portofino Automatic 40mm',
    description:
      'O Portofino Automatic captura a leveza mediterrânea da cidade italiana que o batizou com seu design minimalista e elegante. A caixa fina em aço com mostrador branco e ponteiros tipo Dauphine é refinamento em estado puro. Perfeito para ocasiões formais onde a sutileza é a maior sofisticação.',
    price: 26000,
    comparePrice: 33000,
    featured: false,
    attributes: {
      Movimento: 'IWC Calibre 35111 (automático)',
      Diâmetro: '40mm',
      'Material caixa': 'Aço inoxidável',
      Vidro: 'Safira com anti-reflexo',
      'Resistência à água': '30 metros',
    },
    searchQuery: 'IWC Portofino Automatic 40mm white dial',
  },
  {
    brandSlug: 'rel-audemars-piguet',
    name: 'Audemars Piguet Royal Oak Offshore 44mm Titânio',
    description:
      'O Royal Oak Offshore 44mm em titânio grau 5 é a expressão máxima do esporte de alto desempenho da Audemars Piguet. Seu design robusto com coroa e pulseiras em borracha texturizada e bisel octagonal oversized são definitivamente audaciosos. Uma declaração de poder e precisão relojoeira.',
    price: 195000,
    comparePrice: 240000,
    featured: true,
    attributes: {
      Movimento: 'AP Calibre 3126/3840 (automático)',
      Diâmetro: '44mm',
      'Material caixa': 'Titânio Grau 5',
      Vidro: 'Safira',
      'Resistência à água': '100 metros',
    },
    searchQuery: 'Audemars Piguet Royal Oak Offshore 44mm titanium',
  },
  {
    brandSlug: 'rel-audemars-piguet',
    name: 'Audemars Piguet Millenary 4101 Ouro Rosa',
    description:
      'O Millenary 4101 em ouro rosa 18k apresenta uma caixa oval distinta que oferece uma janela única para o movimento esqueleto visível no mostrador. É a expressão mais artística da manufatura de Le Brassus, onde cada componente é uma obra de arte em miniatura. Um relógio para os apreciadores da alta relojoaria.',
    price: 165000,
    comparePrice: 200000,
    featured: false,
    attributes: {
      Movimento: 'AP Calibre 4101 (manual, esqueleto)',
      Diâmetro: '47 x 40mm (oval)',
      'Material caixa': 'Ouro Rosa 18k',
      Vidro: 'Safira',
      'Resistência à água': '20 metros',
    },
    searchQuery: 'Audemars Piguet Millenary 4101 rose gold skeleton',
  },
  {
    brandSlug: 'rel-tudor',
    name: 'Tudor Pelagos FXD Marine Nationale',
    description:
      'O Pelagos FXD foi desenvolvido em parceria com a Marinha Nacional Francesa e apresenta sistema de pulseira com fixações diretas ao canhão para uso com traje de mergulho. Sua caixa em titânio e mostrador azul com Super-LumiNova garantem legibilidade nas profundezas. Uma ferramenta técnica de mergulho com DNA militar.',
    price: 19500,
    comparePrice: 25000,
    featured: true,
    attributes: {
      Movimento: 'Tudor MT5602 (automático, COSC)',
      Diâmetro: '42mm',
      'Material caixa': 'Titânio',
      Vidro: 'Safira com anti-reflexo',
      'Resistência à água': '500 metros',
    },
    searchQuery: 'Tudor Pelagos FXD Marine Nationale blue',
  },
  {
    brandSlug: 'rel-tudor',
    name: 'Tudor Heritage Chrono Preto',
    description:
      'O Heritage Chrono revive o espírito dos cronógrafos de corrida Tudor dos anos 1970 com seu mostrador preto bicolor e contador vermelho vibrante. Sua pulseira de couro marrom vintage com fivela de borboleta completa o visual retro-esportivo inconfundível. Um homenagem apaixonante à era dourada dos relógios de corrida.',
    price: 16500,
    comparePrice: 21000,
    featured: false,
    attributes: {
      Movimento: 'ETA Valjoux 7753 (automático)',
      Diâmetro: '42mm',
      'Material caixa': 'Aço inoxidável',
      Vidro: 'Safira',
      'Resistência à água': '100 metros',
    },
    searchQuery: 'Tudor Heritage Chrono black dial vintage',
  },
  {
    brandSlug: 'rel-tag-heuer',
    name: 'TAG Heuer Carrera Chronograph Calibre Heuer 02',
    description:
      'O Carrera Chronograph com Calibre Heuer 02 é o cronógrafo desportivo definitivo da TAG Heuer, tributário da lendária herança nas corridas de Fórmula 1. Seu mostrador skeleton parcial revela o intrincado mecanismo de cronógrafo in-house. Para aqueles que vivem cada segundo como uma vitória.',
    price: 28000,
    comparePrice: 35000,
    featured: true,
    attributes: {
      Movimento: 'TAG Heuer Calibre Heuer 02 (automático)',
      Diâmetro: '44mm',
      'Material caixa': 'Aço inoxidável',
      Vidro: 'Safira anti-arranhão',
      'Resistência à água': '100 metros',
    },
    searchQuery: 'TAG Heuer Carrera Chronograph Calibre Heuer 02',
  },
  {
    brandSlug: 'rel-tag-heuer',
    name: 'TAG Heuer Aquaracer Professional 300',
    description:
      'O Aquaracer Professional 300 é o relógio de mergulho de alta performance da TAG Heuer, resistente a 300 metros com bisel unidirecional de 12 lados. Seu mostrador azul com escala de mergulho e ponteiro luminoso garantem segurança nas profundezas. Companheiro ideal para mergulhadores profissionais e amantes do mar.',
    price: 14500,
    comparePrice: 18500,
    featured: false,
    attributes: {
      Movimento: 'TAG Heuer Calibre 5 (automático)',
      Diâmetro: '43mm',
      'Material caixa': 'Aço inoxidável',
      Vidro: 'Safira com anti-reflexo',
      'Resistência à água': '300 metros',
    },
    searchQuery: 'TAG Heuer Aquaracer Professional 300 blue',
  },

  // ─── PERFUMES ───────────────────────────────────────────────────────────────
  {
    brandSlug: 'perf-maison-francis-kurkdjian',
    name: 'Maison Francis Kurkdjian Aqua Celestia EDT 70ml',
    description:
      'Aqua Celestia é uma ode à leveza etérea com seu coração aquático de mimosa e folha de violeta sobre base de almíscar branco. Francis Kurkdjian criou uma fragrância que evoca a pureza do céu ao amanhecer com luminosidade incomparável. Sofisticação efervescente em cada borrifada.',
    price: 1850,
    comparePrice: 2300,
    featured: false,
    attributes: {
      'Família olfativa': 'Aquática Floral',
      'Notas de topo': 'Limão, Marinha',
      'Notas de coração': 'Mimosa, Violeta',
      'Notas de fundo': 'Almíscar Branco, Âmbar',
      Concentração: 'EDT (Eau de Toilette)',
      Volume: '70ml',
    },
    searchQuery: 'Maison Francis Kurkdjian Aqua Celestia bottle',
  },
  {
    brandSlug: 'perf-creed',
    name: 'Creed Silver Mountain Water EDP 100ml',
    description:
      'Silver Mountain Water é a interpretação de Creed sobre a pureza das águas alpinas suíças, uma fragrância aquática-aromática fresca e intemporal. Suas notas de bergamota, chá verde e almíscar criam uma aura de sofisticação masculina despretensiosa. Usado por celebridades e chefes de estado ao redor do mundo.',
    price: 3200,
    comparePrice: 4100,
    featured: false,
    attributes: {
      'Família olfativa': 'Aquática Aromática',
      'Notas de topo': 'Bergamota, Mandarina',
      'Notas de coração': 'Chá Verde, Neroli',
      'Notas de fundo': 'Almíscar, Sândalo, Âmbar Branco',
      Concentração: 'EDP (Eau de Parfum)',
      Volume: '100ml',
    },
    searchQuery: 'Creed Silver Mountain Water fragrance bottle',
  },
  {
    brandSlug: 'perf-creed',
    name: 'Creed Green Irish Tweed EDP 100ml',
    description:
      'Green Irish Tweed é a fragrância mais icônica da Creed, criada em 1985 e adotada por Cary Grant como seu perfume exclusivo. Suas notas verdes de verbenela, íris de Florença e sândalo da Virgínia criam um frescor verde sofisticado e masculino. Uma lenda viva da perfumaria artesanal de alto luxo.',
    price: 3500,
    comparePrice: 4400,
    featured: false,
    attributes: {
      'Família olfativa': 'Verde Aromática',
      'Notas de topo': 'Verbenela, Íris',
      'Notas de coração': 'Violeta, Orris',
      'Notas de fundo': 'Sândalo da Virgínia, Almíscar',
      Concentração: 'EDP (Eau de Parfum)',
      Volume: '100ml',
    },
    searchQuery: 'Creed Green Irish Tweed perfume bottle',
  },
  {
    brandSlug: 'perf-amouage',
    name: 'Amouage Reflection Woman EDP 100ml',
    description:
      'Reflection Woman de Amouage é uma fragrância floral branca de suprema elegância, com coração de narciso absoluto e rosa branca sobre base de sândalo e almíscar. A casa real de Omã criou uma composição que reflete pureza e feminilidade sofisticada em cada faceta. Uma joia olfativa para mulheres que valorizam a sutileza do extraordinário.',
    price: 2800,
    comparePrice: 3500,
    featured: false,
    attributes: {
      'Família olfativa': 'Floral Branca',
      'Notas de topo': 'Rosa Branca, Neroli',
      'Notas de coração': 'Narciso Absoluto, Ylang-Ylang',
      'Notas de fundo': 'Sândalo, Almíscar Branco, Cedro',
      Concentração: 'EDP (Eau de Parfum)',
      Volume: '100ml',
    },
    searchQuery: 'Amouage Reflection Woman perfume bottle',
  },
  {
    brandSlug: 'perf-amouage',
    name: 'Amouage Jubilation XXV Man EDP 100ml',
    description:
      'Jubilation XXV Man é considerado um dos grandes perfumes masculinos de todos os tempos pela perfumaria Amouage de Omã. Sua complexidade oriental com notas de incenso, mirra, cassis e madeiras preciosas cria uma sillage majestosa e memorável. Uma fragrância que celebra a opulência da antiga rota das especiarias.',
    price: 3100,
    comparePrice: 3900,
    featured: false,
    attributes: {
      'Família olfativa': 'Oriental Aromática',
      'Notas de topo': 'Cassis, Pimenta Preta, Bergamota',
      'Notas de coração': 'Incenso, Rosa, Orquídea',
      'Notas de fundo': 'Mirra, Âmbar, Oud, Patchouli',
      Concentração: 'EDP (Eau de Parfum)',
      Volume: '100ml',
    },
    searchQuery: 'Amouage Jubilation XXV Man perfume bottle',
  },

  // ─── BOLSAS ─────────────────────────────────────────────────────────────────
  {
    brandSlug: 'bol-chanel',
    name: 'Chanel 2.55 Reissue 227 Aged Calfskin',
    description:
      'A 2.55 Reissue ressuscitou em 2005 o design original criado por Mademoiselle Chanel em fevereiro de 1955, com sua borracha aged calfskin bordeaux e ferragens envelhecidas Ruthenium. O forro bordeaux com bolso secreto e a alça de corrente dupla são detalhes históricos inconfundíveis. Uma peça de colecionador que representa o ápice da herança Chanel.',
    price: 38000,
    comparePrice: 48000,
    featured: true,
    attributes: {
      Material: 'Aged Calfskin (couro de vitelo envelhecido)',
      Dimensões: '25 x 15 x 8cm (tamanho 227)',
      Ferragens: 'Ruthenium envelhecido',
      Origem: 'França',
    },
    searchQuery: 'Chanel 2.55 Reissue 227 aged calfskin bag',
  },
  {
    brandSlug: 'bol-gucci',
    name: 'Gucci Marmont Matelassé Medium Shoulder Bag',
    description:
      'A GG Marmont Matelassé é a bolsa contemporânea mais desejada da Gucci, com seu couro matelassê acolchoado em chevron e fecho duplo G dourado inconfundível. O interior em microfibra suede rosa e o design de ombro versátil tornam esta peça perfeita para o dia a dia de alto luxo. Uma ode à elegância italiana com DNA moderno.',
    price: 14500,
    comparePrice: 18500,
    featured: true,
    attributes: {
      Material: 'Couro Matelassê Chevron',
      Dimensões: '26 x 15 x 7cm',
      Ferragens: 'Dourado vintage',
      Origem: 'Itália',
    },
    searchQuery: 'Gucci Marmont Matelasse medium shoulder bag black',
  },
  {
    brandSlug: 'bol-gucci',
    name: 'Gucci Ophidia GG Medium Tote',
    description:
      'A Ophidia GG Medium Tote celebra a herança da Gucci com sua tela GG Supreme e detalhe verde-vermelho-verde do Web icônico da casa. O couro de camurça natural que guarnece a alça e os painéis reforça o caráter artesanal florentino. Uma tote bag espaçosa que carrega décadas de legado italiano com elegância cotidiana.',
    price: 11500,
    comparePrice: 14500,
    featured: false,
    attributes: {
      Material: 'Tela GG Supreme com detalhes em couro',
      Dimensões: '38 x 28 x 14cm',
      Ferragens: 'Dourado',
      Origem: 'Itália',
    },
    searchQuery: 'Gucci Ophidia GG medium tote bag',
  },
  {
    brandSlug: 'bol-bottega-veneta',
    name: 'Bottega Veneta Jodie Intrecciato',
    description:
      'A Jodie é uma das criações mais sensuais de Bottega Veneta, com seu formato de meia-lua em Intrecciato tecido à mão que abraça suavemente o corpo. O nó torcido que define o fecho é puramente artesanal, sem qualquer logo visível — o luxo que se reconhece pela qualidade. Uma declaração silenciosa de bom gosto impecável.',
    price: 16800,
    comparePrice: 21000,
    featured: true,
    attributes: {
      Material: 'Couro Nappa Intrecciato (trançado à mão)',
      Dimensões: '32 x 23 x 13cm',
      Ferragens: 'Nenhuma (fechamento por nó)',
      Origem: 'Itália',
    },
    searchQuery: 'Bottega Veneta Jodie Intrecciato bag',
  },
  {
    brandSlug: 'bol-bottega-veneta',
    name: 'Bottega Veneta Pouch Clutch Intrecciato',
    description:
      'O Pouch Clutch de Bottega Veneta é uma das clutches mais copiadas e nunca igualadas, com seu couro maxi Intrecciato macio que se molda suavemente às mãos. Sem logo, sem ferragens — apenas o artesanato italiano em sua expressão mais pura. Uma peça versátil que eleva qualquer look do casual ao red carpet.',
    price: 12500,
    comparePrice: 15800,
    featured: false,
    attributes: {
      Material: 'Couro Nappa Maxi Intrecciato',
      Dimensões: '35 x 21 x 2cm',
      Ferragens: 'Nenhuma',
      Origem: 'Itália',
    },
    searchQuery: 'Bottega Veneta Pouch clutch intrecciato padded',
  },
  {
    brandSlug: 'bol-prada',
    name: 'Prada Re-Edition 2005 Re-Nylon',
    description:
      'A Re-Edition 2005 ressuscita um clássico do arquivo Prada dos anos 2000 no inovador Re-Nylon, material sustentável criado a partir de plástico oceânico regenerado. Seu design de dois compartimentos e alça de ombro regulável com detalhe triangular de esmalte são reconhecíveis à distância. Moda de vanguarda com consciência ambiental.',
    price: 9800,
    comparePrice: 12500,
    featured: true,
    attributes: {
      Material: 'Re-Nylon reciclado com guarnição em couro Saffiano',
      Dimensões: '22 x 18 x 8cm',
      Ferragens: 'Prata escovada',
      Origem: 'Itália',
    },
    searchQuery: 'Prada Re-Edition 2005 Re-Nylon black bag',
  },
  {
    brandSlug: 'bol-prada',
    name: 'Prada Cleo Shoulder Bag Brushed Leather',
    description:
      'A Cleo Shoulder Bag em couro acetinado escovado apresenta o design futurista e estruturado que define a estética contemporânea da Prada. Sua silhueta de crescente com fecho magnético coberto pelo couro é pureza geométrica de alta costura. Perfeita para a mulher moderna que aprecia design ousado com artesanato impecável.',
    price: 13500,
    comparePrice: 17000,
    featured: false,
    attributes: {
      Material: 'Couro Acetinado Escovado',
      Dimensões: '27 x 19 x 5cm',
      Ferragens: 'Prata',
      Origem: 'Itália',
    },
    searchQuery: 'Prada Cleo shoulder bag brushed leather',
  },

  // ─── SAPATOS ─────────────────────────────────────────────────────────────────
  {
    brandSlug: 'sap-christian-louboutin',
    name: 'Christian Louboutin Louis Junior Spikes Flat',
    description:
      'O Louis Junior Spikes reinterpreta o loafer clássico com a irreverência característica de Christian Louboutin, coberto de rebites piramidais sobre couro liso preto. A palmilha vermelha lacada é a assinatura inconfundível da maison parisiense. Uma peça rock-chic que transforma qualquer look casual em declaração de estilo.',
    price: 6800,
    comparePrice: 8500,
    featured: false,
    attributes: {
      Material: 'Couro liso com rebites piramidais',
      'Altura do salto': 'Flat (sem salto)',
      Solado: 'Borracha com palmilha vermelha lacada',
      Origem: 'Itália',
    },
    searchQuery: 'Christian Louboutin Louis Junior Spikes loafer black',
  },
  {
    brandSlug: 'sap-jimmy-choo',
    name: 'Jimmy Choo Azia Crystal Platform Sandal',
    description:
      'A sandália Azia de Jimmy Choo é uma explosão de glamour com plataforma recoberta de cristais e salto stiletto que eleva o espírito. Cada cristal é posicionado à mão pelas artesãs da maison londrina, criando uma peça de calceteria que é praticamente joalheria. Para noites que merecem brilhar do chão ao teto.',
    price: 7200,
    comparePrice: 9200,
    featured: false,
    attributes: {
      Material: 'Tira de cetim com cristais aplicados à mão',
      'Altura do salto': '10cm',
      Solado: 'Couro com plataforma de 2cm',
      Origem: 'Itália',
    },
    searchQuery: 'Jimmy Choo Azia crystal platform sandal',
  },
  {
    brandSlug: 'sap-jimmy-choo',
    name: 'Jimmy Choo Abel Leather Loafer',
    description:
      'O loafer Abel de Jimmy Choo é a fusão perfeita entre sofisticação e conforto, com sua palmilha acolchoada e couro de vitelo italiano suave. O detalhe do mordedor dourado com o logo gravado é subtil e elegante. Um mocassim que transita com naturalidade entre o escritório de alto padrão e o jantar fine dining.',
    price: 4800,
    comparePrice: 6100,
    featured: false,
    attributes: {
      Material: 'Couro de Vitelo Polido',
      'Altura do salto': 'Flat (1cm)',
      Solado: 'Couro com pastilha de borracha',
      Origem: 'Itália',
    },
    searchQuery: 'Jimmy Choo Abel leather loafer men',
  },
  {
    brandSlug: 'sap-manolo-blahnik',
    name: 'Manolo Blahnik Sedaraby Satin Mule 70mm',
    description:
      'A mule Sedaraby é uma das criações mais românticas de Manolo Blahnik, com sua biqueira quadrada e bico fino em cetim de seda pintado à mão. O salto kitten de 70mm garante elegância e conforto refinados para o uso diário. Uma fantasia de calceteria artesanal espanhola que merece vitrine e red carpet.',
    price: 5500,
    comparePrice: 7000,
    featured: false,
    attributes: {
      Material: 'Cetim de Seda',
      'Altura do salto': '7cm (kitten heel)',
      Solado: 'Couro de vitelo',
      Origem: 'Espanha / Itália',
    },
    searchQuery: 'Manolo Blahnik Sedaraby satin mule',
  },
  {
    brandSlug: 'sap-salvatore-ferragamo',
    name: 'Salvatore Ferragamo Studio Loafer Couro',
    description:
      'O Studio Loafer de Ferragamo reinterpreta o tradicional mocassim com design contemporâneo e a qualidade artesanal da maison florentina. A fivela Gancini em dourado envelhecido é a assinatura histórica da marca fundada em 1927. Um loafer de investimento para homens que entendem que o calçado faz o traje.',
    price: 4200,
    comparePrice: 5500,
    featured: false,
    attributes: {
      Material: 'Couro de Vitelo Liso',
      'Altura do salto': 'Flat (2cm)',
      Solado: 'Couro com sola de borracha',
      Origem: 'Itália',
    },
    searchQuery: 'Salvatore Ferragamo Studio loafer leather',
  },
  {
    brandSlug: 'sap-salvatore-ferragamo',
    name: 'Salvatore Ferragamo Trifolio Mule Verniz',
    description:
      'A mule Trifolio em couro envernizado reflete a herança de Ferragamo como sapateiro dos astros de Hollywood com seu brilho espelhado e salto block estável. O formato da biqueira trilobular é um detalhe de design exclusivo e reconhecível. Uma mule de luxo que combina artesanato centenário com apelo moderno.',
    price: 3900,
    comparePrice: 5000,
    featured: false,
    attributes: {
      Material: 'Couro Envernizado (Patent Leather)',
      'Altura do salto': '6cm (block heel)',
      Solado: 'Couro com pastilha de borracha',
      Origem: 'Itália',
    },
    searchQuery: 'Salvatore Ferragamo mule patent leather women',
  },
];

async function main() {
  console.log('=== SLC Product Populator ===\n');

  const brands = await prisma.brand.findMany({ include: { category: true } });
  const brandMap = new Map(brands.map((b) => [b.slug, b]));

  const existing = await prisma.product.findMany({ select: { slug: true } });
  const existingSlugs = new Set(existing.map((p) => p.slug));
  console.log(`Existing products: ${existing.length}`);
  console.log(`Products to attempt: ${PRODUCTS_TO_CREATE.length}\n`);

  const results = {
    created: 0,
    skipped: 0,
    errors: 0,
    byCategory: {} as Record<string, number>,
  };

  for (const item of PRODUCTS_TO_CREATE) {
    const brand = brandMap.get(item.brandSlug);
    if (!brand) {
      console.log(`  [SKIP] Brand not found: ${item.brandSlug}`);
      results.skipped++;
      continue;
    }

    const slug = slugify(item.name);
    if (existingSlugs.has(slug)) {
      console.log(`  [SKIP] Already exists: ${slug}`);
      results.skipped++;
      continue;
    }

    console.log(`\nCreating: ${brand.name} — ${item.name}`);
    console.log(`  Slug: ${slug}`);
    console.log(`  Price: R$ ${item.price.toLocaleString('pt-BR')}`);

    // Search images
    const imageUrls = await searchImages(item.searchQuery);
    console.log(`  Found ${imageUrls.length} image URLs`);
    await sleep(200);

    // Upload images to Cloudinary
    const uploadedImages: string[] = [];
    for (const url of imageUrls) {
      const uploaded = await uploadFromUrl(url, 'slc/products');
      if (uploaded) {
        uploadedImages.push(uploaded);
        console.log(`  Uploaded: ...${uploaded.slice(-40)}`);
      }
      await sleep(100);
    }

    // Fallback if no images uploaded
    if (uploadedImages.length === 0) {
      const catSlug = brand.category.slug;
      const fallbacks: Record<string, string> = {
        relogios: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
        perfumes: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=800',
        bolsas: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800',
        sapatos: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800',
      };
      uploadedImages.push(fallbacks[catSlug] || fallbacks['relogios']);
      console.log(`  Using fallback image`);
    }

    try {
      await prisma.product.create({
        data: {
          name: item.name,
          slug,
          description: item.description,
          price: item.price,
          comparePrice: item.comparePrice ?? null,
          stock: Math.floor(Math.random() * 4) + 1,
          images: uploadedImages,
          featured: item.featured ?? false,
          active: true,
          attributes: item.attributes,
          brandId: brand.id,
          categoryId: brand.categoryId,
        },
      });

      existingSlugs.add(slug);
      results.created++;
      const catName = brand.category.name;
      results.byCategory[catName] = (results.byCategory[catName] || 0) + 1;
      console.log(`  [OK] Created`);
    } catch (e) {
      console.error(`  [ERROR] DB insert failed:`, e);
      results.errors++;
    }

    await sleep(300);
  }

  console.log('\n=== SUMMARY ===');
  console.log(`Created:  ${results.created}`);
  console.log(`Skipped:  ${results.skipped}`);
  console.log(`Errors:   ${results.errors}`);
  console.log('\nBy category:');
  for (const [cat, count] of Object.entries(results.byCategory)) {
    console.log(`  ${cat}: ${count}`);
  }

  const totalNow = await prisma.product.count();
  console.log(`\nTotal products in DB now: ${totalNow}`);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
