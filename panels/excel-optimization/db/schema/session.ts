// panels/excel-optimization/db/schema/session.ts
import { pgTable, uuid, timestamp, text, doublePrecision } from "drizzle-orm/pg-core";

export const excelSessions = pgTable("excel_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").defaultNow(),
  // feldolgozás állapota 
  status: text("status").notNull().default("pending"), 
  //progress 0–1 között 
  progress: doublePrecision("progress").notNull().default(0),
  //futási idő
  duration: text("duration").notNull().default(""),
});
