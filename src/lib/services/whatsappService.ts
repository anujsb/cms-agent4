// // src/lib/services/whatsappService.ts
// import { Twilio } from 'twilio';
// import { whatsappConfig } from '../config/whatsapp';

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;

// console.log('Twilio Config:', {
//   hasAccountSid: !!accountSid,
//   hasAuthToken: !!authToken,
//   accountSidLength: accountSid?.length,
//   authTokenLength: authToken?.length
// });

// if (!accountSid || !authToken) {
//   throw new Error('Twilio credentials not found');
// }

// const twilioClient = new Twilio(accountSid, authToken);

// export class WhatsAppService {
//   static async sendMessage(to: string, message: string) {
//     try {
//       // Format the numbers correctly for Twilio
//       const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      
//       // Use the exact sandbox number from the webhook logs
//       const sandboxNumber = 'whatsapp:+14155238886';

//       console.log('Sending WhatsApp message:', {
//         to: formattedTo,
//         from: sandboxNumber,
//         message
//       });

//       const response = await twilioClient.messages.create({
//         body: message,
//         from: sandboxNumber,
//         to: formattedTo,
//         // Add these parameters to ensure proper sandbox handling
//         messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
//         statusCallback: `${process.env.NEXT_PUBLIC_BASE_URL}/api/whatsapp/status`
//       });
      
//       console.log('Message sent successfully:', response.sid);
//       return response;
//     } catch (error) {
//       console.error('Error sending WhatsApp message:', error);
//       throw error;
//     }
//   }
// }


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
      // Get the correct WhatsApp number to use
      const whatsappNumber = whatsappConfig.getWhatsAppNumber();
      
      console.log('WhatsApp Service - Attempting to send message:', {
        to,
        whatsappNumber,
        messageLength: message.length,
        hasWhatsappNumber: !!whatsappNumber
      });

      if (!whatsappNumber) {
        throw new Error('WhatsApp number is not configured');
      }

      // Format the numbers correctly for Twilio
      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      const formattedFrom = whatsappNumber.startsWith('whatsapp:') ? whatsappNumber : `whatsapp:${whatsappNumber}`;
      
      console.log('Sending WhatsApp message:', {
        to: formattedTo,
        from: formattedFrom,
        message: message.length > 50 ? `${message.substring(0, 50)}...` : message
      });

      // Create the message with proper parameters
      const response = await twilioClient.messages.create({
        body: message,
        from: formattedFrom,
        to: formattedTo
      });
      
      console.log('Message sent successfully:', response.sid);
      return response;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      
      // If the first attempt fails with the standard format, try the alternative sandbox format
      if (error.code === 63007 && !to.startsWith('whatsapp:')) {
        console.log('Trying alternative sandbox number format...');
        try {
          // For sandbox, sometimes the from number needs to be exactly as specified in Twilio console
          const sandboxNumber = 'whatsapp:+14155238886';
          const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
          
          const response = await twilioClient.messages.create({
            body: message,
            from: sandboxNumber,
            to: formattedTo
          });
          
          console.log('Message sent successfully with alternative format:', response.sid);
          return response;
        } catch (altError) {
          console.error('Error with alternative format:', altError);
          throw altError;
        }
      }
      
      throw error;
    }
  }
}

export class WhatsAppErrorHandler {
  static handleError(error: any) {
    // Handle specific Twilio error codes
    switch (error.code) {
      case 21211:
        return 'Invalid phone number format';
      case 21214:
        return 'Phone number not verified in sandbox';
      case 21215:
        return 'Message body is required';
      case 63007:
        return 'Invalid sender. Check your Twilio WhatsApp sandbox configuration';
      default:
        return `An error occurred while sending the message: ${error.message || 'Unknown error'}`;
    }
  }
}