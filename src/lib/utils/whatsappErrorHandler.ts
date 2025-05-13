export class WhatsAppErrorHandler {
  static handleError(error: any) {
    if (error.code === 21211) {
      return 'Invalid phone number format';
    }
    if (error.code === 21214) {
      return 'Phone number not verified in sandbox';
    }
    if (error.code === 21215) {
      return 'Message body is required';
    }
    return 'An error occurred while sending the message';
  }
}
