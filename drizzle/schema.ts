import { pgTable, unique, serial, varchar, timestamp, foreignKey, text, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const incidentStatus = pgEnum("incident_status", ['Open', 'Pending', 'Resolved'])
export const orderStatus = pgEnum("order_status", ['Active', 'Expired', 'Pending'])


export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	externalId: varchar("external_id", { length: 36 }).notNull(),
	name: varchar({ length: 255 }).notNull(),
	phoneNumber: varchar("phone_number", { length: 20 }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_external_id_unique").on(table.externalId),
]);

export const incidents = pgTable("incidents", {
	id: serial().primaryKey().notNull(),
	incidentId: varchar("incident_id", { length: 36 }).notNull(),
	userId: serial("user_id").notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	description: text().notNull(),
	status: incidentStatus().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "incidents_user_id_users_id_fk"
		}),
	unique("incidents_incident_id_unique").on(table.incidentId),
]);

export const orders = pgTable("orders", {
	id: serial().primaryKey().notNull(),
	orderId: varchar("order_id", { length: 36 }).notNull(),
	userId: serial("user_id").notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	plan: varchar({ length: 255 }).notNull(),
	status: orderStatus().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "orders_user_id_users_id_fk"
		}),
	unique("orders_order_id_unique").on(table.orderId),
]);
