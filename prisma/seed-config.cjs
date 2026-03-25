const { neon } = require("@neondatabase/serverless");
require; // env loaded via --env-file
const sql = neon(process.env.DATABASE_URL);
const defaults = [
  ["hero_video_left","https://player.vimeo.com/progressive_redirect/playback/824804225/rendition/720p/file.mp4?loc=external"],
  ["hero_video_right","https://player.vimeo.com/progressive_redirect/playback/517090527/rendition/720p/file.mp4?loc=external"],
  ["hero_title1","Objetos de"],
  ["hero_title2","Desejo."],
  ["hero_subtitle","Relógios · Perfumes · Bolsas · Sapatos"],
  ["hero_cta1_text","Explorar Coleção"],
  ["hero_cta1_url","/relogios"],
  ["hero_cta2_text","Ver Perfumes"],
  ["hero_cta2_url","/perfumes"],
  ["hero_left_label","Relógios de Luxo"],
  ["hero_left_url","/relogios"],
  ["hero_right_label","Perfumes"],
  ["hero_right_url","/perfumes"],
];
async function main() {
  for (const [k, v] of defaults) {
    await sql`INSERT INTO site_config (key, value, "updatedAt") VALUES (${k}, ${v}, NOW()) ON CONFLICT (key) DO NOTHING`;
  }
  console.log("Config seeded:", defaults.length, "keys");
}
main().catch(console.error);
