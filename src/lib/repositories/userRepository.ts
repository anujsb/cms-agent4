// lib/repositories/userRepository.ts
import { db } from '../db';
import { customers, contacts, orders, orderProducts, productTypes, orderProductParameters, incidents, invoices, users } from '../schema';
import { eq, and, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface UserWithDetails {
  id: string;
  name: string;
  phoneNumber: string;
  orders: {
    orderId: string;
    orderProductId: string;
    productName: string;
    inServiceDate: string;
    outServiceDate: string | null;
    plan: string;
    status: string;
    createDate: string;
  }[];
  incidents: {
    incidentId: string;
    date: string;
    description: string;
    status: string;
  }[];
  invoices: {
    id: number;
    periodStartDate: string;
    periodEndDate: string;
    price: string;
    description: string;
    adjustment: string | null;
  }[];
}

interface Order {
  id: string;
  userId: string;
  productName: string;
  plan: string;
  status: 'Active' | 'Expired' | 'Pending';
  createdAt: Date;
}

export class UserRepository {
  // Get all users (basic info only)
  async getAllUsers() {
    // Join customers with contacts to get name
    const results = await db
      .select({
        id: customers.customerId,
        firstName: contacts.firstName,
        surname: contacts.surname,
        // We'll use a placeholder for phoneNumber since it's in the original interface
        // but not in our new schema
        phoneNumber: sql<string>`''`,
      })
      .from(customers)
      .leftJoin(contacts, eq(customers.contactId, contacts.contactId));
      
    // Map results to expected format
    return results.map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.surname}`.trim(),
      phoneNumber: user.phoneNumber || '',
    }));
  }

  // Get a user by their external ID with all details
  async getUserById(externalId: string): Promise<UserWithDetails | null> {
    // Get the customer
    const customerResults = await db
      .select({
        id: customers.customerId,
        firstName: contacts.firstName,
        surname: contacts.surname,
        phoneNumber: sql<string>`''`, // Placeholder
      })
      .from(customers)
      .leftJoin(contacts, eq(customers.contactId, contacts.contactId))
      .where(eq(customers.customerId, externalId));
    
    if (customerResults.length === 0) {
      return null;
    }
    
    const user = customerResults[0];
    
    // Get the user's orders from orderProducts table
    const userOrders = await db
      .select({
        orderId: sql<string>`CAST(${orders.orderId} AS TEXT)`,
        orderProductId: orderProducts.orderProductId,
        productName: sql<string>`COALESCE(${productTypes.type}, '')`,
        inServiceDate: orderProducts.inServiceDt,
        outServiceDate: orderProducts.outServiceDt,
        status: orders.status,
        createDate: orders.createDate,
      })
      .from(orderProducts)
      .leftJoin(orders, eq(orderProducts.orderId, orders.orderId))
      .leftJoin(productTypes, eq(orderProducts.productTypeId, productTypes.productTypeId))
      .where(
        and(
          eq(orders.customerId, externalId),
          sql`${orders.orderId} IS NOT NULL`
        )
      );
    
    // Get plan info from orderProductParameters
    const planParameters = await db
      .select({
        orderProductId: orderProductParameters.orderProductId,
        value: orderProductParameters.value,
      })
      .from(orderProductParameters)
      .where(
        and(
          eq(orderProductParameters.name, 'PlanName'),
          sql`${orderProductParameters.orderProductId} IN (
            SELECT op.order_product_id 
            FROM order_products op
            JOIN orders o ON op.order_id = o.order_id
            WHERE o.customer_id = ${externalId}
          )`
        )
      );
    
    // Create a map of orderProductId to plan
    const planMap = new Map();
    planParameters.forEach(param => {
      planMap.set(param.orderProductId, param.value);
    });
    
    // Get the user's incidents
    const userIncidents = await db
      .select({
        incidentId: incidents.incidentId,
        date: incidents.date,
        description: incidents.description,
        status: incidents.status,
      })
      .from(incidents)
      .where(eq(incidents.userId, externalId));
    
    // Get the user's invoices
    const userInvoices = await db
      .select({
        id: invoices.id,
        periodStartDate: invoices.periodStartDate,
        periodEndDate: invoices.periodEndDate,
        price: invoices.price,
        description: invoices.description,
        adjustment: sql<string>`CASE WHEN ${invoices.price} < 0 THEN ${invoices.price}::text ELSE NULL END`,
      })
      .from(invoices)
      .where(eq(invoices.customerId, externalId));
    
    // Format dates for frontend display
    const formattedOrders = userOrders.map(order => ({
      ...order,
      // Get plan from map or use default value
      plan: planMap.get(order.orderProductId) || 'Standard',
      // Format dates
      inServiceDate: order.inServiceDate ? new Date(order.inServiceDate).toISOString().split('T')[0] : '',
      outServiceDate: order.outServiceDate ? new Date(order.outServiceDate).toISOString().split('T')[0] : null,
      // Map status values from new schema to expected values
      status: this.mapOrderStatus(order.status || ''),
      // Format create date
      createDate: order.createDate ? new Date(order.createDate).toISOString().split('T')[0] : '',
    }));
    
    const formattedIncidents = userIncidents.map(incident => ({
      ...incident,
      date: new Date(incident.date).toISOString().split('T')[0]
    }));
    
    const formattedInvoices = userInvoices.map(invoice => ({
      ...invoice,
      periodStartDate: invoice.periodStartDate ? new Date(invoice.periodStartDate).toISOString().split('T')[0] : '',
      periodEndDate: invoice.periodEndDate ? new Date(invoice.periodEndDate).toISOString().split('T')[0] : '',
      price: invoice.price || '', // Ensure price is always a string
      description: invoice.description || '' // Ensure description is always a string
    }));
    
    // Return the user with their orders, incidents, and invoices
    return {
      id: user.id,
      name: `${user.firstName} ${user.surname}`.trim(),
      phoneNumber: user.phoneNumber || '',
      orders: formattedOrders,
      incidents: formattedIncidents,
      invoices: formattedInvoices,
    };
  }

  // Map old status values to new ones
  private mapOrderStatus(status: string): 'Active' | 'Expired' | 'Pending' {
    switch (status) {
      case 'InProgress':
        return 'Active';
      case 'Completed':
        return 'Expired';
      default:
        return 'Pending';
    }
  }

  // Helper method to map expected status values to DB values
  private mapToDbOrderStatus(status: 'Active' | 'Expired' | 'Pending'): string {
    switch (status) {
      case 'Active': return 'Active';
      case 'Expired': return 'Expired';
      case 'Pending': return 'Pending';
    }
  }

  // Check for expiring plans (within the next 7 days)
  async checkExpiringPlans(userId: string): Promise<{ productName: string; plan: string; daysUntilExpiration: number } | null> {
    // Get the user's active orders
    const userOrders = await db
      .select({
        orderId: sql<string>`CAST(${orders.orderId} AS TEXT)`,
        orderProductId: orderProducts.orderProductId,
        productName: sql<string>`COALESCE(${productTypes.type}, '')`,
        inServiceDate: orderProducts.inServiceDt,
        outServiceDate: orderProducts.outServiceDt,
        status: orders.status,
      })
      .from(orderProducts)
      .leftJoin(orders, eq(orderProducts.orderId, orders.orderId))
      .leftJoin(productTypes, eq(orderProducts.productTypeId, productTypes.productTypeId))
      .where(
        and(
          eq(orders.customerId, userId),
          eq(orders.status, 'Active'), // Changed from 'InProgress' to 'Active'
          sql`${orders.orderId} IS NOT NULL`
        )
      );
    
    // Get plan info from orderProductParameters
    const planParameters = await db
      .select({
        orderProductId: orderProductParameters.orderProductId,
        value: orderProductParameters.value,
      })
      .from(orderProductParameters)
      .where(
        and(
          eq(orderProductParameters.name, 'PlanName'),
          sql`${orderProductParameters.orderProductId} IN (
            SELECT op.order_product_id 
            FROM order_products op
            JOIN orders o ON op.order_id = o.order_id
            WHERE o.customer_id = ${userId}
          )`
        )
      );
    
    // Create a map of orderProductId to plan
    const planMap = new Map();
    planParameters.forEach(param => {
      planMap.set(param.orderProductId, param.value);
    });
    
    // Check for expiring plans
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);
    
    for (const order of userOrders) {
      // If outServiceDate is not set, calculate it based on inServiceDate (1 month from inServiceDate)
      let outServiceDate = order.outServiceDate;
      
      if (!outServiceDate && order.inServiceDate) {
        const inServiceDate = new Date(order.inServiceDate);
        outServiceDate = new Date(inServiceDate);
        outServiceDate.setMonth(outServiceDate.getMonth() + 1); // 1 month from inServiceDate
      }
      
      if (outServiceDate) {
        const expirationDate = new Date(outServiceDate);
        
        // Check if the plan is expiring within the next 7 days
        if (expirationDate > today && expirationDate <= sevenDaysFromNow) {
          const daysUntilExpiration = Math.ceil((expirationDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          
          return {
            productName: order.productName,
            plan: planMap.get(order.orderProductId) || 'Standard',
            daysUntilExpiration
          };
        }
      }
    }
    
    return null; // No expiring plans found
  }

  // Create a new user
  async createUser(name: string, email: string, phoneNumber: string) {
    const customerId = uuidv4();
    
    // Split name into first name and surname
    const nameParts = name.split(' ');
    const firstName = nameParts[0];
    const surname = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    
    // Create contact record
    const contactId = `PER${Math.floor(1000 + Math.random() * 9000)}`;
    await db.insert(contacts).values({
      contactId,
      firstName,
      surname,
      gender: 'M', // Default value
      age: 0, // Default value
    });
    
    // Create customer record
    await db.insert(customers).values({
      customerId,
      contactId,
    });
    
    return customerId;
  }

  // Get product by name or create if it doesn't exist
  async getOrCreateProduct(productName: string, price: string = "0.00") {
    // Try to find the product type first
    const productTypeResults = await db
      .select({
        id: productTypes.productTypeId,
      })
      .from(productTypes)
      .where(eq(productTypes.type, productName));
    
    if (productTypeResults.length > 0) {
      return productTypeResults[0].id;
    }
    
    // If product type doesn't exist, create it
    const result = await db.insert(productTypes).values({
      productTypeId: Math.floor(1000 + Math.random() * 9000), // Generate a unique ID
      type: productName,
    }).returning({ id: productTypes.productTypeId });
    
    return result[0].id;
  }

  // Add an order for a user
  async addOrder(userId: string, productName: string, plan: string, status: 'Active' | 'Expired' | 'Pending', inServiceDate: Date) {
    const orderId = uuidv4();
    
    await db.insert(orders).values({
      orderId,
      customerId: userId,
      status,
      createDate: new Date()
    });

    return orderId;
  }

  // Add an incident for a user
  async addIncident(userId: string, description: string, status: 'Open' | 'Pending' | 'Resolved') {
    // Check if customer exists
    const customerResults = await db
      .select({
        id: customers.customerId,
      })
      .from(customers)
      .where(eq(customers.customerId, userId));
    
    if (customerResults.length === 0) {
      throw new Error('User not found');
    }
    
    // Generate a unique incident ID with timestamp to avoid collisions
    const timestamp = Date.now().toString().slice(-4);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const incidentId = `INC${timestamp}${randomNum}`;
    
    try {
      await db.insert(incidents).values({
        incidentId,
        userId, // Use customer ID as user ID
        date: new Date(),
        description,
        status,
        createdAt: new Date(), // Add created_at timestamp
      });
      
      return incidentId;
    } catch (error) {
      console.error('Error creating incident:', error);
      // If there's a unique constraint error, try again with a new ID
      if (error instanceof Error && (error as any).code === '23505') {
        const newRandomNum = Math.floor(1000 + Math.random() * 9000);
        const newIncidentId = `INC${timestamp}${newRandomNum}`;
        
        await db.insert(incidents).values({
          incidentId: newIncidentId,
          userId,
          date: new Date(),
          description,
          status,
          createdAt: new Date(),
        });
        
        return newIncidentId;
      }
      throw error;
    }
  }

  // Update an incident status
  async updateIncidentStatus(incidentId: string, status: 'Open' | 'Pending' | 'Resolved') {
    await db.update(incidents)
      .set({ status })
      .where(eq(incidents.incidentId, incidentId));
  }

  // Update an order status
  async updateOrderStatus(orderId: string, status: 'Active' | 'Expired' | 'Pending') {
    const dbStatus = this.mapToDbOrderStatus(status);
    
    // First check if orderId is an order product ID
    const orderProductResults = await db
      .select({
        orderId: orderProducts.orderId,
      })
      .from(orderProducts)
      .where(eq(orderProducts.orderProductId, orderId));
    
    if (orderProductResults.length > 0) {
      // Update the order status using the related order ID
      await db.update(orders)
        .set({ status: dbStatus as "Active" | "Expired" | "Pending" })
        .where(eq(orders.orderId, orderProductResults[0].orderId!));
    } else {
      // Try updating directly with the order ID
      await db.update(orders)
        .set({ status: dbStatus as "Pending" | "Active" | "Expired" })
        .where(eq(orders.orderId, orderId));
    }
  }

  // Create a new order
  async createOrder(order: {
    userId: string;
    productName: string;
    plan: string;
    status: 'Active' | 'Expired' | 'Pending';
  }) {
    const orderId = uuidv4();
    
    await db.insert(orders).values({
      orderId,
      customerId: order.userId,
      status: order.status,
      createDate: new Date()
    });

    return { id: orderId };
  }

  // Get user by phone number
  async getUserByPhoneNumber(phoneNumber: string): Promise<UserWithDetails | null> {
    // Get the user from users_view
    const userResults = await db
      .select({
        id: users.externalId,
        name: users.name,
        phoneNumber: users.phoneNumber,
      })
      .from(users)
      .where(eq(users.phoneNumber, phoneNumber));
    
    if (userResults.length === 0) {
      return null;
    }
    
    const user = userResults[0];
    
    // Get the user's orders from orderProducts table
    const userOrders = await db
      .select({
        orderId: sql<string>`CAST(${orders.orderId} AS TEXT)`,
        orderProductId: orderProducts.orderProductId,
        productName: sql<string>`COALESCE(${productTypes.type}, '')`,
        inServiceDate: orderProducts.inServiceDt,
        outServiceDate: orderProducts.outServiceDt,
        status: orders.status,
        createDate: orders.createDate,
      })
      .from(orderProducts)
      .leftJoin(orders, eq(orderProducts.orderId, orders.orderId))
      .leftJoin(productTypes, eq(orderProducts.productTypeId, productTypes.productTypeId))
      .where(
        and(
          eq(orders.customerId, user.id),
          sql`${orders.orderId} IS NOT NULL`
        )
      );
    
    // Get plan info from orderProductParameters
    const planParameters = await db
      .select({
        orderProductId: orderProductParameters.orderProductId,
        value: orderProductParameters.value,
      })
      .from(orderProductParameters)
      .where(
        and(
          eq(orderProductParameters.name, 'PlanName'),
          sql`${orderProductParameters.orderProductId} IN (
            SELECT op.order_product_id 
            FROM order_products op
            JOIN orders o ON op.order_id = o.order_id
            WHERE o.customer_id = ${user.id}
          )`
        )
      );
    
    // Create a map of orderProductId to plan
    const planMap = new Map();
    planParameters.forEach(param => {
      planMap.set(param.orderProductId, param.value);
    });
    
    // Get the user's incidents
    const userIncidents = await db
      .select({
        incidentId: incidents.incidentId,
        date: incidents.date,
        description: incidents.description,
        status: incidents.status,
      })
      .from(incidents)
      .where(eq(incidents.userId, user.id));
    
    // Get the user's invoices
    const userInvoices = await db
      .select({
        id: invoices.id,
        periodStartDate: invoices.periodStartDate,
        periodEndDate: invoices.periodEndDate,
        price: invoices.price,
        description: invoices.description,
        adjustment: sql<string>`CASE WHEN ${invoices.price} < 0 THEN ${invoices.price}::text ELSE NULL END`,
      })
      .from(invoices)
      .where(eq(invoices.customerId, user.id));
    
    // Format dates for frontend display
    const formattedOrders = userOrders.map(order => ({
      ...order,
      plan: planMap.get(order.orderProductId) || 'Standard',
      inServiceDate: order.inServiceDate ? new Date(order.inServiceDate).toISOString().split('T')[0] : '',
      outServiceDate: order.outServiceDate ? new Date(order.outServiceDate).toISOString().split('T')[0] : null,
      status: this.mapOrderStatus(order.status || ''),
      createDate: order.createDate ? new Date(order.createDate).toISOString().split('T')[0] : '',
    }));
    
    const formattedIncidents = userIncidents.map(incident => ({
      ...incident,
      date: new Date(incident.date).toISOString().split('T')[0]
    }));
    
    const formattedInvoices = userInvoices.map(invoice => ({
      ...invoice,
      periodStartDate: invoice.periodStartDate ? new Date(invoice.periodStartDate).toISOString().split('T')[0] : '',
      periodEndDate: invoice.periodEndDate ? new Date(invoice.periodEndDate).toISOString().split('T')[0] : '',
      price: invoice.price || '',
      description: invoice.description || ''
    }));
    
    return {
      id: user.id,
      name: user.name,
      phoneNumber: user.phoneNumber,
      orders: formattedOrders,
      incidents: formattedIncidents,
      invoices: formattedInvoices,
    };
  }

  // Get user's active orders
  async getActiveOrders(userId: string) {
    const userOrders = await db
      .select({
        orderId: orders.orderId,
        status: orders.status,
        createDate: orders.createDate,
      })
      .from(orders)
      .where(
        and(
          eq(orders.customerId, userId),
          eq(orders.status, 'Active'),
          sql`${orders.orderId} IS NOT NULL`
        )
      );

    return userOrders;
  }

  // Get user's expired orders
  async getExpiredOrders(userId: string) {
    const userOrders = await db
      .select({
        orderId: orders.orderId,
        status: orders.status,
        createDate: orders.createDate,
      })
      .from(orders)
      .where(
        and(
          eq(orders.customerId, userId),
          eq(orders.status, 'Expired'),
          sql`${orders.orderId} IS NOT NULL`
        )
      );

    return userOrders;
  }
}