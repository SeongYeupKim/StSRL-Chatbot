import { NextRequest, NextResponse } from 'next/server';
import { UserSession } from '@/types/srl';
import { exportSessionData, exportToJSON, exportToCSV } from '@/utils/data-export';
import { archiveSession, getAllArchives, getArchive } from '@/lib/firestore';

// POST: Archive session data
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session } = body;

    if (!session) {
      return NextResponse.json(
        { error: 'Session data is required' },
        { status: 400 }
      );
    }

    // Export session data
    const exportData = exportSessionData(session);
    
    // Archive to Firebase
    const archiveId = await archiveSession(session, exportData);

    return NextResponse.json({
      success: true,
      message: 'Session archived successfully to Firebase',
      archiveId,
      exportData: {
        userId: exportData.userId,
        sessionId: exportData.sessionId,
        totalMessages: exportData.totalMessages,
        responses: exportData.responses.length,
        srlComponentStats: exportData.srlComponentStats
      }
    });

  } catch (error) {
    console.error('Archive error:', error);
    return NextResponse.json(
      { error: 'Failed to archive session data' },
      { status: 500 }
    );
  }
}

// GET: List archived sessions
export async function GET() {
  try {
    const archives = await getAllArchives();
    
    const sessions = archives.map(archive => ({
      id: archive.id,
      filename: archive.files.json,
      userId: archive.userId,
      timestamp: archive.archivedAt.toDate().toISOString(),
      date: archive.archivedAt.toDate().toLocaleDateString(),
      sessionId: archive.sessionId,
      totalMessages: archive.exportData.totalMessages,
      responses: archive.exportData.responses.length,
      srlComponentStats: archive.exportData.srlComponentStats,
      // Add detailed response data for CSV export
      detailedResponses: archive.exportData.responses,
      weeklyProgress: archive.exportData.weeklyProgress
    }));

    return NextResponse.json({
      success: true,
      sessions
    });

  } catch (error) {
    console.error('List archives error:', error);
    return NextResponse.json(
      { error: 'Failed to list archived sessions' },
      { status: 500 }
    );
  }
}

// Helper function to generate report text
function generateReport(exportData: any): string {
  return `
SRL Learning Assistant - Session Report
=====================================

Student ID: ${exportData.userId}
Session ID: ${exportData.sessionId}
Date: ${new Date(exportData.startDate).toLocaleDateString()}
Duration: ${Math.round((new Date(exportData.endDate).getTime() - new Date(exportData.startDate).getTime()) / 1000 / 60)} minutes

Activity Summary:
- Total Messages: ${exportData.totalMessages}
- Prompts Completed: ${exportData.responses.length}
- SRL Components Covered: ${Object.keys(exportData.srlComponentStats).filter(key => exportData.srlComponentStats[key] > 0).join(', ')}

SRL Component Engagement:
${Object.entries(exportData.srlComponentStats).map(([component, count]: [string, any]) => `- ${component}: ${count} responses`).join('\n')}

Weekly Progress:
${exportData.weeklyProgress.map((wp: any) => `- Week ${wp.week}: ${wp.promptsCompleted} prompts`).join('\n')}

Responses:
${exportData.responses.map((r: any, i: number) => `${i + 1}. Week ${r.week} - ${r.component}: "${r.response}"`).join('\n')}

Generated on: ${new Date().toISOString()}
`;
}
