CREATE TABLE "offers" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" serial,
  "name" varchar(255) NOT NULL,
  "description" text NOT NULL,
  "discount_percentage" numeric NOT NULL,
  "product_type" varchar(50) NOT NULL,
  "plan_type" varchar(50) NOT NULL,
  "start_date" timestamp NOT NULL,
  "end_date" timestamp NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "conditions" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "offers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action
); 