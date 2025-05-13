// app/api/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserRepository } from "@/lib/repositories/userRepository";
import { OfferRepository } from "@/lib/repositories/offerRepository";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const userRepository = new UserRepository();
const offerRepository = new OfferRepository();

// Helper function to detect order intent
function detectOrderIntent(message: string): { isOrderIntent: boolean; productName?: string; plan?: string } {
  const orderKeywords = ["place order", "buy", "purchase", "subscribe", "sign up", "get a new"];
  const queryKeywords = ["recent order", "old orders", "order history", "previous orders", "all orders", "past orders", "show", "latest", "last", "previous", "order details"];
  const messageLower = message.toLowerCase();

  // Check if the message is asking about existing orders
  if (queryKeywords.some(keyword => messageLower.includes(keyword))) {
    return { isOrderIntent: false };
  }

  // Check if the message contains an order intent
  const hasOrderIntent = orderKeywords.some(keyword => messageLower.includes(keyword));

  if (!hasOrderIntent) {
    return { isOrderIntent: false };
  }

  // Try to identify product name and plan
  let productName: string | undefined;
  let plan: string | undefined;

  // Basic product detection
  if (messageLower.includes("sim") || messageLower.includes("esim")) {
    productName = "SIM";
  } else if (messageLower.includes("phone") || messageLower.includes("iphone") || messageLower.includes("samsung")) {
    productName = "Phone";
  } else if (messageLower.includes("internet") || messageLower.includes("wifi") || messageLower.includes("broadband")) {
    productName = "Internet";
  } else if (messageLower.includes("tv") || messageLower.includes("television")) {
    productName = "TV";
  }

  // Basic plan detection
  if (messageLower.includes("unlimited")) {
    plan = "Unlimited";
  } else if (messageLower.includes("basic")) {
    plan = "Basic";
  } else if (messageLower.includes("premium")) {
    plan = "Premium";
  } else if (messageLower.includes("family")) {
    plan = "Family";
  }

  return { isOrderIntent: true, productName, plan };
}

// Helper function to detect incident intent
function detectIncidentIntent(message: string): { isIncidentIntent: boolean; category?: string; description?: string } {
  // Check if this is a direct incident creation request
  if (message.startsWith('[INCIDENT]')) {
    const match = message.match(/\[INCIDENT\] Category: (.*?) - (.*)/);
    if (match) {
      return {
        isIncidentIntent: true,
        category: match[1],
        description: match[2]
      };
    }
  }

  const messageLower = message.toLowerCase();
  
  // Check for problem keywords
  const incidentKeywords = [
    "problem", "issue", "not working", "broken", "error",
    "slow", "disconnected", "poor signal", "no signal",
    "complaint", "help", "support", "trouble", "report issue"
  ];

  if (!incidentKeywords.some(keyword => messageLower.includes(keyword))) {
    return { isIncidentIntent: false };
  }

  // Try to identify the category
  let category = "General";
  if (messageLower.includes("internet") || messageLower.includes("wifi") || messageLower.includes("connection")) {
    category = "Internet Issues";
  } else if (messageLower.includes("tv") || messageLower.includes("television") || messageLower.includes("channel")) {
    category = "TV Service Issues";
  } else if (messageLower.includes("phone") || messageLower.includes("call") || messageLower.includes("signal")) {
    category = "Phone Issues";
  }

  return {
    isIncidentIntent: true,
    category,
    description: message
  };
}

// Helper function to detect renewal intent
function detectRenewalIntent(message: string): boolean {
  const renewalKeywords = ['renew', 'renewal', 'extend', 'continue', 'expiring', 'expire'];
  return renewalKeywords.some(keyword => message.toLowerCase().includes(keyword));
}

// Helper function to extract renewal details
function extractRenewalDetails(message: string): { productName: string; plan: string } | null {
  const productMatch = message.match(/renew my (.*?) plan/i);
  const planMatch = message.match(/with the (.*?) option/i);
  
  if (productMatch && planMatch) {
    return {
      productName: productMatch[1].trim(),
      plan: planMatch[1].trim()
    };
  }
  return null;
}

