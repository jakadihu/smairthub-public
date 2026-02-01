import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import { excelSessions } from "./schema/session";
import { excelSessionRows } from "./schema/sessionRow";
import { excelSessionIssues } from "./schema/sessionIssues";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle(pool, {
  schema: {
    excelSessions,
    excelSessionRows,
    excelSessionIssues,
  },
  logger: false,
});
