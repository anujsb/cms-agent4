// // lib/schema.ts
// import { pgTable, serial, varchar, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// // Create enums for statuses
// export const orderStatusEnum = pgEnum('order_status', ['Active', 'Expired', 'Pending']);
// export const incidentStatusEnum = pgEnum('incident_status', ['Open', 'Pending', 'Resolved']);

// // Updated Users table (combining Users and Customers)
// export const users = pgTable('users', {
//   id: serial('id').primaryKey(),
//   externalId: varchar('external_id', { length: 36 }).notNull().unique(),
//   name: varchar('name', { length: 255 }).notNull(),
//   email: varchar('email', { length: 255 }).notNull().unique(), // Added email field
//   phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
//   createdAt: timestamp('created_at').defaultNow().notNull(),
// });

// // Updated Orders table (combining Orders and OrderProducts)
// export const orders = pgTable('orders', {
//   id: serial('id').primaryKey(),
//   orderId: varchar('order_id', { length: 36 }).notNull().unique(),
//   userId: serial('user_id').references(() => users.id).notNull(),
//   productId: serial('product_id').references(() => products.id), // Added reference to products
//   productName: varchar('product_name', { length: 255 }).notNull(), // Added product name
//   date: timestamp('date').notNull(),
//   inServiceDate: timestamp('in_service_date'), // Added in-service date
//   outServiceDate: timestamp('out_service_date'), // Added out-service date
//   plan: varchar('plan', { length: 255 }).notNull(),
//   status: orderStatusEnum('status').notNull(),
//   createdAt: timestamp('created_at').defaultNow().notNull(),
// });

// // Incidents table
// export const incidents = pgTable('incidents', {
//   id: serial('id').primaryKey(),
//   incidentId: varchar('incident_id', { length: 36 }).notNull().unique(),
//   userId: serial('user_id').references(() => users.id).notNull(),
//   date: timestamp('date').notNull(),
//   description: text('description').notNull(),
//   status: incidentStatusEnum('status').notNull(),
//   createdAt: timestamp('created_at').defaultNow().notNull(),
// });

// // Products table (unchanged)
// export const products = pgTable('products', {
//   id: serial('id').primaryKey(),
//   productName: varchar('product_name', { length: 255 }).notNull().unique(),
//   price: varchar('price', { length: 10 }).notNull(),
// });

// // Invoice table (new table for invoices)
// export const invoices = pgTable('invoices', {
//   id: serial('id').primaryKey(),
//   userId: serial('user_id').references(() => users.id).notNull(),
//   orderId: serial('order_id').references(() => orders.id).notNull(),
//   periodStartDate: timestamp('period_start_date').notNull(),
//   periodEndDate: timestamp('period_end_date').notNull(),
//   price: varchar('price', { length: 10 }).notNull(),
//   adjustment: varchar('adjustment', { length: 10 }), // Optional adjustment field
// });

// // // Example data for users
// // const usersData = [
// //   {
// //     externalId: "uuid-1234", // Add externalId
// //     name: "John Doe",
// //     phoneNumber: "0612345678",
// //     createdAt: new Date(), // Optional, defaults to now
// //   },
// // ];

// // // Example data for orders
// // const ordersData = [
// //   {
// //     orderId: "order-1234", // Add orderId
// //     userId: 1, // Reference to a user
// //     date: new Date(), // Add date
// //     plan: "Unlimited 5G",
// //     status: "Active", // Must match the enum
// //     createdAt: new Date(), // Optional, defaults to now
// //   },
// // ];

// // // Example data for incidents
// // const incidentsData = [
// //   {
// //     incidentId: "incident-1234", // Add incidentId
// //     userId: 1, // Reference to a user
// //     date: new Date(), // Add date
// //     description: "No network coverage in Amsterdam",
// //     status: "Resolved", // Must match the enum
// //     createdAt: new Date(), // Optional, defaults to now
// //   },
// // ];




// lib/schema.ts
import { pgTable, serial, varchar, text, timestamp, pgEnum, integer, numeric, boolean, jsonb } from 'drizzle-orm/pg-core';

// Create enums for statuses
export const orderStatusEnum = pgEnum('order_status', ['Active', 'Expired', 'Pending']);
export const incidentStatusEnum = pgEnum('incident_status', ['Open', 'Pending', 'Resolved']);

// Contacts table (from Contact Table image)
export const contacts = pgTable('contacts', {
  id: serial('id').primaryKey(),
  contactId: varchar('contact_id', { length: 36 }).notNull().unique(),
  firstName: varchar('first_name', { length: 255 }).notNull(),
  surname: varchar('surname', { length: 255 }).notNull(),
  gender: varchar('gender', { length: 1 }),
  age: integer('age'),
});

// Addresses table (from Address Table image)
export const addresses = pgTable('addresses', {
  id: serial('id').primaryKey(),
  addressId: varchar('address_id', { length: 36 }).notNull().unique(),
  postalCode: varchar('postal_code', { length: 20 }),
  city: varchar('city', { length: 255 }),
  state: varchar('state', { length: 255 }),
  country: varchar('country', { length: 2 }),
});

// Customers table (from Customer Table image)
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  customerId: varchar('customer_id', { length: 36 }).notNull().unique(),
  contactId: varchar('contact_id', { length: 36 }).references(() => contacts.contactId),
  addressId: varchar('address_id', { length: 36 }).references(() => addresses.addressId),
});