// Handle incident creation
export async function handleIncidentCreation(userId: string, incidentIntent: ReturnType<typeof detectIncidentIntent>) {
  try {
    const incidentId = await userRepository.addIncident(
      userId,
      `[${incidentIntent.category}] ${incidentIntent.description}`,
      'Open' // Default status for new incidents
    );

    let reply = `I've created an incident ticket for your ${incidentIntent.category?.toLowerCase()} issue. Your incident ID is **${incidentId}**.`;
    
    // Add appropriate next steps based on the category
    if (incidentIntent.category === "Internet Issues") {
      reply += "In the meantime, you can try these steps: - Restart your router - Check if other devices are affected - Verify your WiFi connection";
    } else if (incidentIntent.category === "TV Service Issues") {
      reply += " While waiting, you can try: - Restart your TV box - Check your TV connection cables - Verify if other channels are affected";
    } else if (incidentIntent.category === "Phone Issues") {
      reply += " You can try these troubleshooting steps: - Restart your phone - Check if airplane mode is off - Verify if the issue affects calls, data, or both";
    }

    reply += " Would you like to speak with a customer service representative about this issue?";

    return {
      reply,
      incidentCreated: true,
      incidentId,
      showCallButton: true
    };
  } catch (error) {
    console.error("Error creating incident:", error);
    return {
      reply: "I'm sorry, but there was an error creating your incident ticket. Please try again later or contact our customer service at 1200.",
      incidentCreated: false,
      showCallButton: true
    };
  }
}

// New function to handle initial troubleshooting before creating an incident
export function handleInitialTroubleshooting(incidentIntent: ReturnType<typeof detectIncidentIntent>) {
  let reply = `It seems like you're experiencing an issue.`;
  
  // Add appropriate troubleshooting steps based on the category
  if (incidentIntent.category === "Internet Issues") {
    reply += "Before creating an incident ticket, you can try: - Restart your router - Check if other devices are affected - Verify your WiFi connection";
  } else if (incidentIntent.category === "TV Service Issues") {
    reply += "Before creating an incident ticket, you can try: - Restart your TV box - Check your TV connection cables - Verify if other channels are affected";
  } else if (incidentIntent.category === "Phone Issues") {
    reply += " Before creating an incident ticket, you can try: - Restart your phone - Check if airplane mode is off - Verify if the issue affects calls, data, or both";
  } else {
    reply += "Before creating an incident ticket, you can try: - Restart your device - Check your connection - Verify if the issue affects other services";
  }

  reply += " If the issue persists, would you like to create an incident ticket for our support team to help you?";

  return {
    reply,
    incidentCreated: false,
    showIncidentPrompt: true,
    category: incidentIntent.category,
    description: incidentIntent.description
  };
}

// Handle order confirmation
export async function handleOrderConfirmation(userId: string, message: string) {
  try {
    const productMatch = message.match(/product:\s*([^,]+)/i);
    const planMatch = message.match(/plan:\s*([^,]+)/i);
    
    const productName = productMatch?.[1] || "SIM";
    const plan = planMatch?.[1] || "Unlimited";

    const inServiceDate = new Date();
    const orderId = await userRepository.addOrder(
      userId,
      productName,
      plan,
      'Active',
      inServiceDate
    );

    return {
      reply: `Great! Your order for **${productName}** with the **${plan}** plan has been confirmed. Your order number is **${orderId}**. The service will be active starting today. Is there anything else I can help you with?`,
      orderPlaced: true,
      orderId
    };
  } catch (error) {
    console.error("Error placing order:", error);
    return {
      reply: "I'm sorry, but there was an error processing your order. Please try again later or contact our customer service at 1200.",
      orderPlaced: false
    };
  }
}

// Handle renewal request
export async function handleRenewalRequest(userId: string, renewalDetails: ReturnType<typeof extractRenewalDetails>) {
  if (!renewalDetails) return null;
  
  try {
    // Create a new order for renewal
    const order = await userRepository.createOrder({
      userId,
      productName: renewalDetails.productName,
      plan: renewalDetails.plan,
      status: 'Pending'
    });

    return {
      reply: `I've initiated the renewal process for your ${renewalDetails.productName} plan with the ${renewalDetails.plan} option. Would you like me to confirm the renewal now?`,
      orderId: order.id,
      hasRenewalIntent: true,
      renewalDetails,
      isOrderIntent: true,
      productName: renewalDetails.productName,
      plan: renewalDetails.plan
    };
  } catch (error) {
    console.error("Error processing renewal:", error);
    return {
      reply: "I'm sorry, but there was an error processing your renewal request. Please try again later or contact our customer service at 1200.",
      hasRenewalIntent: false,
      showCallButton: true
    };
  }
}

