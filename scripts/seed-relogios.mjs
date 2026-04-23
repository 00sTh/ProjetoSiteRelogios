// node --env-file=.env.local scripts/seed-relogios.mjs
import { neon } from "@neondatabase/serverless";
import { v2 as cloudinary } from "cloudinary";
import { GoogleGenerativeAI } from "@google/generative-ai";

const SERPER_KEY = "cd997fc33c9a6729c8adef285e619d284e0e5be6";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const sql = neon(process.env.DATABASE_URL);

async function serperImages(query, num = 8) {
  const res = await fetch("https://google.serper.dev/images", {
    method: "POST",
    headers: { "X-API-KEY": SERPER_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ q: query, num }),
  });
  const data = await res.json();
  return (data.images || []).map(i => i.imageUrl).filter(Boolean);
}

async function pickBestImage(urls, productName) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const parts = [];
  const validUrls = [];
  for (const url of urls.slice(0, 5)) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      const mime = (res.headers.get("content-type") || "image/jpeg").split(";")[0];
      parts.push({ inlineData: { data: buf.toString("base64"), mimeType: mime } });
      validUrls.push(url);
    } catch { /* skip */ }
  }
  if (!validUrls.length) return null;
  if (validUrls.length === 1) return validUrls[0];
  try {
    const result = await model.generateContent([
      { text: `Which image (index 0-${validUrls.length - 1}) best shows the "${productName}" watch with the cleanest white or neutral background, best product clarity and official presentation? Reply ONLY with the number.` },
      ...parts,
    ]);
    const idx = parseInt(result.response.text().trim());
    return validUrls[isNaN(idx) ? 0 : Math.min(idx, validUrls.length - 1)];
  } catch {
    return validUrls[0];
  }
}

async function uploadFromUrl(url, folder) {
  try {
    const res = await cloudinary.uploader.upload(url, { folder, resource_type: "image" });
    return res.secure_url;
  } catch (e) {
    console.log(`  ⚠️ Upload falhou: ${e.message}`);
    return null;
  }
}

