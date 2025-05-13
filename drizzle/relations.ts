import { relations } from "drizzle-orm/relations";
import { users, incidents, orders } from "./schema";

export const incidentsRelations = relations(incidents, ({one}) => ({
	user: one(users, {
		fields: [incidents.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	incidents: many(incidents),
	orders: many(orders),
}));

export const ordersRelations = relations(orders, ({one}) => ({
	user: one(users, {
		fields: [orders.userId],
		references: [users.id]
	}),
}));