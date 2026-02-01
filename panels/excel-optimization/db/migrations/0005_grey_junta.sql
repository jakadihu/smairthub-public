ALTER TABLE "excel_sessions" ADD COLUMN "updated_at" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "excel_sessions" ADD COLUMN "error" text;