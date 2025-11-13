CREATE TYPE "public"."entity_type" AS ENUM('customer', 'job', 'personnel', 'site');--> statement-breakpoint
CREATE TYPE "public"."integration_type" AS ENUM('zoho_crm', 'fieldpulse');--> statement-breakpoint
CREATE TYPE "public"."sync_direction" AS ENUM('to_external', 'from_external');--> statement-breakpoint
CREATE TYPE "public"."sync_operation" AS ENUM('create', 'update', 'delete');--> statement-breakpoint
CREATE TYPE "public"."sync_status" AS ENUM('success', 'error', 'skipped');--> statement-breakpoint
CREATE TABLE "integration_connections" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "integration_connections_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"organization_id" integer NOT NULL,
	"integration_type" "integration_type" NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"zoho_client_id" varchar(255),
	"zoho_client_secret" varchar(255),
	"zoho_access_token" text,
	"zoho_refresh_token" text,
	"zoho_token_expires_at" timestamp,
	"zoho_data_center" varchar(50),
	"fieldpulse_api_key" varchar(255),
	"sync_customers" boolean DEFAULT true,
	"sync_jobs" boolean DEFAULT true,
	"sync_personnel" boolean DEFAULT false,
	"sync_interval_minutes" integer DEFAULT 15,
	"last_sync_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integration_entity_mappings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "integration_entity_mappings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"connection_id" integer NOT NULL,
	"entity_type" "entity_type" NOT NULL,
	"ready2spray_id" integer NOT NULL,
	"external_id" varchar(255) NOT NULL,
	"last_synced_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integration_field_mappings" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "integration_field_mappings_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"connection_id" integer NOT NULL,
	"entity_type" "entity_type" NOT NULL,
	"ready2spray_field" varchar(100) NOT NULL,
	"external_field" varchar(100) NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integration_sync_logs" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "integration_sync_logs_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"connection_id" integer NOT NULL,
	"sync_direction" "sync_direction" NOT NULL,
	"entity_type" "entity_type" NOT NULL,
	"entity_id" integer NOT NULL,
	"external_id" varchar(255),
	"operation" "sync_operation" NOT NULL,
	"status" "sync_status" NOT NULL,
	"error_message" text,
	"request_data" json,
	"response_data" json,
	"synced_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "integration_connections" ADD CONSTRAINT "integration_connections_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_entity_mappings" ADD CONSTRAINT "integration_entity_mappings_connection_id_integration_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."integration_connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_field_mappings" ADD CONSTRAINT "integration_field_mappings_connection_id_integration_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."integration_connections"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "integration_sync_logs" ADD CONSTRAINT "integration_sync_logs_connection_id_integration_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."integration_connections"("id") ON DELETE no action ON UPDATE no action;