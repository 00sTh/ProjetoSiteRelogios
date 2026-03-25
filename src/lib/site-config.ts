export const SITE_CONFIG_DEFAULTS: Record<string, string> = {
  // Hero
  hero_title: "Objetos de",
  hero_title_italic: "Desejo.",
  hero_tagline: "Relógios · Perfumes · Bolsas · Sapatos",
  hero_cta1_text: "Explorar Coleção",
  hero_cta1_href: "/relogios",
  hero_cta2_text: "Ver Perfumes",
  hero_cta2_href: "/perfumes",
  hero_video_left:
    "https://player.vimeo.com/progressive_redirect/playback/824804225/rendition/720p/file.mp4?loc=external",
  hero_video_right:
    "https://player.vimeo.com/progressive_redirect/playback/517090527/rendition/720p/file.mp4?loc=external",
  hero_label_left: "Relógios de Luxo",
  hero_label_left_href: "/relogios",
  hero_label_right: "Perfumes",
  hero_label_right_href: "/perfumes",
  // Sobre
  sobre_heading: "S Luxury Collection",
  sobre_p1:
    "A SLC nasceu da crença de que o luxo verdadeiro não é sobre ostentação — é sobre qualidade inquestionável, design atemporal e a história por trás de cada peça.",
  sobre_p2:
    "Curadoria rigorosa das maiores maisons do mundo: relógios suíços que atravessam gerações, perfumes que se tornam assinaturas olfativas, bolsas que são investimentos e sapatos que transformam a silhueta.",
  // Geral
  whatsapp: "",
  contact_email: "",
};

export function cfg(
  config: Record<string, string>,
  key: string
): string {
  return config[key] ?? SITE_CONFIG_DEFAULTS[key] ?? "";
}
