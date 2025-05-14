// src/lib/services/whatsappService.ts
import { Twilio } from 'twilio';
import { whatsappConfig } from '../config/whatsapp';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

console.log('Twilio Config:', {
  hasAccountSid: !!accountSid,
  hasAuthToken: !!authToken,
  accountSidLength: accountSid?.length,
  authTokenLength: authToken?.length
});

if (!accountSid || !authToken) {
  throw new Error('Twilio credentials not found');
}

const twilioClient = new Twilio(accountSid, authToken);

export class WhatsAppService {
  static async sendMessage(to: string, message: string) {
    try {
      const whatsappNumber = whatsappConfig.getWhatsAppNumber();
      
      console.log('WhatsApp Service - Attempting to send message:', {
        to,
        whatsappNumber,
        messageLength: message.length,
        hasWhatsappNumber: !!whatsappNumber
      });

      if (!whatsappNumber) {
        throw new Error('WhatsApp number not configured');
      }

      console.log('Sending WhatsApp message:', {
        to: `whatsapp:${to}`,
        from: `whatsapp:${whatsappNumber}`,
        message
      });

      const response = await twilioClient.messages.create({
        body: message,
        from: `whatsapp:${whatsappNumber}`,
        to: `whatsapp:${to}`
      });
      
      console.log('Message sent successfully:', response.sid);
      return response;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }
}
