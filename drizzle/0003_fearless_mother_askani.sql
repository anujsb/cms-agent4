CREATE TABLE "invoices" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" serial NOT NULL,
	"order_id" serial NOT NULL,
	"period_start_date" timestamp NOT NULL,
	"period_end_date" timestamp NOT NULL,
	"price" varchar(10) NOT NULL,
	"adjustment" varchar(10)
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"price" varchar(10) NOT NULL,
	CONSTRAINT "products_product_name_unique" UNIQUE("product_name")
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "product_id" serial NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "product_name" varchar(255);--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "in_service_date" timestamp;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "out_service_date" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "email" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");