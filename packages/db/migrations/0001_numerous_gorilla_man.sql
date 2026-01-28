CREATE TABLE "session_cell_issues" (
	"session_id" uuid,
	"row_index" integer,
	"header" text,
	"issue_type" text,
	"severity" text,
	"message" text
);
--> statement-breakpoint
CREATE TABLE "session_rows" (
	"session_id" uuid,
	"row_index" integer,
	"original" jsonb,
	"normalized" jsonb,
	"row_score" integer,
	"row_status" text
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"duration" text
);
--> statement-breakpoint
ALTER TABLE "session_cell_issues" ADD CONSTRAINT "session_cell_issues_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_rows" ADD CONSTRAINT "session_rows_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE no action ON UPDATE no action;