export const whatsappConfig = {
  isProduction: process.env.NODE_ENV === 'production',
  sandboxNumber: process.env.TWILIO_WHATSAPP_NUMBER,
  productionNumber: process.env.TWILIO_WHATSAPP_PRODUCTION_NUMBER,

  getWhatsAppNumber() {
    console.log('WhatsApp Config:', {
      isProduction: this.isProduction,
      sandboxNumber: this.sandboxNumber,
      productionNumber: this.productionNumber,
      NODE_ENV: process.env.NODE_ENV
    });

    // Use sandbox number if production number is not set
    const number = (this.isProduction && this.productionNumber) ? this.productionNumber : this.sandboxNumber;
    console.log('Selected WhatsApp number:', number);
    return number;
  }
};