// Prepare AI prompt with user data and relevant context
function preparePrompt(message: string, user: any, orderIntent: ReturnType<typeof detectOrderIntent>, expiringPlan: any) {
  let expiringPlanInfo = "";
  if (expiringPlan) {
    expiringPlanInfo = `
    
    EXPIRING PLAN INFORMATION:
    The user has a ${expiringPlan.productName} plan with the ${expiringPlan.plan} option that will expire in ${expiringPlan.daysUntilExpiration} days.
    If the user's query is not related to plan renewal, do not mention this information.
    If the user's query is complete and they haven't mentioned anything about renewing their plan, you can add a note at the end of your response like this:
    
    "By the way, I noticed your ${expiringPlan.productName} plan with the ${expiringPlan.plan} option will expire in ${expiringPlan.daysUntilExpiration} days. Would you like to renew it?"
    `;
  }

  const orderIntentSection = orderIntent.isOrderIntent ? 
    `The user's message contains an intent to place an order. If appropriate, ask clarifying questions about what product they want and which plan. If you have enough information about the product and plan they want, offer them to confirm the order with the following template:
    
    "To confirm your order for [PRODUCT] with the [PLAN] plan, please reply with 'Confirm order: Yes, product: [PRODUCT], plan: [PLAN]'"
    
    Available products: SIM, Phone, Internet, TV
    Available plans: Basic, Premium, Unlimited, Family` 
    : "";

  return `
    You are a helpful and friendly customer care bot for Odido, a Dutch telecom company. Your role is to assist users with queries about their telecom services in clear and simple language. Always be empathetic and understanding, especially when users seem confused.
    Always provide clear and concise answers based on what user has asked without displaying additional information, and if you don't know something, say so. Avoid using technical jargon or complex terms.
    
    User Data:
    - Name: ${user.name}
    - Phone Number: ${user.phoneNumber}
    - Orders: ${JSON.stringify(user.orders)}
    - Incidents: ${JSON.stringify(user.incidents)}
    - Invoices: ${JSON.stringify(user.invoices)}
    
    User query: "${message}"
    
    ${orderIntentSection}
    ${expiringPlanInfo}
    
    FORMATTING RULES (VERY IMPORTANT):
    1. Use compact markdown formatting with minimal spacing
    2. Use markdown for formatting:
      - For bold text: **bold text**
      - For bullet points: Use dashes with single space (- Item)
      - For numbered lists: Use numbers (1. Item)
    3. DO NOT put blank lines before or after lists
    4. Connect lists directly to preceding paragraphs
    5. Only use one line break between different paragraphs
    6. After greeting, place the rest of the text in a new line

    INVOICE EXPLANATION RULES (VERY IMPORTANT):
    1. When explaining invoices, check the description field carefully:
      - If the description starts with "Discount:", it's a special offer or promotional discount
      - If there's no "Discount:" prefix and the price is negative, it means the service was stopped before the end of the billing period
    2. Group charges into these simple categories:
      - Your Monthly Services (regular charges)
      - Special Offers & Discounts (amounts with "Discount:" in description)
      - Credit for Stopped Services (negative amounts without "Discount:" prefix)
    3. Format the explanation like this example:
       Here's a simple breakdown of your bill:
        - **Your Monthly Services:**
        Internet: €20.00
        TV Package: €5.00
        - **Special Offers & Discounts:**
        **Savings** on ESPN Package: -€7.50 (special offer discount)
        - **Credit for Stopped Services:**
        **Money Back** for Entertainment Package: -€2.00 (credit because you stopped this service early)
    4. Use simple, everyday language:
      - Say "savings" or "discount" instead of "promotional discount"
      - Say "money back" or "credit" instead of "service adjustment"
      - Always explain negative amounts in plain terms like "because you stopped this service early" or "special offer discount"
    5. Only show the most important charges unless asked for more detail
    6. Be direct and clear about what each charge or credit means
    
    Be friendly and helpful, but keep explanations simple and easy to understand. Use **bold text** to highlight important savings or credits. Always explain charges in a way that makes sense to everyday customers.
  `;
}

// Clean LLM response formatting
function cleanResponse(response: string): string {
  return response
    .replace(/\n\s*\n/g, "")
    .replace(/\n\s*- /g, "\n- ")
    .replace(/\n\s*\d+\. /g, "\n1. ")
    .trim();
}

