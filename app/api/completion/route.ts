import { NextRequest, NextResponse } from 'next/server';
import { generateCompletionMessage } from '@/utils/openai-feedback';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { conversationHistory } = body;

    // Validate required fields
    if (!conversationHistory || !Array.isArray(conversationHistory)) {
      return NextResponse.json(
        { error: 'Missing or invalid conversationHistory' },
        { status: 400 }
      );
    }

    // Generate completion message using OpenAI
    const message = await generateCompletionMessage(conversationHistory);

    return NextResponse.json({
      success: true,
      message
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
