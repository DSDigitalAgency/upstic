import { NextRequest, NextResponse } from 'next/server';

interface BritishCitizenRTWRequest {
  provider: 'credas' | 'ebulk' | 'yoti';
  redirectUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { provider, redirectUrl } = body;

    if (!provider || !['credas', 'ebulk', 'yoti'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider. Must be credas, ebulk, or yoti' },
        { status: 400 }
      );
    }

    // For demo/testing: Return mock response with redirect URL
    // In production, this would redirect to the 3rd party service
    const providerUrls = {
      credas: process.env.CREDAS_REDIRECT_URL || 'https://credas.com/verify',
      ebulk: process.env.EBULK_REDIRECT_URL || 'https://ebulk.co.uk/verify',
      yoti: process.env.YOTI_REDIRECT_URL || 'https://www.yoti.com/verify',
    };

    return NextResponse.json({
      success: true,
      data: {
        ok: true,
        provider,
        redirectUrl: redirectUrl || providerUrls[provider],
        verificationDate: new Date().toISOString(),
        message: `British Citizen Right to Work verification initiated via ${provider.toUpperCase()}`,
        // In production, this would trigger a redirect to the 3rd party service
        // The result would be saved as PDF format
        pdfResultUrl: null, // Would be populated after verification completes
      }
    });

  } catch (error) {
    console.error('British Citizen RTW verification error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate British Citizen RTW verification', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

