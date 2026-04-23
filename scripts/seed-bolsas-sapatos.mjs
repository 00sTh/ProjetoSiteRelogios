// node --env-file=.env.local scripts/seed-bolsas-sapatos.mjs
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

async function pickBestImage(urls, productName, isShoe = false) {
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
  const itemType = isShoe ? "shoe/heel" : "handbag";
  try {
    const result = await model.generateContent([
      { text: `Which image (index 0-${validUrls.length - 1}) best shows the "${productName}" ${itemType} with the cleanest white or neutral background and most official/professional product presentation? Reply ONLY with the number.` },
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

const SUFFIX = " superclone replica alta qualidade superclone";

const BAGS = [
  {
    slug: "hermes-birkin-30-togo-noir",
    imageQuery: "Hermès Birkin 30 Togo leather black Noir official product photo white background handbag",
    description: "O objeto de desejo mais cobiçado do mundo da moda. A Birkin 30 em couro Togo preto é a síntese absoluta do savoir-faire artesanal da Maison Hermès. Cada peça é costurada à mão por um único artesão em Pantin, Paris, e a lista de espera pode ultrapassar anos nas boutiques da marca. Ferragem Palladium, 18 pontos por centímetro, caixa em couro natural, cadeado e chave inclusos.",
  },
  {
    slug: "hermes-kelly-28-sellier-epsom",
    imageQuery: "Hermès Kelly 28 Sellier Epsom leather black Palladium hardware official product photo white background",
    description: "Eternizada pela Princesa Grace de Mônaco em 1956 quando cobriu sua gravidez na capa da Life, a Kelly Sellier 28 em couro Epsom representa o pico da elegância estruturada. A versão Sellier — costurada externamente para dar rigidez máxima — em couro Epsom preto com ferragem Palladium é a escolha da mulher que conhece o significado de heirloom.",
  },
  {
    slug: "hermes-constance-18-etoupe",
    imageQuery: "Hermès Constance 18 Etoupe Epsom leather H closure official product photo white background",
    description: "A Constance 18 em couro Epsom Étoupe com o icônico fecho H em Palladium é a bolsa de ombro mais sofisticada do catálogo da Hermès. Criada em 1969 pela designer Catherine Chaillet e presenteada originalmente à esposa de um diretor da Maison, a Constance tornou-se o sonho silencioso das connaisseurs que dispensam o óbvio.",
  },
  {
    slug: "hermes-picotin-lock-18-vert-criquet",
    imageQuery: "Hermès Picotin Lock 18 green Vert Criquet Clémence leather official product photo white background",
    description: "Leve, versátil e absolutamente charmosa. A Picotin Lock 18 em couro Clémence Vert Criquet com cadeado duplo é a bag de dia favorita das parisienses. Sem alças, sem adornos desnecessários — apenas a perfeição do couro francês e a funcionalidade de um cesto de couro que cabe tudo sem abrir mão de uma gota de elegância.",
  },
  {
    slug: "louis-vuitton-neverfull-mm-monogram",
    imageQuery: "Louis Vuitton Neverfull MM Monogram canvas beige interior official product photo white background",
    description: "A tote mais vendida do mundo da moda de luxo. A Neverfull MM em canvas Monogram com interior beige rose e as icônicas correias laterais que definem o volume da bolsa representa a democratização do luxo Louis Vuitton. O monograma desenhado por Georges Vuitton em 1896 em homenagem ao pai fundador é o padrão têxtil mais reconhecido do planeta.",
  },
  {
    slug: "louis-vuitton-speedy-bandouliere-25-damier",
    imageQuery: "Louis Vuitton Speedy Bandoulière 25 Damier Ebène canvas official product photo white background",
    description: "A Speedy é o modelo mais icônico da história de Louis Vuitton, lançado em 1930. A Speedy Bandoulière 25 em canvas Damier Ébène com alça de ombro removível é a síntese do estilo parisiano: o tabuleiro de xadrez marrom-preto é tão reconhecível quanto o monograma e carrega a mesma garantia de artesanato sem compromisso.",
  },
  {
    slug: "louis-vuitton-capucines-mm-noir",
    imageQuery: "Louis Vuitton Capucines MM black Taurillon leather gold hardware official product photo white background",
    description: "O flagship de luxo de Louis Vuitton. A Capucines MM em couro Taurillon preto com ferragem dourada representa o pinnacle da produção em couro da Maison. Sem logos aparentes — apenas a solidez do couro de touros franceses curtido por semanas, o detalhe da flap icônica e a alça de ombro intercambiável que adapta a bolsa do dia para a noite.",
  },
  {
    slug: "chanel-classic-flap-medium-caviar-preto",
    imageQuery: "Chanel Classic Flap Medium Caviar black leather gold CC clasp quilted official product photo white background",
    description: "O ativo de moda mais rentável das últimas décadas. A Classic Flap Medium em couro Caviar preto com fecho CC dourado foi redesenhada por Karl Lagerfeld em 1983 a partir da 2.55 original criada por Coco Chanel em fevereiro de 1955. A corrente de couro entretecido dourado e os gomos matelassé em couro caviar são inconfundíveis — e irresistíveis.",
  },
  {
    slug: "chanel-2-55-reissue-227-aged-calfskin",
    imageQuery: "Chanel 2.55 Reissue 227 aged calfskin black ruthenium hardware official product photo white background",
    description: "A original, o arquétipo. A 2.55 Reissue em tamanho 227 (equivalente ao Medium) em couro de bezerro envelhecido preto com a Mademoiselle Lock e ferragem ruthenium replica exatamente a bolsa que Coco Chanel revolucionou em fevereiro de 1955. O interior bordo com bolso secreto, o zíper de liga dourada e a corrente ruthenium são idênticos ao original histórico.",
  },
  {
    slug: "chanel-boy-bag-medium-couro-de-cordeiro",
    imageQuery: "Chanel Boy Bag medium lambskin black ruthenium hardware official product photo white background",
    description: "A resposta de Karl Lagerfeld ao clássico de Coco. Lançada em 2011, a Boy Bag em couro de cordeiro preto com ferragem ruthenium e o fecho de clipe CC é a Chanel dos times modernos: ousada, estruturada, quase masculina nas proporções. Uma das bolsas mais fotografadas das passarelas e tapetes vermelhos de toda a década de 2010.",
  },
  {
    slug: "gucci-dionysus-gg-supreme",
    imageQuery: "Gucci Dionysus GG Supreme canvas gold tiger closure official product photo white background",
    description: "Inspirada no deus grego do vinho e da exuberância, a Dionysus em canvas GG Supreme bege/ebony com o icônico fecho em formato de cabeça de tigre dourado é a peça mais reconhecível da Gucci contemporânea. Creative director Alessandro Michele resgatou o arquivo histórico da maison florentina e transformou o Dionysus no símbolo de uma nova era de glamour exuberante.",
  },
  {
    slug: "gucci-marmont-matelasse-medium-shoulder-bag",
    imageQuery: "Gucci GG Marmont Matelassé Medium shoulder bag beige white chevron official product photo white background",
    description: "A Marmont Matelassé é a resposta da Gucci ao quilted da Chanel — mas com a GG duplo ouro na aba e o couro de bezerro matelassé em chevron bege/branco. A ferragem GG em latão envelhecido e a corrente em metal dourado com couro bege formam uma das combinações mais fotografadas do Instagram de luxo contemporâneo.",
  },
  {
    slug: "gucci-ophidia-gg-medium-tote",
    imageQuery: "Gucci Ophidia GG Supreme canvas medium tote bag green red Web official product photo white background",
    description: "A Ophidia GG Medium Tote em canvas GG Supreme com o detalhe Web verde-vermelho (a web de sela histórica da Gucci) e as abas em couro tratado em marrom envelhecido é a síntese da herança equestre de 1921. O design traz o monograma histórico de Guccio Gucci em tote que une funcionalidade e prestígio do nome florentino.",
  },
  {
    slug: "bottega-veneta-cassette-maxi-intrecciato",
    imageQuery: "Bottega Veneta Cassette Maxi Intrecciato padded blue official product photo white background",
    description: "A Cassette com o maxi-intrecciato estofado é a peça mais cool e contemporânea de Bottega Veneta sob a direção criativa de Daniel Lee. O couro de bezerro trançado em escala maior que o intrecciato tradicional com estofamento acolchoado cria uma textura tridimensional única. A fivela de metal dourado do quadro interno e a aba magnética formam o conjunto mais procurado pelos colecionadores da nova Bottega.",
  },
  {
    slug: "bottega-veneta-jodie-intrecciato",
    imageQuery: "Bottega Veneta Jodie Intrecciato hobo bag black knotted handle official product photo white background",
    description: "A Jodie Intrecciato é a bag mais aspiracional da revolução silenciosa de Bottega Veneta. O design hobo em couro de bezerro nappa com o alça única de nó duplo e o intrecciato clássico em preto ou kiwi tornou-se o it-bag favorito das editoras de moda e das mulheres que preferem o logo implícito à ostentação. Reconhecida imediatamente por quem conhece — invisível para quem não conhece.",
  },
  {
    slug: "bottega-veneta-pouch-clutch-intrecciato",
    imageQuery: "Bottega Veneta Pouch clutch intrecciato leather black gold official product photo white background",
    description: "A Pouch Intrecciato é a bolsa que redefiniu a clutch contemporânea. O design maxi de couro de vitelo macio, maleável e estruturado apenas pelo próprio couro — sem armação, sem fecho — em intrecciato preto ou Parakeet é a peça favorita das celebridades e o objeto de coleção mais aguardado das coleções de Bottega Veneta.",
  },
  {
    slug: "prada-galleria-saffiano-nero",
    imageQuery: "Prada Galleria Saffiano leather black tote bag double zip official product photo white background",
    description: "A bolsa de trabalho da mulher com poder. A Galleria em couro Saffiano preto — o couro textured inventado por Mario Prada conhecido por resistir a arranhões e manter a forma perfeita — com o logo triangular metálico e o duplo zíper de aço escovado é a bag favorita de executivas e da editora-chefe da Vogue. O formato da Galleria foi criado em 2007 e nunca saiu de produção.",
  },
  {
    slug: "prada-re-edition-2005-re-nylon",
    imageQuery: "Prada Re-Edition 2005 Tessuto Nylon black gold hardware official product photo white background",
    description: "O clássico dos anos 2000 ressignificado para a era sustentável. A Re-Edition 2005 em Re-Nylon — o nylon regenerado criado por Prada a partir de plástico oceânico — com a ferragem dourada e o logo triangular metálico replica exatamente o modelo de 2005 que se tornou o it-bag da era pré-Instagram. A alça de corrente dourada curta e a pallete compacta tornaram-se símbolos de uma geração.",
  },
  {
    slug: "prada-cleo-shoulder-bag-brushed-leather",
    imageQuery: "Prada Cleo shoulder bag brushed leather black silver hardware official product photo white background",
    description: "Inspirada nos arquivos dos anos 1960 e 1970 da Maison. A Cleo Shoulder Bag em couro escovado preto com a aba curva e o fecho magnético oculto é a leitura contemporânea de Miuccia Prada da elegância italiana clássica. A alça de corrente em prata escovada, a textura acetinada do couro e o interior de couro nappa fazem desta a escolha favorita das editoras de moda para o uso diário de luxo.",
  },
];

const SHOES = [
  {
    slug: "christian-louboutin-so-kate-120-preto",
    imageQuery: "Christian Louboutin So Kate 120mm black patent leather red sole official product photo white background",
    description: "A musa de Christian Louboutin. A So Kate 120 em couro envernizado preto com o salto stiletto de 120mm e a inconfundível sola vermelha lacada Louboutin Red é o scarpin que transformou o criador em lenda. Desenvolvida para mulheres que recusam o compromisso entre estilo e audácia, a So Kate alonga e afina as pernas com uma geometria próxima da perfeição matemática.",
    isShoe: true,
  },
  {
    slug: "christian-louboutin-pigalle-100-nude",
    imageQuery: "Christian Louboutin Pigalle 100mm nude patent leather pointed toe red sole official product photo white background",
    description: "O clássico infalível da maison, o scarpin que qualquer mulher usaria em qualquer ocasião. A Pigalle 100 em couro envernizado nude com bico fino e salto agulha de 100mm alonga e afina as pernas criando a ilusão de quilômetros de nude. O segredo está no tom nude que se funde com qualquer tom de pele — a escolha de Beyoncé, Victoria Beckham e das estilistas de Hollywood.",
    isShoe: true,
  },
  {
    slug: "christian-louboutin-bianca-140-preto",
    imageQuery: "Christian Louboutin Bianca 140mm platform black patent leather red sole official product photo white background",
    description: "O maximalismo de Louboutin em sua forma mais pura. A Bianca 140 com plataforma de 40mm e salto de 140mm em couro envernizado preto é o sapato das mulheres que chegam e não passam despercebidas. A plataforma frontal torna os 140mm confortavelmente usáveis — uma obra de engenharia calçadista que transforma a física em moda.",
    isShoe: true,
  },
  {
    slug: "christian-louboutin-louis-junior-spikes-flat",
    imageQuery: "Christian Louboutin Louis Junior Spikes flat black leather loafer official product photo white background",
    description: "O loafer masculino mais desejado da maison. O Louis Junior Spikes em couro preto com os icônicos spikes piramidais dourados é a resposta de Louboutin ao casual de luxo masculino. A sola vermelha no flat — ousadia máxima — e os spikes que percorrem a parte frontal do sapato criaram um clássico instantâneo da moda masculina contemporânea de alto padrão.",
    isShoe: true,
  },
  {
    slug: "jimmy-choo-anouk-100-preto",
    imageQuery: "Jimmy Choo Anouk 100mm black suede pointed toe pump official product photo white background",
    description: "O clássico fundacional de Jimmy Choo. A Anouk em suede preto com bico fino e salto agulha de 100mm é a destilação perfeita da promessa da marca: glamour acessível e elegância refinada. A geometria do bico, a curvatura do salto e o material suede que envelece perfeitamente tornaram a Anouk a escolha das mulheres que sabem que bom gosto é eterno.",
    isShoe: true,
  },
  {
    slug: "jimmy-choo-romy-85-nude",
    imageQuery: "Jimmy Choo Romy 85mm nude patent leather pointed toe pump official product photo white background",
    description: "O favorito das noivas e das princesas de todo o mundo. A Romy 85 em couro envernizado nude com bico fino e salto de 85mm é a altura perfeita — elegante o suficiente para a cerimônia, confortável o suficiente para a festa. Usada por Kate Middleton, Pippa Middleton e Meghan Markle, a Romy tornou-se o sapato de cerimônia mais aspiracional da realeza contemporânea.",
    isShoe: true,
  },
  {
    slug: "jimmy-choo-lance-100-glitter",
    imageQuery: "Jimmy Choo Lance 100mm silver glitter pointed toe pump official product photo white background",
    description: "Para as noites que merecem brilho total. A Lance 100 em tecido de glitter prata com bico fino e salto agulha de 100mm é o scarpin de festa definitivo de Jimmy Choo — transformador de looks, de humor e de entradas. Cada glitter é aplicado manualmente e a refração de luz torna o sapato quase irresistível sob qualquer luminosidade.",
    isShoe: true,
  },
  {
    slug: "jimmy-choo-abel-leather-loafer",
    imageQuery: "Jimmy Choo Abel leather loafer black gold JC logo chain official product photo white background",
    description: "O loafer luxuoso de Jimmy Choo. O Abel em couro preto polido com o detalhe de corrente dourada e logo JC é a resposta da maison ao calçado casual de prestígio. A corrente em metal dourado envelhecido percorre a parte frontal adicionando movimento e glamour ao design clássico do mocassim — o calçado de trabalho preferido das executivas de moda.",
    isShoe: true,
  },
  {
    slug: "jimmy-choo-azia-crystal-platform-sandal",
    imageQuery: "Jimmy Choo Azia crystal embellished platform sandal silver official product photo white background",
    description: "A sandália de festa mais espetacular de Jimmy Choo. A Azia Crystal Platform Sandal com plataforma de 15mm, salto de 120mm e cristais cravejados em todo o torno é a escolha das celebridades para tapetes vermelhos e noites de gala. Os cristais Swarovski ou de vidro tcheco capturados na alça e na plataforma criam o efeito de um calçado coberto de diamantes.",
    isShoe: true,
  },
  {
    slug: "manolo-blahnik-bb-105-cetim-marfim",
    imageQuery: "Manolo Blahnik BB 105 ivory satin pointed toe pump official product photo white background",
    description: "O protagonista de Sex and the City e o sapato de noiva mais copiado do mundo. A BB 105 em cetim marfim com laço na fivela e salto de 105mm foi o sapato que Carrie Bradshaw usou no episódio mais comentado da série e que mudou o mundo da moda nopcial. Manolo Blahnik afirmou que a BB é 'o scarpin perfeito' — e após 30 anos em produção, ninguém ainda discordou.",
    isShoe: true,
  },
  {
    slug: "manolo-blahnik-hangisi-70-azul-real",
    imageQuery: "Manolo Blahnik Hangisi 70mm royal blue satin crystal buckle official product photo white background",
    description: "O sapato que Carrie Bradshaw usou em seu casamento com Mr. Big no final de Sex and the City. A Hangisi 70 em cetim azul real com o broche de cristal Swarovski e salto de 70mm tornou-se o sapato de noiva mais reconhecível da cultura pop. Cada Hangisi é produzida artesanalmente em Milão e o broche pode ser personalizado por pedrarias.",
    isShoe: true,
  },
  {
    slug: "manolo-blahnik-chaos-105-leopardo",
    imageQuery: "Manolo Blahnik Chaos 105 leopard print satin mule pointed official product photo white background",
    description: "A mule icônica de Manolo Blahnik em sua versão mais felina. A Chaos 105 em cetim com estampa leopardo é o animal print na mais alta expressão do glamour — sofisticado o suficiente para uma festa de gala, ousado o suficiente para declarar exuberância sem reservas. O bico fino e o salto esculpido de 105mm completam o caráter escultural desta peça de arte calçadista.",
    isShoe: true,
  },
  {
    slug: "manolo-blahnik-sedaraby-satin-mule-70mm",
    imageQuery: "Manolo Blahnik Sedaraby satin mule 70mm official product photo white background",
    description: "A mule de salto bloco mais refinada do atelier de Manolo Blahnik. A Sedaraby em cetim com salto bloco de 70mm e o bico fino que corta o ar é a sofisticação de uma babouche parisiense transformada em algo atemporal. O salto bloco torna o uso diário confortável sem nenhum compromisso com a elegância — a escolha das mulheres que sabem que luxo pode ser conveniente.",
    isShoe: true,
  },
  {
    slug: "salvatore-ferragamo-vara-bow-pump",
    imageQuery: "Salvatore Ferragamo Vara Bow pump black patent leather grosgrain bow official product photo white background",
    description: "O sapato mais icônico de Salvatore Ferragamo — o sapateiro das estrelas de Hollywood. A Vara com o laço grosgrain preto e o salto de 55mm em couro envernizado preto é o encontro perfeito entre a aristocracia italiana e a elegância atemporal. O laço característico foi registrado por Ferragamo e tornou-se o símbolo reconhecível da maison de Florença desde os anos 1970.",
    isShoe: true,
  },
  {
    slug: "salvatore-ferragamo-varina-couro-marrom",
    imageQuery: "Salvatore Ferragamo Varina ballerina flat brown leather Vara bow official product photo white background",
    description: "A ballerina perfeita para o dia a dia de luxo. A Varina em couro marrom com o laço Vara característico de Ferragamo e a sola plana em couro natural é a escolha das mulheres que percorrem o mundo sem abrir mão da elegância. O couro de alta qualidade envelhece com graça e a sola de couro moldada ao pé torna cada par único após o uso.",
    isShoe: true,
  },
  {
    slug: "salvatore-ferragamo-studio-loafer-couro",
    imageQuery: "Salvatore Ferragamo Studio loafer Gancini bit leather black official product photo white background",
    description: "O loafer masculino com a alma do artesanato florentino. O Studio Loafer em couro negro polido com o bit Gancini de metal ouro envelhecido é a expressão máxima da tradição sapateira da Maison Ferragamo. O Gancini — o gancho duplo registrado por Salvatore Ferragamo — identifica instantaneamente a origem italiana e a excelência do couro curtido nas mais antigas tenarias de Toscana.",
    isShoe: true,
  },
  {
    slug: "salvatore-ferragamo-trifolio-mule-verniz",
    imageQuery: "Salvatore Ferragamo Trifolio mule patent leather black kitten heel official product photo white background",
    description: "A mule de salto médio mais elegante do catálogo Ferragamo. A Trifolio Mule em verniz preto com o detalhe trefoil em metal dourado e o salto kitten de 45mm é a escolha das mulheres que entendem que a sofisticação mora nos detalhes. O motivo trefolio — adaptação contemporânea do Gancini histórico — e o verniz brilhante que reflete luz criam uma peça de presença imediata.",
    isShoe: true,
  },
];

async function processProduct(product, folder, i, total) {
  console.log(`[${i + 1}/${total}] ${product.slug}`);
  try {
    const urls = await serperImages(product.imageQuery, 8);
    console.log(`  🔍 ${urls.length} imagens encontradas`);

    let cloudUrl = null;
    if (urls.length > 0) {
      const best = await pickBestImage(urls, product.slug.replace(/-/g, " "), product.isShoe ?? false);
      if (best) {
        cloudUrl = await uploadFromUrl(best, folder);
        if (cloudUrl) console.log(`  ☁️ ${cloudUrl}`);
      }
    }

    const desc = product.description + SUFFIX;
    if (cloudUrl) {
      await sql`UPDATE products SET images = ${[cloudUrl]}, description = ${desc}, "updatedAt" = NOW() WHERE slug = ${product.slug}`;
    } else {
      await sql`UPDATE products SET description = ${desc}, "updatedAt" = NOW() WHERE slug = ${product.slug}`;
    }
    console.log(`  ✅ Atualizado`);
  } catch (e) {
    console.log(`  ❌ ${e.message}`);
  }
  await new Promise(r => setTimeout(r, 1200));
}

async function main() {
  const all = [...BAGS, ...SHOES];
  console.log(`\n═══ BOLSAS (${BAGS.length}) + SAPATOS (${SHOES.length}) ═══\n`);

  console.log(`── BOLSAS ──`);
  for (let i = 0; i < BAGS.length; i++) {
    await processProduct(BAGS[i], "slc/bags", i, BAGS.length);
  }

  console.log(`\n── SAPATOS ──`);
  for (let i = 0; i < SHOES.length; i++) {
    await processProduct(SHOES[i], "slc/shoes", i, SHOES.length);
  }

  console.log("\n🎉 Bolsas e sapatos concluídos!\n");
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
