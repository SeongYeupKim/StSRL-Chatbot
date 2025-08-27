import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { UserSession } from '@/types/srl';
import { exportSessionData, exportToJSON, exportToCSV } from '@/utils/data-export';

const DATA_DIR = path.join(process.cwd(), 'data', 'archives');

// Ensure data directory exists
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// POST: Archive session data
export async function POST(request: NextRequest) {
  try {
    await ensureDataDir();
    
    const body = await request.json();
    const { session } = body;

    if (!session) {
      return NextResponse.json(
        { error: 'Session data is required' },
        { status: 400 }
      );
    }

    // Generate timestamp for filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `session_${session.userId}_${timestamp}`;
    
    // Export session data
    const exportData = exportSessionData(session);
    
    // Save as JSON
    const jsonPath = path.join(DATA_DIR, `${filename}.json`);
    await fs.writeFile(jsonPath, exportToJSON(exportData));
    
    // Save as CSV
    const csvPath = path.join(DATA_DIR, `${filename}.csv`);
    await fs.writeFile(csvPath, exportToCSV(exportData));
    
    // Save report
    const reportPath = path.join(DATA_DIR, `${filename}_report.txt`);
    const report = generateReport(exportData);
    await fs.writeFile(reportPath, report);

    return NextResponse.json({
      success: true,
      message: 'Session archived successfully',
      files: {
        json: `${filename}.json`,
        csv: `${filename}.csv`,
        report: `${filename}_report.txt`
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
    await ensureDataDir();
    
    const files = await fs.readdir(DATA_DIR);
    const sessions = files
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const match = file.match(/session_(.+)_(.+)\.json/);
        if (match) {
          return {
            filename: file,
            userId: match[1],
            timestamp: match[2].replace(/-/g, ':'),
            date: new Date(match[2].replace(/-/g, ':')).toLocaleDateString()
          };
        }
        return null;
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (!a || !b) return 0;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });

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
${Object.entries(exportData.srlComponentStats).map(([component, count]) => `- ${component}: ${count} responses`).join('\n')}

Weekly Progress:
${exportData.weeklyProgress.map(wp => `- Week ${wp.week}: ${wp.promptsCompleted} prompts`).join('\n')}

Responses:
${exportData.responses.map((r, i) => `${i + 1}. Week ${r.week} - ${r.component}: "${r.response}"`).join('\n')}

Generated on: ${new Date().toISOString()}
`;
}
