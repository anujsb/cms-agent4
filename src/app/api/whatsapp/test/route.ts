import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/lib/services/whatsappService';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, message } = await req.json();
    
    // Send test message
    const response = await WhatsAppService.sendMessage(phoneNumber, message);
    
    return NextResponse.json({
      success: true,
      messageId: response.sid
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
