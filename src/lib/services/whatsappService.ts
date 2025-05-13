// src/lib/services/whatsappService.ts
import { Twilio } from 'twilio';
import { whatsappConfig } from '../config/whatsapp';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  throw new Error('Twilio credentials not found');
}

const twilioClient = new Twilio(accountSid, authToken);

export class WhatsAppService {
  static async sendMessage(to: string, message: string) {
    try {
      const response = await twilioClient.messages.create({
        body: message,
        from: `whatsapp:${whatsappConfig.getWhatsAppNumber()}`,
        to: `whatsapp:${to}`
      });
      
      console.log('Message sent:', response.sid);
      return response;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  }
}
