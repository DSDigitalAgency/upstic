import { NextRequest, NextResponse } from 'next/server';

interface OfqualVerifyRequest {
  qualificationNumber?: string;
  qualificationTitle?: string;
  awardingOrganisation?: string;
}

const OFQUAL_API_URL = process.env.OFQUAL_API_URL || 'https://register.ofqual.gov.uk/api/qualifications';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const qualificationNumber = searchParams.get('qualificationNumber');
    const qualificationTitle = searchParams.get('qualificationTitle');
    const awardingOrganisation = searchParams.get('awardingOrganisation');

    if (!qualificationNumber && !qualificationTitle) {
      return NextResponse.json(
        { error: 'Either qualificationNumber or qualificationTitle is required' },
        { status: 400 }
      );
    }

    // For demo/testing: Return mock response based on qualification number
    // In production, this would connect to the real Ofqual API
    const isCorrect = qualificationNumber && 
                     !qualificationNumber.toUpperCase().includes('INVALID') && 
                     qualificationNumber !== 'INVALID999';
    
    if (isCorrect) {
      // Mock successful verification
      return NextResponse.json({
        success: true,
        data: {
          ok: true,
          qualification: {
            qualificationNumber: qualificationNumber,
            qualificationTitle: qualificationTitle || 'Level 3 Diploma in Health and Social Care',
            awardingOrganisation: awardingOrganisation || 'Pearson',
            level: 'Level 3',
            status: 'Current'
          },
          verificationDate: new Date().toISOString(),
        }
      });
    } else {
      // Mock failed verification
      return NextResponse.json({
        success: true,
        data: {
          ok: false,
          qualification: null,
          verificationDate: new Date().toISOString(),
          error: 'Qualification not found in Ofqual register',
        }
      });
    }
  } catch (error) {
    console.error('Ofqual verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify qualification', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { qualificationNumber, qualificationTitle, awardingOrganisation } = body;

    if (!qualificationNumber && !qualificationTitle) {
      return NextResponse.json(
        { error: 'Either qualificationNumber or qualificationTitle is required' },
        { status: 400 }
      );
    }

    // For demo/testing: Return mock response based on qualification number
    // In production, this would connect to the real Ofqual API
    const isCorrect = qualificationNumber && 
                     !qualificationNumber.toUpperCase().includes('INVALID') && 
                     qualificationNumber !== 'INVALID999';
    
    if (isCorrect) {
      // Mock successful verification
      return NextResponse.json({
        success: true,
        data: {
          ok: true,
          qualification: {
            qualificationNumber: qualificationNumber,
            qualificationTitle: qualificationTitle || 'Level 3 Diploma in Health and Social Care',
            awardingOrganisation: awardingOrganisation || 'Pearson',
            level: 'Level 3',
            status: 'Current'
          },
          verificationDate: new Date().toISOString(),
        }
      });
    } else {
      // Mock failed verification
      return NextResponse.json({
        success: true,
        data: {
          ok: false,
          qualification: null,
          verificationDate: new Date().toISOString(),
          error: 'Qualification not found in Ofqual register',
        }
      });
    }
  } catch (error) {
    console.error('Ofqual verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify qualification', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

