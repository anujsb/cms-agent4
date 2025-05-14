import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/lib/services/whatsappService';
import { handleWhatsAppMessage } from '@/lib/utils/messageHandler';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Log the full request body for debugging
    console.log('Received WhatsApp webhook:', JSON.stringify(body, null, 2));

    // Handle sandbox verification
    if (body.type === 'verification') {
      return NextResponse.json({ status: 'ok' });
    }

    // Extract message details from Twilio format
    const from = body.From?.replace('whatsapp:', '') || '';
    const message = body.Body || '';

    if (!from || !message) {
      console.error('Missing required fields:', { from, message });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    console.log('Processing message:', { from, message });

    // Handle the message
    const response = await handleWhatsAppMessage(from, message);
    
    // Send response back via WhatsApp
    await WhatsAppService.sendMessage(from, response);
    
    return NextResponse.json({
      success: true,
      message: 'Message processed successfully'
    });
  } catch (error) {
    console.error('Error in WhatsApp webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
