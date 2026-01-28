// panels/excel-optimization/db/schema/sessionIssue.ts
import { pgTable, uuid, integer, text } from "drizzle-orm/pg-core";
import { excelSessions } from "./session";
import { excelSessionRows } from "./sessionRow";

export const excelSessionIssues = pgTable("excel_session_issues", {
  id: uuid("id").primaryKey().defaultRandom(),   

  sessionId: uuid("session_id")
    .notNull()
    .references(() => excelSessions.id),

  rowId: uuid("row_id")
    .notNull()
    .references(() => excelSessionRows.id),      

  header: text("header").notNull(),
  issueType: text("issue_type").notNull(),
  severity: text("severity").notNull(), 
  message: text("message").notNull(),
});
