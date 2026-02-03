// panels/excel-optimization/db/schema/sessionRow.ts
import { pgTable, uuid, integer, jsonb, text } from "drizzle-orm/pg-core";
import { excelSessions } from "./session";

export const excelSessionRows = pgTable("excel_session_rows", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id")
    .notNull()
    .references(() => excelSessions.id),
  rowIndex: integer("row_index").notNull(),
  original: jsonb("original").notNull(),
  normalized: jsonb("normalized").notNull(),
  hasError: integer("has_error").notNull().default(0),
  hasWarning: integer("has_warning").notNull().default(0),
  hasInfo: integer("has_info").notNull().default(0),
  hasDuplicate: integer("has_duplicate").notNull().default(0),
  normalizedKey: text("normalized_key").notNull().default(""),
});
