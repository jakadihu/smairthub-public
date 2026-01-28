import { defineConfig } from "drizzle-kit";
export default defineConfig({
  schema: "./panels/excel-optimization/db/schema",
  out: "./panels/excel-optimization/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
});
