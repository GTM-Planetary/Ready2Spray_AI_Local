CREATE TYPE "public"."application_method" AS ENUM('aerial', 'ground_boom', 'backpack', 'hand_wand', 'ulv', 'chemigation', 'other');--> statement-breakpoint
CREATE TYPE "public"."equipment_status" AS ENUM('active', 'maintenance', 'inactive');--> statement-breakpoint
CREATE TYPE "public"."equipment_type" AS ENUM('plane', 'helicopter', 'ground_rig', 'truck', 'backpack', 'hand_sprayer', 'ulv', 'other');--> statement-breakpoint
CREATE TYPE "public"."org_mode" AS ENUM('ag_aerial', 'residential_pest', 'both');--> statement-breakpoint
CREATE TYPE "public"."product_type" AS ENUM('herbicide', 'insecticide', 'fungicide', 'rodenticide', 'adjuvant', 'other');--> statement-breakpoint
CREATE TYPE "public"."property_type" AS ENUM('residential', 'commercial', 'multi_family', 'industrial');--> statement-breakpoint
CREATE TYPE "public"."service_plan_status" AS ENUM('active', 'paused', 'cancelled', 'completed');--> statement-breakpoint
CREATE TYPE "public"."service_plan_type" AS ENUM('monthly', 'quarterly', 'bi_monthly', 'annual', 'one_off');--> statement-breakpoint
CREATE TYPE "public"."signal_word" AS ENUM('caution', 'warning', 'danger');--> statement-breakpoint
CREATE TYPE "public"."site_type" AS ENUM('field', 'orchard', 'vineyard', 'pivot', 'property', 'commercial_building');--> statement-breakpoint
CREATE TYPE "public"."zone_type" AS ENUM('interior', 'exterior', 'yard', 'garage', 'attic', 'basement', 'crawl_space', 'perimeter', 'custom');--> statement-breakpoint
ALTER TYPE "public"."personnel_role" ADD VALUE 'ground_crew';--> statement-breakpoint
ALTER TYPE "public"."personnel_role" ADD VALUE 'manager';--> statement-breakpoint
ALTER TYPE "public"."personnel_role" ADD VALUE 'dispatcher';--> statement-breakpoint
CREATE TABLE "applications" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "applications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"org_id" integer NOT NULL,
	"job_id" integer NOT NULL,
	"site_id" integer,
	"customer_id" integer,
	"applicator_id" integer,
	"supervisor_id" integer,
	"equipment_id" integer,
	"application_date" date NOT NULL,
	"start_time" time,
	"end_time" time,
	"products_applied" json,
	"acres_treated" numeric(10, 2),
	"area_unit" varchar(20) DEFAULT 'acres',
	"application_method" "application_method" NOT NULL,
	"temperature_f" numeric(5, 2),
	"wind_speed_mph" numeric(5, 2),
	"wind_direction" varchar(10),
	"humidity_percent" numeric(5, 2),
	"weather_conditions" varchar(255),
	"target_pest" varchar(255),
	"crop" varchar(100),
	"phi_date" date,
	"rei_datetime" timestamp,
	"completed_by_id" integer,
	"verified_by_id" integer,
	"verification_date" date,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "equipment" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "equipment_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"org_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"equipment_type" "equipment_type" NOT NULL,
	"tail_number" varchar(50),
	"license_plate" varchar(50),
	"serial_number" varchar(100),
	"tank_capacity" numeric(10, 2),
	"swath_width" numeric(10, 2),
	"max_speed" numeric(10, 2),
	"status" "equipment_status" DEFAULT 'active',
	"last_maintenance_date" date,
	"next_maintenance_date" date,
	"maintenance_notes" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_use" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "product_use_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"product_id" integer NOT NULL,
	"crop" varchar(100),
	"pest" varchar(100),
	"site_category" varchar(100),
	"min_rate" numeric(10, 4),
	"max_rate" numeric(10, 4),
	"rate_unit" varchar(50),
	"max_applications_per_season" integer,
	"max_total_per_season" numeric(10, 4),
	"max_total_unit" varchar(50),
	"min_carrier_volume" numeric(10, 2),
	"max_carrier_volume" numeric(10, 2),
	"carrier_unit" varchar(50),
	"phi_days" integer,
	"rei_hours" integer,
	"reentry_conditions" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products_new" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "products_new_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"org_id" integer NOT NULL,
	"epa_reg_number" varchar(50) NOT NULL,
	"brand_name" varchar(255) NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"manufacturer" varchar(255),
	"active_ingredients" json,
	"product_type" "product_type" NOT NULL,
	"signal_word" "signal_word" NOT NULL,
	"is_rup" boolean DEFAULT false,
	"indoor_allowed" boolean DEFAULT false,
	"outdoor_allowed" boolean DEFAULT true,
	"aerial_allowed" boolean DEFAULT false,
	"ground_boom_allowed" boolean DEFAULT true,
	"backpack_allowed" boolean DEFAULT false,
	"hand_wand_allowed" boolean DEFAULT false,
	"ulv_allowed" boolean DEFAULT false,
	"chemigation_allowed" boolean DEFAULT false,
	"use_sites" json,
	"label_pdf_url" text,
	"sds_url" text,
	"manufacturer_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_plans" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "service_plans_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"org_id" integer NOT NULL,
	"customer_id" integer NOT NULL,
	"site_id" integer,
	"plan_name" varchar(255) NOT NULL,
	"plan_type" "service_plan_type" NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"next_service_date" date,
	"default_zones" json,
	"default_products" json,
	"default_target_pests" json,
	"price_per_service" numeric(10, 2),
	"currency" varchar(10) DEFAULT 'USD',
	"status" "service_plan_status" DEFAULT 'active',
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sites" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "sites_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"org_id" integer NOT NULL,
	"customer_id" integer,
	"name" varchar(255) NOT NULL,
	"site_type" "site_type" NOT NULL,
	"address" text,
	"city" varchar(100),
	"state" varchar(50),
	"zip_code" varchar(20),
	"polygon" json,
	"center_lat" numeric(10, 8),
	"center_lng" numeric(11, 8),
	"acres" numeric(10, 2),
	"crop" varchar(100),
	"variety" varchar(100),
	"growth_stage" varchar(50),
	"sensitive_areas" json,
	"property_type" "property_type",
	"units" integer DEFAULT 1,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "zones" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "zones_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"site_id" integer NOT NULL,
	"name" varchar(100) NOT NULL,
	"zone_type" "zone_type" NOT NULL,
	"description" text,
	"special_instructions" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "site_id" integer;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "equipment_id" integer;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "service_plan_id" integer;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "acres" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "carrier_volume" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "carrier_unit" varchar(50) DEFAULT 'GPA';--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "num_loads" integer;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "zones_to_treat" json;--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "weather_conditions" varchar(255);--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "temperature_f" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "wind_speed_mph" numeric(5, 2);--> statement-breakpoint
