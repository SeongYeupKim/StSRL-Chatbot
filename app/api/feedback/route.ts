import { NextRequest, NextResponse } from 'next/server';
import { generateOpenAIFeedback, generateFollowUpQuestionOpenAI } from '@/utils/openai-feedback';
import { SRLComponent } from '@/types/srl';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { promptId, response, component, week, previousResponse } = body;

    // Validate required fields
    if (!promptId || !response || !component || !week) {
      return NextResponse.json(
        { error: 'Missing required fields: promptId, response, component, week' },
        { status: 400 }
      );
    }

    // Validate component
    const validComponents: SRLComponent[] = ['metacognition', 'strategy', 'motivation', 'content', 'management'];
    if (!validComponents.includes(component)) {
      return NextResponse.json(
        { error: 'Invalid component. Must be one of: metacognition, strategy, motivation, content, management' },
        { status: 400 }
      );
    }

    // Generate feedback using OpenAI
    const feedback = await generateOpenAIFeedback({
      promptId,
      response,
      component,
      week
    });

    return NextResponse.json({
      success: true,
      feedback
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
