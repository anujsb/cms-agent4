// lib/db-migration.ts
import { db } from './db';
import * as schema from './schema';

/**
 * This function creates a view that makes the new database schema 
 * compatible with the existing UserRepository implementation
 */
export async function createCompatibilityView() {
  // Create a view that maps the customers, contacts to the users interface
  await db.execute(`
    CREATE OR REPLACE VIEW users_view AS
    SELECT 
      c.id as id,
      c.customer_id as external_id,
      CONCAT(co.first_name, ' ', co.surname) as name,
      '' as email, -- Add default email since it's required but not in the new schema
      '' as phone_number, -- Add default phone since it's required but not in the new schema
      c.created_at as created_at
    FROM customers c
    JOIN contacts co ON c.contact_id = co.contact_id
  `);
  
  console.log('Created users_view compatibility view');
}

/**
 * This function maps order data between the new schema and the format
 * expected by the UserRepository
 */
export async function createOrdersView() {
  await db.execute(`
    CREATE OR REPLACE VIEW orders_view AS
    SELECT
      op.id as id,
      op.order_product_id as order_id,
      c.customer_id as user_id,
      pt.id as product_id,
      pt.type as product_name,
      o.create_date as date,
      op.in_service_dt as in_service_date,
      op.out_service_dt as out_service_date,
      COALESCE((
        SELECT opp.value
        FROM order_product_parameters opp
        WHERE opp.order_product_id = op.order_product_id AND opp.name = 'PlanName'
        LIMIT 1
      ), 'Standard') as plan,
      o.status as status,
      o.create_date as created_at
    FROM order_products op
    JOIN orders o ON op.order_id = o.order_id
    JOIN customers c ON o.customer_id = c.customer_id
    JOIN product_types pt ON op.product_type_id = pt.product_type_id
  `);
  
  console.log('Created orders_view compatibility view');
}

/**
 * This function creates an invoices view to match the expected format
 */
export async function createInvoicesView() {
  await db.execute(`
    CREATE OR REPLACE VIEW invoices_view AS
    SELECT
      i.id as id,
      c.customer_id as user_id,
      i.invoice_id as order_id,
      i.period_start_date as period_start_date,
      i.period_end_date as period_end_date,
      i.price as price,
      CASE WHEN i.price < 0 THEN CAST(i.price AS VARCHAR) ELSE NULL END as adjustment
    FROM invoices i
    JOIN customers c ON i.customer_id = c.customer_id
  `);
  
  console.log('Created invoices_view compatibility view');
}

export async function ensureEnumsExist() {
  // Check and create the 'incident_status' enum if it doesn't exist
  await db.execute(`
    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'incident_status') THEN
        CREATE TYPE incident_status AS ENUM ('Open', 'Pending', 'Resolved');
      END IF;
    END $$;
  `);

  console.log('Ensured incident_status enum exists');
}

/**
 * Run all migrations
 */
export async function migrateDatabase() {
  try {
    await ensureEnumsExist();
    await createCompatibilityView();
    await createOrdersView();
    await createInvoicesView();
    console.log('Database migration completed successfully');
  } catch (error) {
    console.error('Database migration failed:', error);
    throw error;
  }
}

// Execute migration if this file is run directly
if (require.main === module) {
  migrateDatabase()
    .then(() => console.log('Migration complete'))
    .catch(console.error)
    .finally(() => process.exit());
}