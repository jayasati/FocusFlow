import "dotenv/config";
import path from "node:path";
import { defineConfig } from "prisma/config";

const migrationUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!migrationUrl) {
  throw new Error(
    "Prisma config: DATABASE_URL (or DIRECT_URL) is required. Set it in .env.",
  );
}

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: migrationUrl,
  },
});
