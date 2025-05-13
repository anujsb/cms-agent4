import { GoogleGenerativeAI } from "@google/generative-ai";
import { UserRepository } from "../repositories/userRepository";
import { detectOrderIntent, detectIncidentIntent, detectRenewalIntent, extractRenewalDetails, detectOfferIntent } from "../utils/intentDetection";
import { preparePrompt, cleanResponse } from "../utils/promptUtils";
import { handleIncidentCreation, handleInitialTroubleshooting, handleOrderConfirmation, handleRenewalRequest } from "../../app/api/chat/route";
import { OfferRepository } from "../repositories/offerRepository";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const userRepository = new UserRepository();
const offerRepository = new OfferRepository();

export async function handleWhatsAppMessage(phoneNumber: string, message: string) {
  try {
    // Find user by phone number
    const user = await userRepository.getUserByPhoneNumber(phoneNumber);
    
    if (!user) {
      return "Welcome! Please register first by visiting our website.";
    }

    // Check for expiring plans
    const expiringPlan = await userRepository.checkExpiringPlans(user.id);
    
    // Process message to detect various intents
    const messageLower = message.toLowerCase();
    const incidentIntent = detectIncidentIntent(message);
    const orderIntent = detectOrderIntent(message);
    const hasRenewalIntent = detectRenewalIntent(message);
    const renewalDetails = hasRenewalIntent ? extractRenewalDetails(message) : null;
    const offerIntent = detectOfferIntent(message);

    // Handle incident creation
    if (incidentIntent.isIncidentIntent) {
      if (message.startsWith('[INCIDENT]')) {
        const result = await handleIncidentCreation(user.id, incidentIntent);
        return result.reply;
      } else {
        const result = handleInitialTroubleshooting(incidentIntent);
        return result.reply;
      }
    }

    // Handle order confirmation
    if (messageLower.includes("confirm order") && messageLower.includes("yes")) {
      const result = await handleOrderConfirmation(user.id, message);
      return result.reply;
    }

    // Handle renewal request
    if (hasRenewalIntent && renewalDetails) {
      const result = await handleRenewalRequest(user.id, renewalDetails);
      if (result) {
        return result.reply;
      }
    }

    // Handle offer intent
    if (offerIntent.isOfferIntent) {
      const offers = offerIntent.isPersonalized 
        ? await offerRepository.getPersonalizedOffers(user.id)
        : await offerRepository.getCurrentOffers();
      return formatOffers(offers, offerIntent.isPersonalized);
    }

    // Process with AI for general queries
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = preparePrompt(message, user, orderIntent, expiringPlan);
    const result = await model.generateContent(prompt);
    const response = await result.response.text();
    
    return cleanResponse(response);
  } catch (error) {
    console.error('Error handling WhatsApp message:', error);
    return "Sorry, I'm having trouble processing your request. Please try again later.";
  }
}

function formatOffers(offers: any[], isPersonalized: boolean) {
  if (offers.length === 0) {
    return "I'm sorry, but there are no offers available at the moment.";
  }

  let message = isPersonalized 
    ? "Here are your personalized offers:\n\n"
    : "Here are our current offers:\n\n";

  offers.forEach((offer, index) => {
    message += `${index + 1}. ${offer.name}\n`;
    message += `   Description: ${offer.description}\n`;
    message += `   Discount: ${offer.discountPercentage}%\n`;
    message += `   Product: ${offer.productType}\n`;
    message += `   Plan: ${offer.planType}\n`;
    message += `   Valid until: ${new Date(offer.endDate).toLocaleDateString()}\n\n`;
  });

  message += "Would you like to know more about any of these offers?";
  return message;
}
