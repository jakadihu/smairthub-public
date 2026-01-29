ALTER TABLE "excel_sessions" ADD COLUMN "status" text DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "excel_sessions" ADD COLUMN "progress" double precision DEFAULT 0 NOT NULL;