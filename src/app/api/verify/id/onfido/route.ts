import { NextRequest, NextResponse } from 'next/server';

interface OnfidoRequest {
  redirectUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { redirectUrl } = body;

    // Onfido ID verification
    // https://documentation.onfido.com
    // 3rd Party Integration / redirect

    const onfidoUrl = process.env.ONFIDO_REDIRECT_URL || 'https://onfido.com/verify';

    // For demo/testing: Return mock response with redirect URL
    // In production, this would redirect to Onfido service
    return NextResponse.json({
      success: true,
      data: {
        ok: true,
        provider: 'onfido',
        redirectUrl: redirectUrl || onfidoUrl,
        verificationDate: new Date().toISOString(),
        message: 'Onfido ID verification initiated',
        // In production, result would be returned via webhook/callback
        resultUrl: null,
      }
    });

  } catch (error) {
    console.error('Onfido verification error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Onfido verification', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

