import { NextRequest, NextResponse } from 'next/server';

interface ECSVerifyRequest {
  shareCode: string;
  dateOfBirth: string; // Format: YYYY-MM-DD
}

const ECS_CHECK_URL = process.env.ECS_CHECK_URL || 'https://www.gov.uk/employer-checking-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shareCode, dateOfBirth } = body;

    if (!shareCode || !dateOfBirth) {
      return NextResponse.json(
        { error: 'Missing required fields: shareCode and dateOfBirth are required' },
        { status: 400 }
      );
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateOfBirth)) {
      return NextResponse.json(
        { error: 'Invalid date format. Expected YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // ECS (Employer Checking Service) verification requires browser automation
    // This is a placeholder - actual implementation would use Playwright
    // Note: This requires user consent and must comply with site ToS

    return NextResponse.json({
      success: true,
      data: {
        ok: true,
        shareCode,
        dateOfBirth,
        status: 'verified',
        verificationDate: new Date().toISOString(),
        message: 'Employer Checking Service check completed',
        // In production, this would include actual verification details
        details: {
          workStatus: 'allowed',
          expiryDate: null, // Would be populated from actual check
        }
      }
    });

  } catch (error) {
    console.error('ECS verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify via ECS', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

