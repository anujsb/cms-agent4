// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { UserRepository } from "@/lib/repositories/userRepository";

const userRepository = new UserRepository();

export async function POST(req: NextRequest) {
  try {
    const { userId, productName, plan, status } = await req.json();

    if (!userId || !productName || !plan) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Validate the status if provided, otherwise default to 'Active'
    const orderStatus = status || 'Active';
    if (!['Active', 'Expired', 'Pending'].includes(orderStatus)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    // Create a new order with today's date as the in-service date
    const inServiceDate = new Date();
    const orderId = await userRepository.addOrder(
      userId,
      productName,
      plan,
      orderStatus as 'Active' | 'Expired' | 'Pending',
      inServiceDate
    );

    return NextResponse.json({ 
      success: true, 
      orderId,
      message: `Order ${orderId} created successfully`,
      details: {
        productName,
        plan,
        status: orderStatus,
        inServiceDate: inServiceDate.toISOString().split('T')[0]
      }
    });
  } catch (error) {
    console.error("Error creating order:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return NextResponse.json(
      { error: "Failed to create order", message: errorMessage },
      { status: 500 }
    );
  }
}

// GET route to fetch orders for a user
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }
    
    const user = await userRepository.getUserById(userId);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    return NextResponse.json({ 
      orders: user.orders 
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    return NextResponse.json(
      { error: "Failed to fetch orders", message: errorMessage },
      { status: 500 }
    );
  }
}