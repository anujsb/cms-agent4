// // // src/lib/services/whatsappService.ts
// // import { Twilio } from 'twilio';
// // import { whatsappConfig } from '../config/whatsapp';

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
  // Official Twilio WhatsApp Sandbox number - this is fixed and the same for all sandbox accounts
  const OFFICIAL_SANDBOX_NUMBER = 'whatsapp:+14155238886';
  
  // Check if we have a specific WhatsApp number configured
  const configuredNumber = process.env.TWILIO_WHATSAPP_NUMBER;
  
  // Use messaging service if available (recommended for production)
  const messagingServiceSid = process.env.TWILIO_MESSAGING_SERVICE_SID;
  
  console.log('WhatsApp number configuration:', {
    configuredNumber,
    hasMessagingService: !!messagingServiceSid
  });
  
  // Priority:
  // 1. Use Messaging Service if configured (preferred for production)
  // 2. Use configured WhatsApp number if available
  // 3. Default to official sandbox number
  if (messagingServiceSid) {
    return messagingServiceSid; // This will use the Messaging Service SID as the from parameter
  } else if (configuredNumber) {
    return configuredNumber.startsWith('whatsapp:') 
      ? configuredNumber 
      : `whatsapp:${configuredNumber}`;
  }
  
  return OFFICIAL_SANDBOX_NUMBER;
};

export class WhatsAppService {
  static async sendMessage(to: string, message: string) {
    try {
      // Format destination number
      const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
      
      // Get the right sender
      const fromValue = getFromNumber();
      const isMessagingService = fromValue.startsWith('MG');
      
      console.log('Preparing WhatsApp message:', {
        to: formattedTo,
        from: fromValue,
        isMessagingService,
        messagePreview: message.length > 30 ? `${message.substring(0, 30)}...` : message
      });

      // Build message parameters
      const messageParams: any = {
        body: message,
        to: formattedTo
      };
      
      // If using messaging service, set messagingServiceSid, otherwise set from
      if (isMessagingService) {
        messageParams.messagingServiceSid = fromValue;
      } else {
        messageParams.from = fromValue;
      }
      
      // Send the message
      const response = await twilioClient.messages.create(messageParams);
      
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
      
      // For debugging: Print the full capabilities and account information
      try {
        console.log('Attempting to get account information for debugging...');
        const account = await twilioClient.api.accounts(accountSid as string).fetch();
        console.log('Account status:', account.status);
        
        // List available phone numbers (only in debug mode)
        if (process.env.DEBUG_MODE === 'true') {
          const incomingPhoneNumbers = await twilioClient.incomingPhoneNumbers.list();
          console.log('Available phone numbers:', 
            incomingPhoneNumbers.map(n => ({ 
              sid: n.sid, 
              phoneNumber: n.phoneNumber,
              capabilities: n.capabilities
            }))
          );
        }
      } catch (debugError) {
        console.error('Error fetching debug information:', debugError);
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
      
      // This is a best-effort approach to check if a number is registered
      // Twilio doesn't provide a direct API for this, so we use a workaround
      
      // For sandbox, we check by sending a tiny verification message
      // This will fail if the user is not registered
      const verificationResponse = await twilioClient.messages.create({
        body: '.',  // Minimal message
        from: getFromNumber(),
        to: formattedNumber,
        // Set validityPeriod to 1 to make message expire almost immediately
        validityPeriod: 1
      });
      
      return {
        isRegistered: true,
        status: verificationResponse.status
      };
    } catch (error: any) {
      // Error 21214 means "Phone number not verified in sandbox"
      if (error.code === 21214) {
        return {
          isRegistered: false,
          errorCode: error.code,
          message: 'Number not registered in sandbox'
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
          userMessage: 'This phone number has not joined the WhatsApp sandbox. Please have the user send the message "join <your-sandbox-code>" to +14155238886',
          details: errorDetails
        };
      case 21215:
        return {
          userMessage: 'Message body is required',
          details: errorDetails
        };
      case 63007:
        return {
          userMessage: 'WhatsApp sender configuration issue. Please check your Twilio account WhatsApp settings.',
          fixInstructions: [
            '1. Ensure you have WhatsApp enabled in your Twilio account',
            '2. Verify your WhatsApp Sandbox is properly set up',
            '3. If using production, ensure your WhatsApp Business Profile is approved',
            '4. Check that the sender number is properly registered with WhatsApp',
            '5. Contact Twilio support for further assistance'
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