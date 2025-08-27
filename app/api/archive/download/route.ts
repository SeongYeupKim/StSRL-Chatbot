import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'archives');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('file');
    const type = searchParams.get('type');

    if (!filename || !type) {
      return NextResponse.json(
        { error: 'File and type parameters are required' },
        { status: 400 }
      );
    }

    let filePath: string;
    let contentType: string;

    switch (type) {
      case 'json':
        filePath = path.join(DATA_DIR, `${filename}.json`);
        contentType = 'application/json';
        break;
      case 'csv':
        filePath = path.join(DATA_DIR, `${filename}.csv`);
        contentType = 'text/csv';
        break;
      case 'report':
        filePath = path.join(DATA_DIR, `${filename}_report.txt`);
        contentType = 'text/plain';
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid file type' },
          { status: 400 }
        );
    }

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Read file content
    const content = await fs.readFile(filePath, 'utf-8');

    // Return file as response
    return new NextResponse(content, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${path.basename(filePath)}"`,
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
