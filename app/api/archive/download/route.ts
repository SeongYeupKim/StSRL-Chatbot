import { NextRequest, NextResponse } from 'next/server';
import { getArchive } from '@/lib/firestore';
import { exportToJSON, exportToCSV, generateReport } from '@/utils/data-export';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const archiveId = searchParams.get('id');
    const type = searchParams.get('type');

    if (!archiveId || !type) {
      return NextResponse.json(
        { error: 'Archive ID and type parameters are required' },
        { status: 400 }
      );
    }

    // Get archive from Firebase
    const archive = await getArchive(archiveId);
    if (!archive) {
      return NextResponse.json(
        { error: 'Archive not found' },
        { status: 404 }
      );
    }

    let content: string;
    let contentType: string;
    let filename: string;

    switch (type) {
      case 'json':
        content = exportToJSON(archive.exportData);
        contentType = 'application/json';
        filename = `${archive.userId}_${archive.archivedAt.toDate().toISOString().split('T')[0]}.json`;
        break;
      case 'csv':
        content = exportToCSV(archive.exportData);
        contentType = 'text/csv';
        filename = `${archive.userId}_${archive.archivedAt.toDate().toISOString().split('T')[0]}.csv`;
        break;
      case 'report':
        content = generateReport(archive.exportData);
        contentType = 'text/plain';
        filename = `${archive.userId}_${archive.archivedAt.toDate().toISOString().split('T')[0]}_report.txt`;
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid file type' },
          { status: 400 }
        );
    }

    // Return file as response
    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    );
  }
}
