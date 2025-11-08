import { NextRequest, NextResponse } from 'next/server';

interface UKVIRequest {
  email?: string;
  shareCode?: string;
  dateOfBirth?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, shareCode, dateOfBirth } = body;

    // UKVI account access for candidates
    // https://www.gov.uk/get-access-evisa
    // View and prove immigration status: https://www.gov.uk/view-prove-immigration-status

    if (!email && !shareCode) {
      return NextResponse.json(
        { error: 'Either email (for UKVI account access) or shareCode (for immigration status) is required' },
        { status: 400 }
      );
    }

    // For demo/testing: Return mock response
    // In production, this would use browser automation to access UKVI services
    if (email) {
      // UKVI account access
      return NextResponse.json({
        success: true,
        data: {
          ok: true,
          type: 'ukvi_account_access',
          email,
          verificationDate: new Date().toISOString(),
          message: 'UKVI account access verification initiated',
          redirectUrl: 'https://www.gov.uk/get-access-evisa',
        }
      });
    } else if (shareCode && dateOfBirth) {
      // View and prove immigration status
      return NextResponse.json({
        success: true,
        data: {
          ok: true,
          type: 'immigration_status',
          shareCode,
          dateOfBirth,
          verificationDate: new Date().toISOString(),
          message: 'Immigration status verification completed',
          details: {
            workStatus: 'allowed',
            expiryDate: null,
          }
        }
      });
    }

    return NextResponse.json(
      { error: 'Invalid request parameters' },
      { status: 400 }
    );

  } catch (error) {
    console.error('UKVI verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify UKVI status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

