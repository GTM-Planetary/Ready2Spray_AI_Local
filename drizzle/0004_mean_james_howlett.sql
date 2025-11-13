CREATE TYPE "public"."maintenance_frequency_type" AS ENUM('hours', 'days', 'months', 'one_time');--> statement-breakpoint
CREATE TYPE "public"."maintenance_status" AS ENUM('pending', 'in_progress', 'completed', 'overdue');--> statement-breakpoint
CREATE TYPE "public"."maintenance_task_type" AS ENUM('inspection', 'oil_change', 'filter_replacement', 'tire_rotation', 'annual_certification', 'engine_overhaul', 'custom');--> statement-breakpoint
CREATE TABLE "maintenance_tasks" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "maintenance_tasks_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"equipment_id" integer NOT NULL,
	"task_name" varchar(255) NOT NULL,
	"description" text,
	"task_type" "maintenance_task_type" NOT NULL,
	"frequency_type" "maintenance_frequency_type" NOT NULL,
	"frequency_value" integer NOT NULL,
	"last_completed_date" timestamp,
	"next_due_date" timestamp,
	"is_recurring" boolean DEFAULT true,
	"estimated_cost" numeric(10, 2),
	"actual_cost" numeric(10, 2),
	"status" "maintenance_status" DEFAULT 'pending' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "maintenance_tasks" ADD CONSTRAINT "maintenance_tasks_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE cascade ON UPDATE no action;