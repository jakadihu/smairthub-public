// panels/excel-optimization/db/schema/session.ts
import { pgTable, uuid, timestamp, text, doublePrecision } from "drizzle-orm/pg-core";

export const excelSessions = pgTable("excel_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").defaultNow(),  
  updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
  status: text("status").notNull().default("pending"),   
  progress: doublePrecision("progress").notNull().default(0),  
  duration: text("duration").notNull().default(""),
  error: text("error"),
});
