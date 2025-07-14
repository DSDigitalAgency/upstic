import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workerId: string }> }
) {
  const { workerId } = await params;

  if (!workerId) {
    return NextResponse.json(
      { message: 'Worker ID is required' },
      { status: 400 }
    );
  }

  // Simulate a successful verification
  return NextResponse.json({
    message: `Bank account for worker ${workerId} submitted for verification.`,
    workerId,
    status: 'submitted',
  });
}

export function GET() {
  return NextResponse.json(
    { message: 'Method Not Allowed' },
    { status: 405 }
  );
} 