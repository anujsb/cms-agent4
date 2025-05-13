// lib/data.ts
export interface User {
  id: string;
  name: string;
  phoneNumber: string;
  orders: Order[];
  incidents: Incident[];
}

export interface Order {
  orderId: string;
  date: string;
  plan: string;
  status: string;
}

export interface Incident {
  incidentId: string;
  date: string;
  description: string;
  status: string;
}

export const users: User[] = [
  {
    id: "user1",
    name: "John Doe",
    phoneNumber: "0612345678",
    orders: [
      { orderId: "ORD001", date: "2025-01-15", plan: "Unlimited 5G", status: "Active" },
      { orderId: "ORD002", date: "2024-12-01", plan: "Basic 4G", status: "Expired" },
    ],
    incidents: [
      { incidentId: "INC001", date: "2025-03-20", description: "No network coverage in Amsterdam", status: "Resolved" },
      { incidentId: "INC002", date: "2025-03-25", description: "Overcharged on last bill", status: "Pending" },
      { incidentId: "INC003", date: "2025-03-27", description: "SIM card not delivered", status: "Open" },
    ],
  },
  {
    id: "user2",
    name: "Jane Smith",
    phoneNumber: "0698765432",
    orders: [
      { orderId: "ORD003", date: "2025-02-10", plan: "Family Plan 10GB", status: "Active" },
    ],
    incidents: [
      { incidentId: "INC004", date: "2025-03-27", description: "Slow internet speed at home", status: "Open" },
      { incidentId: "INC005", date: "2025-03-28", description: "Unable to make international calls", status: "Open" },
    ],
  },
];