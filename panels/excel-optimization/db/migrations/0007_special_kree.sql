ALTER TABLE "excel_session_rows" ADD COLUMN "has_error" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "excel_session_rows" ADD COLUMN "has_warning" integer DEFAULT 0 NOT NULL;