import { NextRequest, NextResponse } from 'next/server';

interface DBSVerifyRequest {
  organisationName: string;
  requesterForename: string;
  requesterSurname: string;
  certificateNumber: string;
  applicantSurname: string;
  dob: {
    day: string;
    month: string;
    year: string;
  };
}

interface DBSVerifyResponse {
  ok: boolean;
  title: string;
  summary: string;
  resultText: string;
  structured: {
    personName: string;
    dateOfBirth: string;
    certificateNumber: string;
    certificatePrintDate: string;
    outcomeText: string;
    outcome: 'clear_and_current' | 'current' | 'not_current' | 'error';
  };
  error?: string;
}

const DBS_API_URL = process.env.DBS_API_URL || 'http://127.0.0.1:5002/status/check';
const USE_PRODUCTION_API = process.env.USE_PRODUCTION_DBS_API === 'true';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.certificateNumber || !body.applicantSurname || !body.dob) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Prepare the request payload
    const verifyPayload: DBSVerifyRequest = {
      organisationName: body.organisationName || 'Upstic Healthcare',
      requesterForename: body.requesterForename || 'Upstic',
      requesterSurname: body.requesterSurname || 'Admin',
      certificateNumber: body.certificateNumber,
      applicantSurname: body.applicantSurname,
      dob: {
        day: body.dob.day || body.dob.split('-')[2] || '',
        month: body.dob.month || body.dob.split('-')[1] || '',
        year: body.dob.year || body.dob.split('-')[0] || ''
      }
    };

    // Call the DBS verification API
    const apiUrl = USE_PRODUCTION_API 
      ? 'https://perform-check.upstic.com/status/check'
      : DBS_API_URL;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(verifyPayload),
    });

    if (!response.ok) {
      return NextResponse.json(
        { 
          error: 'Failed to verify DBS certificate',
          details: `API returned status ${response.status}` 
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return the verification result
    return NextResponse.json({
      success: true,
      data: {
        ok: data.ok || true,
        structured: data.structured || data,
        verificationDate: new Date().toISOString(),
      }
    });

  } catch (error) {
    console.error('DBS verification error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to verify DBS certificate',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