async function geminiDescription(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

const SUFFIX = " superclone replica alta qualidade superclone";

const WATCHES = [
  {
    slug: "rolex-submariner-date-oystersteel",
    imageQuery: "Rolex Submariner Date 126610LN black dial Oystersteel official product photo white background",
    description: "O relógio de mergulho mais icônico de todos os tempos. Lançado em 1953 e reinventado em 2020, o Submariner Date ref. 126610LN possui caixa e bracelete Oystersteel 41mm, mostrador preto laccado, luneta Cerachrom unidirecional preta em cerâmica, resistência à água de 300m e calibre 3235 de manufatura com 70 horas de reserva de marcha.",
  },
  {
    slug: "rolex-daytona-ouro-branco",
    imageQuery: "Rolex Cosmograph Daytona white gold 116509 chronograph official product photo white background",
    description: "O cronógrafo de corrida mais desejado do mundo. O Daytona em Everose ou ouro branco com mostrador meteorite e calibre 4130 de manufatura representa o ápice da relojoaria esportiva de luxo. Cada peça é produzida em série limitada e valoriza ano após ano no mercado secundário.",
  },
  {
    slug: "rolex-gmt-master-ii-pepsi-jubilee",
    imageQuery: "Rolex GMT-Master II 126710BLRO Pepsi red blue bezel Jubilee bracelet official product white background",
    description: "Criado em parceria com a Pan Am em 1954 para pilotos transatlânticos, o GMT-Master II 'Pepsi' ref. 126710BLRO apresenta a icônica luneta bicolor vermelho-azul em Cerachrom, bracelete Jubilee em Oystersteel 41mm e o revolucionário calibre 3285 com função GMT independente e 70 horas de reserva de marcha.",
  },
  {
    slug: "rolex-datejust-36mm-jubile-branco",
    imageQuery: "Rolex Datejust 36mm white dial Jubilee bracelet Oystersteel official product photo white background",
    description: "Lançado em 1945 e sem alterações em sua essência desde então, o Datejust 36 é o relógio mais icônico da Rolex. O mostrador branco com marcadores diamante, bracelete Jubilee em Oystersteel e a janela de data com lente ciclopiana definem um clássico absoluto do dress watch suíço.",
  },
  {
    slug: "rolex-datejust-41-arlequim",
    imageQuery: "Rolex Datejust 41 Arlequin multicolor dial 126300 official product photo white background",
    description: "Um dos mostradores mais raros e aguardados da Rolex. O Datejust 41 Arlequin apresenta o icônico mostrador multicolorido inspirado na commedia dell'arte italiana, combinado com caixa Oystersteel 41mm, bracelete Jubilee e o calibre 3235 de manufatura — uma edição que une tradição relojoeira e arte aplicada.",
  },
  {
    slug: "patek-philippe-nautilus-5711-azul",
    imageQuery: "Patek Philippe Nautilus 5711 blue dial steel bracelet official product photo white background",
    description: "O relógio mais aguardado e cobiçado de toda a alta relojoaria. Desenhado por Gérald Genta em 1976, o Nautilus 5711/1A-010 com mostrador azul gradiente e bracelete integrado em aço inoxidável representa o pico absoluto do status em relojoaria. Lista de espera de anos nas boutiques oficiais, apreciação histórica de valor.",
  },
  {
    slug: "patek-philippe-aquanaut-5167-aco",
    imageQuery: "Patek Philippe Aquanaut 5167A steel blue dial tropical strap official product photo white background",
    description: "O esportivo contemporâneo da Patek Philippe. O Aquanaut 5167A-001 apresenta o distinto mostrador azul 'tropical' texturizado, caixa em aço inoxidável 40mm e pulseira composta em borracha preta. Calibre 324 S C de manufatura, resistência à água de 120m — o relógio de pulso perfeito para o luxo casual.",
  },
  {
    slug: "patek-philippe-aquanaut-5168g-ouro-branco",
    imageQuery: "Patek Philippe Aquanaut 5168G white gold blue dial official product photo white background",
    description: "A versão mais exclusiva do Aquanaut. O 5168G-010 em ouro branco 18k com mostrador azul gradiente e pulseira composta de borracha azul é uma das peças mais procuradas da produção limitada de Patek Philippe. O calibre 324 S C garante precisão cronométrica superior e 45 horas de reserva de marcha.",
  },
  {
    slug: "omega-seamaster-diver-300m-azul",
    imageQuery: "Omega Seamaster Diver 300M blue dial ceramic bezel official product photo white background",
    description: "O relógio do agente 007 desde 1995. O Seamaster Diver 300M com mostrador azul ondulado e luneta de cerâmica preta combina o legado técnico de mergulho da Omega com o estilo atemporal dos mares. Calibre Master Chronometer 8800, resistência magnética de 15.000 gauss, certificado METAS.",
  },
  {
    slug: "omega-speedmaster-moonwatch-professional",
    imageQuery: "Omega Speedmaster Moonwatch Professional 310.30.42.50.01.001 black dial official product photo white background",
    description: "O único relógio qualificado pela NASA para todas as missões espaciais tripuladas. O Speedmaster Moonwatch Professional ref. 310.30.42.50.01.001 é idêntico ao que Neil Armstrong usou na Lua em 1969: calibre manual 1861, caixa em aço inoxidável 42mm, mostrador preto com sub-mostrador tritô e pulseira Speedmaster.",
  },
  {
    slug: "-seamaster-aqua-terra-150m",
    imageQuery: "Omega Seamaster Aqua Terra 150M blue dial automatic official product photo white background",
    description: "A elegante fusão entre relógio esportivo e dress watch. O Seamaster Aqua Terra 150M apresenta o distinto mostrador com padrão 'teak' inspirado nos deques de iates de madeira, resistência à água de 150m e calibre Master Chronometer 8900 certificado — o refinamento náutico da Omega em sua expressão mais sofisticada.",
  },
  {
    slug: "cartier-santos-de-cartier-aco-e-ouro",
    imageQuery: "Cartier Santos de Cartier steel gold bicolor WSSA0030 official product photo white background",
    description: "O primeiro relógio de pulso masculino da história da alta relojoaria. Santos Dumont usou este modelo para pousar seu Demoiselle em 1906. O Santos de Cartier bicolor em aço e ouro amarelo 18k, com o sistema de pulseira QuickSwitch e luneta parafusada, é a síntese do pioneirismo e elegância franceses.",
  },
  {
    slug: "cartier-tank-must-adlc",
    imageQuery: "Cartier Tank Must WSTA0041 ADLC black dial official product photo white background",
    description: "Criado em 1917 inspirado nos tanques Renault da Primeira Guerra Mundial, o Tank é o ícone absoluto do design de relógios do século XX. O Tank Must em ADLC preto com mostrador preto e bracelete integrado representa a versão mais contemporânea e discreta deste clássico atemporal da maison Cartier.",
  },
  {
    slug: "cartier-ballon-bleu-42mm-aco",
    imageQuery: "Cartier Ballon Bleu 42mm stainless steel blue crown automatic official product photo white background",
    description: "O Ballon Bleu é a peça mais moderna e reconhecível da Cartier contemporânea. Lançado em 2007, o caixa em aço inoxidável 42mm com a coroa protegida pelo icônico onguent em safira azul, mostrador guilhochê prata e calibre 1847 MC de manufatura — uma obra de arte que equilibra tradição e inovação.",
  },
  {
    slug: "iwc-portugieser-chronograph-iw371617",
    imageQuery: "IWC Portugieser Chronograph IW371617 silver dial brown leather official product photo white background",
    description: "O mais emblemático cronógrafo da IWC Schaffhausen. O Portugieser Chronograph ref. IW371617 apresenta o distinto mostrador prateado com escalas de contagem em arco, caixa em aço inoxidável 41mm e o calibre 69355 de manufatura com cronógrafo de colunas e 46 horas de reserva de marcha.",
  },
  {
    slug: "iwc-pilot-s-watch-mark-xx-aco",
    imageQuery: "IWC Pilot's Watch Mark XX IW328201 black dial leather strap official product photo white background",
    description: "Herdeiro de uma tradição de relógios de aviação que remonta à Segunda Guerra Mundial. O Pilot's Watch Mark XX ref. IW328201 apresenta o mostrador preto de alta legibilidade com numerais arábicos, caixa em aço inoxidável 40mm, resistência antimagnética e o calibre 82200 com 120 horas de reserva de marcha.",
  },
  {
    slug: "iwc-portofino-automatic-40mm",
    imageQuery: "IWC Portofino Automatic 40mm silver dial IW356523 leather strap official product photo white background",
    description: "O dress watch por excelência da IWC Schaffhausen. O Portofino Automatic 40mm ref. IW356523 apresenta o mostrador prateado clássico com índices aplicados em bastão, caixa em aço 40mm de perfil fino e o calibre 35111 — a elegância suíça em sua forma mais pura e funcional para o dia a dia elegante.",
  },
  {
    slug: "ingenieur-automatico-40",
    imageQuery: "IWC Ingenieur Automatic 40mm IW323902 silver dial bracelet official product photo white background",
    description: "Lançado originalmente em 1955 e redesenhado para a era moderna. O Ingenieur Automático 40 da IWC apresenta proteção antimagnética avançada graças ao seu sistema de amortecedor de fluxo de ferro puro na caixa de aço 40mm, mostrador sunray prateado e calibre 32110 com data e 120 horas de reserva de marcha.",
  },
  {
    slug: "audemars-piguet-royal-oak-15202-aco",
    imageQuery: "Audemars Piguet Royal Oak 15202 Jumbo Extra-Thin blue dial steel bracelet official product white background",
    description: "A obra-prima que revolucionou a indústria relojoeira em 1972. Gerald Genta desenhou o Royal Oak 'Jumbo' extra-fino com parafusos aparentes e integração radical caixa-bracelete. O 15202ST.OO.1240ST.01 com mostrador azul 'Grande Tapisserie' e caixa octogonal de 39mm em aço é a referência definitiva da alta relojoaria esportiva de luxo.",
  },
  {
    slug: "audemars-piguet-royal-oak-offshore-44mm-titanio",
    imageQuery: "Audemars Piguet Royal Oak Offshore 44mm titanium blue dial official product photo white background",
    description: "O hiperbólico sobrinho do Royal Oak. O Royal Oak Offshore em titânio 44mm é a versão extrema e expansiva do clássico de Genta: caixa em titânio ultra-resistente, mostrador azul com 'Mega Tapisserie' e sub-mostrador, luneta em cerâmica e o calibre 3126/3840 com cronógrafo e 50 horas de reserva de marcha.",
  },
  {
    slug: "master-ultra-thin-perpetual-calendar",
    imageQuery: "Jaeger-LeCoultre Master Ultra Thin Perpetual Calendar silver blue dial official product white background",
    description: "A expressão máxima da alta relojoaria ultra-plana. O Master Ultra Thin Perpetual Calendar da Jaeger-LeCoultre reúne a complicação mais difícil de construir — o calendário perpétuo que avança automaticamente considerando meses de 28, 29, 30 e 31 dias — em uma caixa de platina com apenas 7,9mm de espessura. O calibre 868 manufatura é considerado um dos mais elegantes do mundo.",
  },
];

async function main() {
  console.log(`\n═══ RELÓGIOS: ${WATCHES.length} PRODUTOS ═══\n`);

  for (let i = 0; i < WATCHES.length; i++) {
    const w = WATCHES[i];
    console.log(`[${i + 1}/${WATCHES.length}] ${w.slug}`);

    try {
      // Buscar imagens
      const urls = await serperImages(w.imageQuery, 8);
      console.log(`  🔍 ${urls.length} imagens encontradas`);

      let cloudUrl = null;
      if (urls.length > 0) {
        const best = await pickBestImage(urls, w.slug.replace(/-/g, " "));
        if (best) {
          cloudUrl = await uploadFromUrl(best, "slc/watches");
          if (cloudUrl) console.log(`  ☁️ ${cloudUrl}`);
        }
      }

      // Atualizar no banco
      const desc = w.description + SUFFIX;
      if (cloudUrl) {
        await sql`
          UPDATE products SET
            images = ${[cloudUrl]},
            description = ${desc},
            "updatedAt" = NOW()
          WHERE slug = ${w.slug}
        `;
      } else {
        await sql`UPDATE products SET description = ${desc}, "updatedAt" = NOW() WHERE slug = ${w.slug}`;
      }
      console.log(`  ✅ Atualizado`);
    } catch (e) {
      console.log(`  ❌ ${e.message}`);
    }

    await new Promise(r => setTimeout(r, 1200));
  }

  console.log("\n🎉 Relógios concluídos!\n");
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
