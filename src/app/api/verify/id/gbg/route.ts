import { NextRequest, NextResponse } from 'next/server';

interface GBGRequest {
  redirectUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { redirectUrl } = body;

    // GBG GB Group ID verification
    // 3rd Party Integration / redirect

    const gbgUrl = process.env.GBG_REDIRECT_URL || 'https://gbgplc.com/verify';

    // For demo/testing: Return mock response with redirect URL
    // In production, this would redirect to GBG service
    return NextResponse.json({
      success: true,
      data: {
        ok: true,
        provider: 'gbg',
        redirectUrl: redirectUrl || gbgUrl,
        verificationDate: new Date().toISOString(),
        message: 'GBG ID verification initiated',
        // In production, result would be returned via webhook/callback
        resultUrl: null,
      }
    });

  } catch (error) {
    console.error('GBG verification error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate GBG verification', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

