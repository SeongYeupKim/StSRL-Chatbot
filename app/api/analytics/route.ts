import { NextResponse } from 'next/server';
import { getAnalytics } from '@/lib/firestore';

export async function GET() {
  try {
    const analytics = await getAnalytics();
    
    return NextResponse.json({
      success: true,
      analytics
    });

  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to get analytics' },
      { status: 500 }
    );
  }
}
