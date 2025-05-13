const { db } = require('@/lib/db');
const { users, orders, incidents } = require('@/lib/schema');

async function seed() {
  try {
    // Clear existing data
    await db.delete(incidents);
    await db.delete(orders);
    await db.delete(users);

    // Insert users
    await db.insert(users).values([
      { externalId: "user1", name: "John Doe", phoneNumber: "0612345678" },
      { externalId: "user2", name: "Jane Smith", phoneNumber: "0698765432" },
    ]);

    // Insert orders
    await db.insert(orders).values([
      { orderId: "ORD001", date: new Date("2025-01-15"), plan: "Unlimited 5G", status: "Active", userId: 1 },
      { orderId: "ORD002", date: new Date("2024-12-01"), plan: "Basic 4G", status: "Expired", userId: 1 },
      { orderId: "ORD003", date: new Date("2025-02-10"), plan: "Family Plan 10GB", status: "Active", userId: 2 },
    ]);

    // Insert incidents
    await db.insert(incidents).values([
      { incidentId: "INC001", date: new Date("2025-03-20"), description: "No network coverage in Amsterdam", status: "Resolved", userId: 1 },
      { incidentId: "INC002", date: new Date("2025-03-25"), description: "Overcharged on last bill", status: "Pending", userId: 1 },
      { incidentId: "INC003", date: new Date("2025-03-27"), description: "SIM card not delivered", status: "Open", userId: 1 },
      { incidentId: "INC004", date: new Date("2025-03-27"), description: "Slow internet speed at home", status: "Open", userId: 2 },
      { incidentId: "INC005", date: new Date("2025-03-28"), description: "Unable to make international calls", status: "Open", userId: 2 },
    ]);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed().then(() => process.exit(0));