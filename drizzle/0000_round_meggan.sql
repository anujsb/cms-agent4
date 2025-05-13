CREATE TYPE "public"."incident_status" AS ENUM('Open', 'Pending', 'Resolved');--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('Active', 'Expired', 'Pending');--> statement-breakpoint
CREATE TABLE "incidents" (
	"id" serial PRIMARY KEY NOT NULL,
	"incident_id" varchar(36) NOT NULL,
	"user_id" serial NOT NULL,
	"date" timestamp NOT NULL,
	"description" text NOT NULL,
	"status" "incident_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "incidents_incident_id_unique" UNIQUE("incident_id")
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" varchar(36) NOT NULL,
	"user_id" serial NOT NULL,
	"date" timestamp NOT NULL,
	"plan" varchar(255) NOT NULL,
	"status" "order_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "orders_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"external_id" varchar(36) NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
ALTER TABLE "incidents" ADD CONSTRAINT "incidents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;