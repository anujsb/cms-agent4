// lib/repositories/offerRepository.ts
import { db } from '../db';
import { personalizedOffers, currentOffers, orderProducts, productTypes, orders } from '../schema';
import { eq, and, sql, gte, lte } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface Offer {
  offerId: string;
  name: string;
  description: string;
  discountPercentage: string;
  productType: string;
  planType: string;
  startDate: Date;
  endDate: Date;
}

export class OfferRepository {
  // Get all current active offers
  async getCurrentOffers(): Promise<Offer[]> {
    const now = new Date();
    
    const offers = await db
      .select({
        offerId: currentOffers.offerId,
        name: currentOffers.name,
        description: currentOffers.description,
        discountPercentage: currentOffers.discountPercentage,
        productType: currentOffers.productType,
        planType: currentOffers.planType,
        startDate: currentOffers.startDate,
        endDate: currentOffers.endDate,
      })
      .from(currentOffers)
      .where(
        and(
          eq(currentOffers.isActive, true),
          lte(currentOffers.startDate, now),
          gte(currentOffers.endDate, now)
        )
      );
    
    return offers;
  }

  // Get personalized offers for a user
  async getPersonalizedOffers(userId: string): Promise<Offer[]> {
    const now = new Date();
    
    // Get user's purchase history with count (using productTypeId)
    const userPurchases = await db
      .select({
        productTypeId: productTypes.productTypeId,
        planType: sql<string>`COALESCE((
          SELECT opp.value
          FROM order_product_parameters opp
          WHERE opp.order_product_id = order_products.order_product_id AND opp.name = 'PlanName'
          LIMIT 1
        ), 'Standard')`,
        purchaseCount: sql<number>`COUNT(DISTINCT order_products.order_product_id)`,
      })
      .from(orderProducts)
      .innerJoin(orders, eq(orderProducts.orderId, orders.orderId))
      .innerJoin(productTypes, eq(orderProducts.productTypeId, productTypes.productTypeId))
      .where(eq(orders.customerId, userId))
      .groupBy(productTypes.productTypeId, sql`COALESCE((
        SELECT opp.value
        FROM order_product_parameters opp
        WHERE opp.order_product_id = order_products.order_product_id AND opp.name = 'PlanName'
        LIMIT 1
      ), 'Standard')`);

    console.log('User purchases:', userPurchases); // Debug log

    // Get all active personalized offers (using productTypeId)
    const allOffers = await db
      .select({
        offerId: personalizedOffers.offerId,
        name: personalizedOffers.name,
        description: personalizedOffers.description,
        discountPercentage: personalizedOffers.discountPercentage,
        productTypeId: personalizedOffers.productType, // now integer
        planType: personalizedOffers.planType,
        startDate: personalizedOffers.startDate,
        endDate: personalizedOffers.endDate,
        conditions: personalizedOffers.conditions,
      })
      .from(personalizedOffers)
      .where(
        and(
          eq(personalizedOffers.isActive, true),
          lte(personalizedOffers.startDate, now),
          gte(personalizedOffers.endDate, now)
        )
      );

    console.log('All offers:', allOffers); // Debug log

    // Filter offers based on user's purchase history
    const eligibleOffers = allOffers.filter(offer => {
      const conditions = offer.conditions as { purchase_count: number };
      // Ensure both are numbers for comparison
      const offerProductTypeId = typeof offer.productTypeId === 'string' ? parseInt(offer.productTypeId, 10) : offer.productTypeId;
      const matchingPurchase = userPurchases.find(
        p => Number(p.productTypeId) === offerProductTypeId && p.planType === offer.planType
      );

      console.log('Checking offer:', offer.name, 'against purchase:', matchingPurchase); // Debug log

      return matchingPurchase && matchingPurchase.purchaseCount >= conditions.purchase_count;
    });

    // Remove conditions from the response and map productTypeId to productType for Offer interface
    return eligibleOffers.map(({ conditions, productTypeId, ...offer }) => ({
      ...offer,
      productType: String(productTypeId), // or you can fetch the name if needed
    }));
  }

  // Add a new current offer
  async addCurrentOffer(offer: Omit<Offer, 'offerId'>): Promise<string> {
    const offerId = uuidv4();
    
    await db.insert(currentOffers).values({
      offerId,
      name: offer.name,
      description: offer.description,
      discountPercentage: offer.discountPercentage,
      productType: offer.productType,
      planType: offer.planType,
      startDate: offer.startDate,
      endDate: offer.endDate,
      isActive: true,
      createdAt: new Date(),
    });
    
    return offerId;
  }

  // Add a new personalized offer
  async addPersonalizedOffer(
    offer: Omit<Offer, 'offerId'>,
    conditions: { purchase_count: number }
  ): Promise<string> {
    const offerId = uuidv4();
    
    await db.insert(personalizedOffers).values({
      offerId,
      name: offer.name,
      description: offer.description,
      discountPercentage: offer.discountPercentage,
      productType: offer.productType,
      planType: offer.planType,
      startDate: offer.startDate,
      endDate: offer.endDate,
      conditions,
      isActive: true,
      createdAt: new Date(),
    });
    
    return offerId;
  }
} 