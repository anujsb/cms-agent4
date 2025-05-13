// Helper function to detect order intent
export function detectOrderIntent(message: string): { isOrderIntent: boolean; productName?: string; plan?: string } {
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
export function detectIncidentIntent(message: string): { isIncidentIntent: boolean; category?: string; description?: string } {
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
export function detectRenewalIntent(message: string): boolean {
  const renewalKeywords = ['renew', 'renewal', 'extend', 'continue', 'expiring', 'expire'];
  return renewalKeywords.some(keyword => message.toLowerCase().includes(keyword));
}

// Helper function to extract renewal details
export function extractRenewalDetails(message: string): { productName: string; plan: string } | null {
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

// Helper function to detect offer intent
export function detectOfferIntent(message: string): { isOfferIntent: boolean; isPersonalized: boolean } {
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