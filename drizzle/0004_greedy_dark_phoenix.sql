CREATE TABLE "addresses" (
	"id" serial PRIMARY KEY NOT NULL,
	"address_id" varchar(36) NOT NULL,
	"postal_code" varchar(20),
	"city" varchar(255),
	"state" varchar(255),
	"country" varchar(2),
	CONSTRAINT "addresses_address_id_unique" UNIQUE("address_id")
);
--> statement-breakpoint
CREATE TABLE "bill_descriptions" (
	"id" serial PRIMARY KEY NOT NULL,
	"contract_tariff_id" varchar(36) NOT NULL,
	"bill_description" varchar(255) NOT NULL,
	"unit_price" numeric(10, 2),
	CONSTRAINT "bill_descriptions_contract_tariff_id_unique" UNIQUE("contract_tariff_id")
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"contact_id" varchar(36) NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"surname" varchar(255) NOT NULL,
	"gender" varchar(1),
	"age" integer,
	CONSTRAINT "contacts_contact_id_unique" UNIQUE("contact_id")
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" varchar(36) NOT NULL,
	"contact_id" varchar(36),
	"address_id" varchar(36),
	CONSTRAINT "customers_customer_id_unique" UNIQUE("customer_id")
);
--> statement-breakpoint
CREATE TABLE "order_product_parameters" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_product_id" varchar(36),
	"product_type_id" integer,
	"name" varchar(255) NOT NULL,
	"value" varchar(255)
);
--> statement-breakpoint
CREATE TABLE "order_products" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_product_id" varchar(36) NOT NULL,
	"order_id" varchar(36),
	"product_type_id" integer,
	"in_service_dt" timestamp,
	"out_service_dt" timestamp,
	"previous_order_product_id" varchar(36),
	CONSTRAINT "order_products_order_product_id_unique" UNIQUE("order_product_id")
);
--> statement-breakpoint
CREATE TABLE "product_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_type_id" integer NOT NULL,
	"type" varchar(255) NOT NULL,
	CONSTRAINT "product_types_product_type_id_unique" UNIQUE("product_type_id")
);
--> statement-breakpoint
CREATE TABLE "users_view" (
	"id" serial PRIMARY KEY NOT NULL,
	"external_id" varchar(36) NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone_number" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_view_external_id_unique" UNIQUE("external_id"),
	CONSTRAINT "users_view_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "users" RENAME TO "order_product_parameter_enums";--> statement-breakpoint
ALTER TABLE "order_product_parameter_enums" DROP CONSTRAINT "users_external_id_unique";--> statement-breakpoint
ALTER TABLE "order_product_parameter_enums" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
ALTER TABLE "incidents" DROP CONSTRAINT "incidents_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "invoices" DROP CONSTRAINT "invoices_order_id_orders_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_product_id_products_id_fk";
--> statement-breakpoint
ALTER TABLE "incidents" ALTER COLUMN "user_id" SET DATA TYPE varchar(36);--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "period_start_date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "period_end_date" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "price" SET DATA TYPE numeric(10, 2);--> statement-breakpoint
ALTER TABLE "invoices" ALTER COLUMN "price" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "invoice_line_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "customer_id" varchar(36);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "invoice_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "description" varchar(255);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "order_product_id" varchar(36);--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "contract_tariff_id" varchar(36);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "customer_id" varchar(36);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "create_date" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "products" ADD COLUMN "product_type_id" integer;--> statement-breakpoint
ALTER TABLE "order_product_parameter_enums" ADD COLUMN "product_type_id" integer;--> statement-breakpoint
ALTER TABLE "order_product_parameter_enums" ADD COLUMN "parameter" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "order_product_parameter_enums" ADD COLUMN "is_optional" boolean NOT NULL;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_contact_id_contacts_contact_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("contact_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "customers" ADD CONSTRAINT "customers_address_id_addresses_address_id_fk" FOREIGN KEY ("address_id") REFERENCES "public"."addresses"("address_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_product_parameters" ADD CONSTRAINT "order_product_parameters_order_product_id_order_products_order_product_id_fk" FOREIGN KEY ("order_product_id") REFERENCES "public"."order_products"("order_product_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_product_parameters" ADD CONSTRAINT "order_product_parameters_product_type_id_product_types_product_type_id_fk" FOREIGN KEY ("product_type_id") REFERENCES "public"."product_types"("product_type_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_products" ADD CONSTRAINT "order_products_order_id_orders_order_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("order_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_products" ADD CONSTRAINT "order_products_product_type_id_product_types_product_type_id_fk" FOREIGN KEY ("product_type_id") REFERENCES "public"."product_types"("product_type_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_customer_id_customers_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("customer_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_order_product_id_order_products_order_product_id_fk" FOREIGN KEY ("order_product_id") REFERENCES "public"."order_products"("order_product_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_contract_tariff_id_bill_descriptions_contract_tariff_id_fk" FOREIGN KEY ("contract_tariff_id") REFERENCES "public"."bill_descriptions"("contract_tariff_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_customers_customer_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."customers"("customer_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "products" ADD CONSTRAINT "products_product_type_id_product_types_product_type_id_fk" FOREIGN KEY ("product_type_id") REFERENCES "public"."product_types"("product_type_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_product_parameter_enums" ADD CONSTRAINT "order_product_parameter_enums_product_type_id_product_types_product_type_id_fk" FOREIGN KEY ("product_type_id") REFERENCES "public"."product_types"("product_type_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN "order_id";--> statement-breakpoint
ALTER TABLE "invoices" DROP COLUMN "adjustment";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "product_id";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "product_name";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "date";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "in_service_date";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "out_service_date";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "plan";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "price";--> statement-breakpoint
ALTER TABLE "order_product_parameter_enums" DROP COLUMN "external_id";--> statement-breakpoint
ALTER TABLE "order_product_parameter_enums" DROP COLUMN "name";--> statement-breakpoint
ALTER TABLE "order_product_parameter_enums" DROP COLUMN "email";--> statement-breakpoint
ALTER TABLE "order_product_parameter_enums" DROP COLUMN "phone_number";--> statement-breakpoint
ALTER TABLE "order_product_parameter_enums" DROP COLUMN "created_at";--> statement-breakpoint
ALTER TABLE "public"."orders" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."order_status";--> statement-breakpoint
CREATE TYPE "public"."order_status" AS ENUM('InProgress', 'Completed', 'Pending');--> statement-breakpoint
ALTER TABLE "public"."orders" ALTER COLUMN "status" SET DATA TYPE "public"."order_status" USING "status"::"public"."order_status";