// Prisma 7 configuration file
// This file configures migrations and database connection for Prisma CLI
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    databaseUrl: process.env["DIRECT_URL"], // Use direct connection for migrations
  },
  datasource: {
    url: process.env["DIRECT_URL"], // Use direct URL for Prisma CLI operations
  },
});
