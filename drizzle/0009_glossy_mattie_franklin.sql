ALTER TABLE "users" ALTER COLUMN "user_role" SET DATA TYPE varchar(20);--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "user_role" SET DEFAULT 'sales';--> statement-breakpoint
DROP TYPE "public"."user_role";