import { defineConfig } from "prisma/config";
// Load .env.local for prisma CLI
import "dotenv/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