// Product Types table (from Product image)
export const productTypes = pgTable('product_types', {
  id: serial('id').primaryKey(),
  productTypeId: integer('product_type_id').notNull().unique(),
  type: varchar('type', { length: 255 }).notNull(),
});

// Products table (from Product image)
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  productName: varchar('product_name', { length: 255 }).notNull().unique(),
  productTypeId: integer('product_type_id').references(() => productTypes.productTypeId),
});

// Bill Descriptions table (from BillDescription table image)
export const billDescriptions = pgTable('bill_descriptions', {
  id: serial('id').primaryKey(),
  contractTariffId: varchar('contract_tariff_id', { length: 36 }).notNull().unique(),
  billDescription: varchar('bill_description', { length: 255 }).notNull(),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }),
});

// Orders table (from Order Table image)
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderId: varchar('order_id', { length: 36 }).notNull().unique(),
  customerId: varchar('customer_id', { length: 36 }).references(() => customers.customerId),
  status: orderStatusEnum('status').notNull(),
  createDate: timestamp('create_date').notNull(),
});

// Order Products table (from OrderProduct Table image)
export const orderProducts = pgTable('order_products', {
  id: serial('id').primaryKey(),
  orderProductId: varchar('order_product_id', { length: 36 }).notNull().unique(),
  orderId: varchar('order_id', { length: 36 }).references(() => orders.orderId),
  productTypeId: integer('product_type_id').references(() => productTypes.productTypeId),
  inServiceDt: timestamp('in_service_dt'),
  outServiceDt: timestamp('out_service_dt'),
  previousOrderProductId: varchar('previous_order_product_id', { length: 36 }),
});

// Order Product Parameters table (from OrderProductParameter image)
export const orderProductParameters = pgTable('order_product_parameters', {
  id: serial('id').primaryKey(),
  orderProductId: varchar('order_product_id', { length: 36 }).references(() => orderProducts.orderProductId),
  productTypeId: integer('product_type_id').references(() => productTypes.productTypeId),
  name: varchar('name', { length: 255 }).notNull(),
  value: varchar('value', { length: 255 }),
});

// Order Product Parameter Enums table (from OrderProductParameterEnum image)
export const orderProductParameterEnums = pgTable('order_product_parameter_enums', {
  id: serial('id').primaryKey(),
  productTypeId: integer('product_type_id').references(() => productTypes.productTypeId),
  parameter: varchar('parameter', { length: 255 }).notNull(),
  isOptional: boolean('is_optional').notNull(),
});

// Invoices table (from Invoice Table image)
export const invoices = pgTable('invoices', {
  id: serial('id').primaryKey(),
  invoiceLineId: integer('invoice_line_id').notNull(),
  customerId: varchar('customer_id', { length: 36 }).references(() => customers.customerId),
  invoiceId: integer('invoice_id').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }),
  description: varchar('description', { length: 255 }),
  periodStartDate: timestamp('period_start_date'),
  periodEndDate: timestamp('period_end_date'),
  orderProductId: varchar('order_product_id', { length: 36 }).references(() => orderProducts.orderProductId),
  contractTariffId: varchar('contract_tariff_id', { length: 36 }).references(() => billDescriptions.contractTariffId),
});

// Incidents table (for compatibility with UserRepository)
export const incidents = pgTable('incidents', {
  id: serial('id').primaryKey(),
  incidentId: varchar('incident_id', { length: 36 }).notNull().unique(),
  userId: varchar('user_id', { length: 36 }).notNull(), // Changed from serial to varchar to match customer_id
  date: timestamp('date').notNull(),
  description: text('description').notNull(),
  status: incidentStatusEnum('status').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Users view (mapping customers to the expected user interface)
// This is a compatibility layer to keep the UserRepository working
export const users = pgTable('users_view', {
  id: serial('id').primaryKey(),
  externalId: varchar('external_id', { length: 36 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Personalized Offers table
export const personalizedOffers = pgTable('personalized_offers', {
  id: serial('id').primaryKey(),
  offerId: varchar('offer_id', { length: 36 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  discountPercentage: numeric('discount_percentage', { precision: 5, scale: 2 }).notNull(),
  conditions: jsonb('conditions').notNull(), // Stores conditions like "purchase_count": 5
  productType: varchar('product_type', { length: 255 }).notNull(),
  planType: varchar('plan_type', { length: 255 }).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Current Offers table
export const currentOffers = pgTable('current_offers', {
  id: serial('id').primaryKey(),
  offerId: varchar('offer_id', { length: 36 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  discountPercentage: numeric('discount_percentage', { precision: 5, scale: 2 }).notNull(),
  productType: varchar('product_type', { length: 255 }).notNull(),
  planType: varchar('plan_type', { length: 255 }).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Auth Users table for authentication
export const authUsers = pgTable('auth_users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(), // Will store hashed passwords
  customerId: varchar('customer_id', { length: 36 }).references(() => customers.customerId),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Offers table
export const offers = pgTable('offers', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  discountPercentage: varchar('discount_percentage', { length: 10 }).notNull(),
  productType: varchar('product_type', { length: 50 }).notNull(),
  planType: varchar('plan_type', { length: 50 }).notNull(),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  conditions: jsonb('conditions'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});