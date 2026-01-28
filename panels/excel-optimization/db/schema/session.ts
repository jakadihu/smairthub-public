// panels/excel-optimization/db/schema/session.ts
import { pgTable, uuid, timestamp, text } from "drizzle-orm/pg-core";

export const excelSessions = pgTable("excel_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").defaultNow(),
  duration: text("duration").notNull().default(""),
});
