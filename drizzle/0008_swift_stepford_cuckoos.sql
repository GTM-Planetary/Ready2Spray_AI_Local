CREATE TYPE "public"."user_role" AS ENUM('admin', 'manager', 'technician', 'pilot', 'sales');--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "user_role" "user_role" DEFAULT 'sales';