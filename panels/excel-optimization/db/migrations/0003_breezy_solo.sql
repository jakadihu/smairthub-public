ALTER TABLE "excel_session_issues" ALTER COLUMN "session_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "excel_session_issues" ALTER COLUMN "header" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "excel_session_issues" ALTER COLUMN "issue_type" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "excel_session_issues" ALTER COLUMN "severity" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "excel_session_issues" ALTER COLUMN "message" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "excel_session_issues" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "excel_session_issues" ADD COLUMN "row_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "excel_session_issues" ADD CONSTRAINT "excel_session_issues_row_id_excel_session_rows_id_fk" FOREIGN KEY ("row_id") REFERENCES "public"."excel_session_rows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "excel_session_issues" DROP COLUMN "row_index";