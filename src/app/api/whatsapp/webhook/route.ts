import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/lib/services/whatsappService';
import { handleWhatsAppMessage } from '@/lib/utils/messageHandler';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Handle sandbox verification
    if (body.type === 'verification') {
      return NextResponse.json({ status: 'ok' });
    }

    // Log incoming messages for testing
    console.log('Received WhatsApp message:', body);

    const { from, message } = body;
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