// Helper function to detect offer intent
function detectOfferIntent(message: string): { isOfferIntent: boolean; isPersonalized: boolean } {
  const messageLower = message.toLowerCase();
  
  // Check for current offers
  const currentOfferKeywords = ["current offers", "available offers", "what offers", "show offers", "list offers"];
  const isCurrentOffer = currentOfferKeywords.some(keyword => messageLower.includes(keyword));
  
  // Check for personalized offers
  const personalizedOfferKeywords = ["offer for me", "personalized offer", "special offer", "any offer for me", "do you have any offer"];
  const isPersonalizedOffer = personalizedOfferKeywords.some(keyword => messageLower.includes(keyword));
  
  return {
    isOfferIntent: isCurrentOffer || isPersonalizedOffer,
    isPersonalized: isPersonalizedOffer
  };
}

// Helper function to format offers for display
function formatOffers(offers: any[], isPersonalized: boolean = false): string {
  if (offers.length === 0) {
    if (isPersonalized) {
      return "I'm sorry, but you are not yet eligible for any personalized offers. Keep using our services to unlock special offers!";
    }
    return "I'm sorry, but there are no offers available at the moment.";
  }

  let response = isPersonalized ? "Here are your personalized offers:\n" : "Here are the current offers:\n";
  
  offers.forEach((offer, index) => {
    response += `${index + 1}. **${offer.name}**`;
    response += `   - ${offer.description}`;
    response += `   - ${offer.discountPercentage}% off on ${offer.productType} ${offer.planType} plan`;
    response += `   - Valid until ${new Date(offer.endDate).toLocaleDateString()}`;
    response += `\n`;
  });

  return response;
}

export async function POST(req: NextRequest) {
  try {
    const { message, userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Fetch user data from the database
    const user = await userRepository.getUserById(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check for expiring plans
    const expiringPlan = await userRepository.checkExpiringPlans(userId);
    
    // Process message to detect various intents
    const messageLower = message.toLowerCase();
    const incidentIntent = detectIncidentIntent(message);
    const orderIntent = detectOrderIntent(message);
    const hasRenewalIntent = detectRenewalIntent(message);
    const renewalDetails = hasRenewalIntent ? extractRenewalDetails(message) : null;
    
    // Check for offer intent
    const offerIntent = detectOfferIntent(message);
    
    // Handle incident creation
    if (incidentIntent.isIncidentIntent) {
      // Check if this is a direct incident creation request
      if (message.startsWith('[INCIDENT]')) {
        const result = await handleIncidentCreation(userId, incidentIntent);
        return NextResponse.json(result);
      } else {
        // First suggest troubleshooting steps
        const result = handleInitialTroubleshooting(incidentIntent);
        return NextResponse.json(result);
      }
    }

    // Handle order confirmation
    if (messageLower.includes("confirm order") && messageLower.includes("yes")) {
      const result = await handleOrderConfirmation(userId, message);
      return NextResponse.json(result);
    }

    // Handle renewal request (prioritize explicit renewal intent over expiring plan)
    if (hasRenewalIntent && renewalDetails) {
      const result = await handleRenewalRequest(userId, renewalDetails);
      if (result) {
        return NextResponse.json(result);
      }
    } else if (expiringPlan) {
      // Only mention expiring plan if no explicit renewal intent is detected
      return NextResponse.json({
        reply: `I noticed your ${expiringPlan.productName} plan with the ${expiringPlan.plan} option will expire in ${expiringPlan.daysUntilExpiration} days. Would you like to renew it?`,
        hasExpiringPlan: true,
        expiringPlan
      });
    }

    // Handle offer intent
    if (offerIntent.isOfferIntent) {
      let offers;
      let reply;
      
      if (offerIntent.isPersonalized) {
        // Get personalized offers
        offers = await offerRepository.getPersonalizedOffers(userId);
        reply = formatOffers(offers, true);
      } else {
        // Get current offers
        offers = await offerRepository.getCurrentOffers();
        reply = formatOffers(offers, false);
      }
      
      return NextResponse.json({
        reply,
        hasOffers: offers.length > 0,
        offers
      });
    }

    // Process with AI for general queries
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = preparePrompt(message, user, orderIntent, expiringPlan);
    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    const cleanedResponse = cleanResponse(response);

    return NextResponse.json({
      reply: cleanedResponse,
      isOrderIntent: orderIntent.isOrderIntent,
      productName: orderIntent.productName || null,
      plan: orderIntent.plan || null,
      hasExpiringPlan: !!expiringPlan,
      expiringPlan,
      hasRenewalIntent,
      renewalDetails
    });
  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}