// panels/excel-optimization/db/schema/sessionRow.ts
import { pgTable, uuid, integer, jsonb, text } from "drizzle-orm/pg-core";
import { excelSessions } from "./session";

export const excelSessionRows = pgTable("excel_session_rows", {
  id: uuid("id").primaryKey().defaultRandom(),   // ← ÚJ, stabil sorazonosító

  sessionId: uuid("session_id")
    .notNull()
    .references(() => excelSessions.id),

  rowIndex: integer("row_index").notNull(),

  original: jsonb("original").notNull(),
  normalized: jsonb("normalized").notNull(),

  rowScore: integer("row_score").notNull(),
  rowStatus: text("row_status").notNull(), // ok | warning | danger
});

