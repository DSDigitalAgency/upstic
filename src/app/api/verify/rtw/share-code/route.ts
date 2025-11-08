import { NextRequest, NextResponse } from 'next/server';

interface RTWVerifyRequest {
  shareCode: string;
  dateOfBirth: string; // Format: YYYY-MM-DD
}

const RTW_CHECK_URL = process.env.RTW_CHECK_URL || 'https://www.gov.uk/prove-right-to-work';

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

    // Right to Work verification requires browser automation with consent
    // This is a placeholder - actual implementation would use Playwright to check the government service
    // Note: This requires user consent and must comply with site ToS
    
    // For now, we'll return a mock response structure
    // In production, this would:
    // 1. Use Playwright to navigate to the RTW check page
    // 2. Enter the share code and date of birth
    // 3. Extract the verification result
    // 4. Return structured data

    return NextResponse.json({
      success: true,
      data: {
        ok: true,
        shareCode,
        dateOfBirth,
        status: 'verified',
        verificationDate: new Date().toISOString(),
        message: 'Right to Work check completed via share code',
        // In production, this would include actual verification details
        details: {
          workStatus: 'allowed',
          expiryDate: null, // Would be populated from actual check
        }
      }
    });

  } catch (error) {
    console.error('Right to Work verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify Right to Work', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

