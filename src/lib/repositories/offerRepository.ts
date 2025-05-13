// lib/repositories/offerRepository.ts
import { db } from '../db';
import { offers } from '../schema';
import { eq, and, gte, lte, desc, isNull } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface Offer {
  id: number;
  userId?: number;
  name: string;
  description: string;
  discountPercentage: string;
  productType: string;
  planType: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  conditions?: any;
  createdAt: Date;
}

export class OfferRepository {
  // Get all current active offers
  async getCurrentOffers(): Promise<Offer[]> {
    const now = new Date();
    
    const currentOffers = await db
      .select()
      .from(offers)
      .where(
        and(
          eq(offers.isActive, true),
          isNull(offers.userId),
          lte(offers.startDate, now),
          gte(offers.endDate, now)
        )
      )
      .orderBy(desc(offers.createdAt));
    
    return currentOffers;
  }

  // Get personalized offers for a user
  async getPersonalizedOffers(userId: string): Promise<Offer[]> {
    const now = new Date();
    
    // Get personalized offers based on user's history and preferences
    const userOffers = await db
      .select()
      .from(offers)
      .where(
        and(
          eq(offers.userId, parseInt(userId)),
          eq(offers.isActive, true),
          lte(offers.startDate, now),
          gte(offers.endDate, now)
        )
      )
      .orderBy(desc(offers.createdAt));

    return userOffers;
  }

  // Add a new offer
  async addOffer(offer: Omit<Offer, 'id' | 'createdAt'>): Promise<number> {
    const result = await db.insert(offers).values({
      ...offer,
      createdAt: new Date()
    }).returning({ id: offers.id });
    
    return result[0].id;
  }
} 