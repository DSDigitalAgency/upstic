import { NextRequest, NextResponse } from 'next/server';
import { ecsScraper } from '@/lib/ecsScraper';

interface ECSVerifyRequest {
  shareCode: string;
  dateOfBirth: string; // Format: YYYY-MM-DD
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shareCode, dateOfBirth } = body;

    if (!shareCode) {
      return NextResponse.json(
        { error: 'Missing required field: shareCode' },
        { status: 400 }
      );
    }

    if (!dateOfBirth) {
      return NextResponse.json(
        { error: 'Missing required field: dateOfBirth' },
        { status: 400 }
      );
    }

    // Validate share code format (typically 9 alphanumeric characters)
    const cleanShareCode = shareCode.replace(/\s+/g, '').toUpperCase();
    if (!/^[A-Z0-9]{9}$/.test(cleanShareCode)) {
      return NextResponse.json(
        { 
          error: 'Invalid share code format',
          details: 'Share code must be 9 alphanumeric characters (e.g., ABC123XYZ)'
        },
        { status: 400 }
      );
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateOfBirth)) {
      return NextResponse.json(
        { error: 'Invalid date format. Expected YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Validate date is a real date
    const [year, month, day] = dateOfBirth.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    if (
      dateObj.getFullYear() !== year ||
      dateObj.getMonth() !== month - 1 ||
      dateObj.getDate() !== day
    ) {
      return NextResponse.json(
        { error: 'Invalid date. Please enter a valid date.' },
        { status: 400 }
      );
    }

    console.log('[ECS API] Starting verification for share code:', cleanShareCode);

    // Perform the verification using web scraping
    const result = await ecsScraper({
      shareCode: cleanShareCode,
      dateOfBirth,
    });

    console.log('[ECS API] Verification result:', {
      success: result.success,
      verified: result.verified,
      status: result.status,
      result: result.result,
    });

    // Return the result
    return NextResponse.json({
      success: result.success,
      verified: result.verified,
      data: {
        shareCode: result.shareCode,
        dateOfBirth: result.dateOfBirth,
        status: result.status,
        result: result.result,
        message: result.message,
        details: result.details,
        verificationDate: result.verificationDate,
        serviceUrl: 'https://www.gov.uk/employer-checking-service',
      }
    });

  } catch (error) {
    console.error('[ECS API] Verification error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to verify via Employer Checking Service', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

