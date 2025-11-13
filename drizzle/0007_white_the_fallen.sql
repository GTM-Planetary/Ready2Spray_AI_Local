ALTER TABLE "personnel" DROP CONSTRAINT "personnel_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "personnel" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "system_role";--> statement-breakpoint
DROP TYPE "public"."system_role";