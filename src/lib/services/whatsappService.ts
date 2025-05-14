// // // src/lib/services/whatsappService.ts
// // // import { Twilio } from 'twilio';
// // // import { whatsappConfig } from '../config/whatsapp';

// // const accountSid = process.env.TWILIO_ACCOUNT_SID;
// // const authToken = process.env.TWILIO_AUTH_TOKEN;

// // console.log('Twilio Config:', {
// //   hasAccountSid: !!accountSid,
// //   hasAuthToken: !!authToken,
// //   accountSidLength: accountSid?.length,
// //   authTokenLength: authToken?.length
// // });

// // if (!accountSid || !authToken) {
// //   throw new Error('Twilio credentials not found');
// // }

// // const twilioClient = new Twilio(accountSid, authToken);

// // export class WhatsAppService {
// //   static async sendMessage(to: string, message: string) {
// //     try {
// //       // Format the numbers correctly for Twilio
// //       const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      
// //       // Use the exact sandbox number from the webhook logs
// //       const sandboxNumber = 'whatsapp:+14155238886';

// //       console.log('Sending WhatsApp message:', {
// //         to: formattedTo,
// //         from: sandboxNumber,
// //         message
// //       });

// //       const response = await twilioClient.messages.create({
// //         body: message,
// //         from: sandboxNumber,
// //         to: formattedTo,
// //         // Add these parameters to ensure proper sandbox handling
// //         messagingServiceSid: process.env.TWILIO_MESSAGING_SERVICE_SID,
// //         statusCallback: `${process.env.NEXT_PUBLIC_BASE_URL}/api/whatsapp/status`
// //       });
      
// //       console.log('Message sent successfully:', response.sid);
// //       return response;
// //     } catch (error) {
// //       console.error('Error sending WhatsApp message:', error);
// //       throw error;
// //     }
// //   }
// // }


// import { Twilio } from 'twilio';
// import { whatsappConfig } from '../config/whatsapp';

// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;

// if (!accountSid || !authToken) {
//   throw new Error('Twilio credentials not found');
// }

// const twilioClient = new Twilio(accountSid, authToken);

// interface TwilioError extends Error {
//   code?: number;
//   status?: number;
//   moreInfo?: string;
// }

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
//         message: message.length > 50 ? `${message.substring(0, 50)}...` : message
//       });

//       // Create the message with proper parameters
//       const response = await twilioClient.messages.create({
//         body: message,
//         from: sandboxNumber,
//         to: formattedTo
//       });
      
//       console.log('Message sent successfully:', response.sid);
//       return response;
//     } catch (error) {
//       console.error('Error sending WhatsApp message:', error);
      
//       // If the first attempt fails, try with a different format
//       const twilioError = error as TwilioError;
//       if (twilioError.code === 63007) {
//         console.log('Trying with different format...');
//         try {
//           const response = await twilioClient.messages.create({
//             body: message,
//             from: 'whatsapp:+14155238886',
//             to: to.startsWith('whatsapp:') ? to : `whatsapp:${to}`
//           });
          
//           console.log('Message sent successfully with different format:', response.sid);
//           return response;
//         } catch (altError) {
//           console.error('Error with alternative format:', altError);
//           throw altError;
//         }
//       }
      
//       throw error;
//     }
//   }
// }

// export class WhatsAppErrorHandler {
//   static handleError(error: any) {
//     // Handle specific Twilio error codes
//     switch (error.code) {
//       case 21211:
//         return 'Invalid phone number format';
//       case 21214:
//         return 'Phone number not verified in sandbox';
//       case 21215:
//         return 'Message body is required';
//       case 63007:
//         return 'Invalid sender. Check your Twilio WhatsApp sandbox configuration';
//       default:
//         return `An error occurred while sending the message: ${error.message || 'Unknown error'}`;
//     }
//   }
// }


import { Twilio } from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

if (!accountSid || !authToken) {
  throw new Error('Twilio credentials not found');
}

const twilioClient = new Twilio(accountSid, authToken);

// Helper function to determine the correct "From" number
const getFromNumber = () => {
  // For test accounts, we must use the exact sandbox number format
  return 'whatsapp:+14155238886';
};

export class WhatsAppService {
  static async sendMessage(to: string, message: string) {
    try {
      // Format destination number
      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      
      // Get the sandbox number
      const fromValue = getFromNumber();
      
      console.log('Preparing WhatsApp message:', {
        to: formattedTo,
        from: fromValue,
        messagePreview: message.length > 30 ? `${message.substring(0, 30)}...` : message
      });

      // Send the message with minimal parameters for test account
      const response = await twilioClient.messages.create({
        body: message,
        from: fromValue,
        to: formattedTo
      });
      
      console.log('Message sent successfully:', {
        sid: response.sid,
        status: response.status
      });
      
      return response;
    } catch (error: any) {
      console.error('Error sending WhatsApp message:', {
        code: error.code,
        status: error.status,
        message: error.message,
        moreInfo: error.moreInfo
      });
      
      // For test accounts, we need to ensure the user has joined the sandbox
      if (error.code === 21214) {
        throw new Error('Please join the WhatsApp sandbox by sending "join <your-sandbox-code>" to +14155238886');
      }
      
      throw error;
    }
  }

  // Method to check if a number is registered in the sandbox
  static async checkNumberRegistration(phoneNumber: string) {
    try {
      // Format the number
      const formattedNumber = phoneNumber.startsWith('whatsapp:') 
        ? phoneNumber 
        : `whatsapp:${phoneNumber}`;
      
      // For test accounts, we can only check by attempting to send a message
      const verificationResponse = await twilioClient.messages.create({
        body: '.',  // Minimal message
        from: getFromNumber(),
        to: formattedNumber
      });
      
      return {
        isRegistered: true,
        status: verificationResponse.status
      };
    } catch (error: any) {
      if (error.code === 21214) {
        return {
          isRegistered: false,
          errorCode: error.code,
          message: 'Please join the WhatsApp sandbox by sending "join <your-sandbox-code>" to +14155238886'
        };
      }
      
      console.error('Error checking number registration:', error);
      return {
        isRegistered: false,
        errorCode: error.code,
        message: error.message
      };
    }
  }
}

export class WhatsAppErrorHandler {
  static handleError(error: any) {
    const errorDetails = {
      code: error.code,
      message: error.message,
      moreInfo: error.moreInfo
    };
    
    // Handle specific Twilio error codes
    switch (error.code) {
      case 21211:
        return {
          userMessage: 'Invalid phone number format',
          details: errorDetails
        };
      case 21214:
        return {
          userMessage: 'Please join the WhatsApp sandbox by sending "join <your-sandbox-code>" to +14155238886',
          details: errorDetails
        };
      case 21215:
        return {
          userMessage: 'Message body is required',
          details: errorDetails
        };
      case 63007:
        return {
          userMessage: 'WhatsApp sandbox configuration issue. Please ensure you have joined the sandbox.',
          fixInstructions: [
            '1. Send "join <your-sandbox-code>" to +14155238886',
            '2. Wait for confirmation message',
            '3. Try sending your message again'
          ],
          details: errorDetails
        };
      default:
        return {
          userMessage: `An error occurred while sending the message: ${error.message || 'Unknown error'}`,
          details: errorDetails
        };
    }
  }
}