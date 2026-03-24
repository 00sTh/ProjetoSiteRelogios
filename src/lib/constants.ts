export const APP_NAME = "SLC";
export const APP_FULL_NAME = "S Luxury Collection";
export const APP_TAGLINE = "Objetos de Desejo. Criados para Durar.";
export const APP_DESCRIPTION =
  "A coleção mais refinada de relógios, perfumes, bolsas e sapatos de luxo.";
export const SOFT_DESCRIPTOR = "SLC LUXURY";
export const PRODUCTS_PER_PAGE = 12;
export const CART_KEY = "slc:cart";

export const CIELO_BASE_URL =
  process.env.CIELO_ENV === "production"
    ? "https://api.cieloecommerce.cielo.com.br"
    : "https://apisandbox.cieloecommerce.cielo.com.br";

export const CIELO_QUERY_URL =
  process.env.CIELO_ENV === "production"
    ? "https://apiquery.cieloecommerce.cielo.com.br"
    : "https://apiquerysandbox.cieloecommerce.cielo.com.br";
