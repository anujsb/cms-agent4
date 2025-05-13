export const whatsappConfig = {
  isProduction: process.env.NODE_ENV === 'production',
  sandboxNumber: process.env.TWILIO_WHATSAPP_NUMBER,
  productionNumber: process.env.TWILIO_WHATSAPP_PRODUCTION_NUMBER,
  
  getWhatsAppNumber() {
    return this.isProduction ? this.productionNumber : this.sandboxNumber;
  }
};
