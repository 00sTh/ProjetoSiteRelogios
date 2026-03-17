export const APP_NAME = "SLC";
export const APP_TAGLINE = "Timepieces & Eyewear of Distinction";
export const APP_DESCRIPTION =
  "The finest timepieces and luxury eyewear, curated with precision, authenticated with pride.";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

/** Number of products per page in the listing */
export const PRODUCTS_PER_PAGE = 12;

/** Visual mapping of order statuses */
export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: "Awaiting Payment",
  PAID: "Paid",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export const ORDER_STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PAID: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};
