ALTER TABLE "excel_session_rows" ALTER COLUMN "session_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "excel_session_rows" ALTER COLUMN "row_index" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "excel_session_rows" ALTER COLUMN "original" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "excel_session_rows" ALTER COLUMN "normalized" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "excel_session_rows" ALTER COLUMN "row_score" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "excel_session_rows" ALTER COLUMN "row_status" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "excel_session_rows" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;