ALTER TABLE "jobs" ADD COLUMN "wind_direction" varchar(10);--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "mode" "org_mode" DEFAULT 'ag_aerial' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "features_enabled" json;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_job_id_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."jobs"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_applicator_id_personnel_id_fk" FOREIGN KEY ("applicator_id") REFERENCES "public"."personnel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_supervisor_id_personnel_id_fk" FOREIGN KEY ("supervisor_id") REFERENCES "public"."personnel"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_completed_by_id_users_id_fk" FOREIGN KEY ("completed_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_verified_by_id_users_id_fk" FOREIGN KEY ("verified_by_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "equipment" ADD CONSTRAINT "equipment_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_use" ADD CONSTRAINT "product_use_product_id_products_new_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products_new"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products_new" ADD CONSTRAINT "products_new_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_plans" ADD CONSTRAINT "service_plans_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_plans" ADD CONSTRAINT "service_plans_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_plans" ADD CONSTRAINT "service_plans_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sites" ADD CONSTRAINT "sites_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sites" ADD CONSTRAINT "sites_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "zones" ADD CONSTRAINT "zones_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_site_id_sites_id_fk" FOREIGN KEY ("site_id") REFERENCES "public"."sites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_equipment_id_equipment_id_fk" FOREIGN KEY ("equipment_id") REFERENCES "public"."equipment"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_service_plan_id_service_plans_id_fk" FOREIGN KEY ("service_plan_id") REFERENCES "public"."service_plans"("id") ON DELETE no action ON UPDATE no action;