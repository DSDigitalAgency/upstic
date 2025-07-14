import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string }> }
) {
  try {
    // Next.js 15: context.params is a Promise, need to await it
    const { filename } = await context.params;
    const filePath = path.join(process.cwd(), 'src/demo/data', filename);
    
    // Security check: only allow JSON files
    if (!filename.endsWith('.json')) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      );
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }
    
    const data = fs.readFileSync(filePath, 'utf-8');
    const jsonData = JSON.parse(data);
    
    return NextResponse.json(jsonData);
  } catch (error) {
    console.error('Error reading demo data:', error);
    return NextResponse.json(
      { error: 'Failed to read data' },
      { status: 500 }
    );
  }
} 