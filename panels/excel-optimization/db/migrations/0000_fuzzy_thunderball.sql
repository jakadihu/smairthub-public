CREATE TABLE "excel_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"duration" text
);
--> statement-breakpoint
CREATE TABLE "excel_session_issues" (
	"session_id" uuid,
	"row_index" integer,
	"header" text,
	"issue_type" text,
	"severity" text,
	"message" text
);
--> statement-breakpoint
CREATE TABLE "excel_session_rows" (
	"session_id" uuid,
	"row_index" integer,
	"original" jsonb,
	"normalized" jsonb,
	"row_score" integer,
	"row_status" text
);
--> statement-breakpoint
ALTER TABLE "excel_session_issues" ADD CONSTRAINT "excel_session_issues_session_id_excel_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."excel_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "excel_session_rows" ADD CONSTRAINT "excel_session_rows_session_id_excel_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."excel_sessions"("id") ON DELETE no action ON UPDATE no action;