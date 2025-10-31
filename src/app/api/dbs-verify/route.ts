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

// Always use production API
const PRODUCTION_DBS_API_URL = 'https://perform-check.upstic.com/status/check';
const USE_PRODUCTION_API = true;

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (jsonParseError) {
      console.error('Failed to parse request body:', jsonParseError);
      return NextResponse.json(
        { 
          error: 'Invalid JSON in request body',
          details: jsonParseError instanceof Error ? jsonParseError.message : 'Parse error'
        },
        { status: 400 }
      );
    }
    
    // Validate required fields
    if (!body.certificateNumber || !body.applicantSurname || !body.dob) {
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          details: {
            certificateNumber: !body.certificateNumber,
            applicantSurname: !body.applicantSurname,
            dob: !body.dob
          }
        },
        { status: 400 }
      );
    }

    // Ensure fields are strings and validate they're not empty
    const certificateNumber = String(body.certificateNumber || '').trim();
    const applicantSurname = String(body.applicantSurname || '').trim();
    
    if (!certificateNumber || !applicantSurname) {
      return NextResponse.json(
        { error: 'Certificate number and applicant surname cannot be empty' },
        { status: 400 }
      );
    }

    console.log('DBS Verification Request:', {
      certificateNumber,
      applicantSurname,
      dobFormat: typeof body.dob,
      dobValue: body.dob
    });

    // Prepare the request payload
    // Handle DOB - it can be an object {day, month, year} or a string 'YYYY-MM-DD'
    let dobObj: { day: string; month: string; year: string };
    if (typeof body.dob === 'string') {
      // Parse string format 'YYYY-MM-DD'
      const parts = body.dob.split('-');
      if (parts.length !== 3) {
        return NextResponse.json(
          { error: 'Invalid date of birth format. Expected YYYY-MM-DD' },
          { status: 400 }
        );
      }
      dobObj = {
        day: parts[2]?.trim() || '',
        month: parts[1]?.trim() || '',
        year: parts[0]?.trim() || ''
      };
    } else if (body.dob && typeof body.dob === 'object' && !Array.isArray(body.dob)) {
      // Already an object
      dobObj = {
        day: String(body.dob.day || '').trim(),
        month: String(body.dob.month || '').trim(),
        year: String(body.dob.year || '').trim()
      };
    } else {
      return NextResponse.json(
        { error: 'Invalid date of birth format. Expected object {day, month, year} or string YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Validate that all DOB fields are present and not empty
    if (!dobObj.day || !dobObj.month || !dobObj.year) {
      console.error('DOB validation failed:', { day: dobObj.day, month: dobObj.month, year: dobObj.year });
      return NextResponse.json(
        { 
          error: 'Date of birth is incomplete. Please provide day, month, and year',
          details: { received: dobObj }
        },
        { status: 400 }
      );
    }

    // Validate DOB values are reasonable
    const day = parseInt(dobObj.day, 10);
    const month = parseInt(dobObj.month, 10);
    const year = parseInt(dobObj.year, 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      return NextResponse.json(
        { error: 'Date of birth contains invalid numbers' },
        { status: 400 }
      );
    }

    if (day < 1 || day > 31 || month < 1 || month > 12 || year < 1900 || year > new Date().getFullYear()) {
      return NextResponse.json(
        { error: 'Date of birth contains invalid values' },
        { status: 400 }
      );
    }

    const verifyPayload: DBSVerifyRequest = {
      organisationName: body.organisationName || 'Upstic Healthcare',
      requesterForename: body.requesterForename || 'Upstic',
      requesterSurname: body.requesterSurname || 'Admin',
      certificateNumber,
      applicantSurname,
      dob: dobObj
    };

    console.log('DBS Verification Payload:', {
      ...verifyPayload,
      dob: verifyPayload.dob // Already logged above
    });

    // Call the DBS verification API
    // Check if raw format is requested (for simpler response)
    const useRawFormat = request.nextUrl.searchParams.get('raw') === '1' || 
                         body.raw === true;
    
    // Always use production API
    const apiUrl = useRawFormat ? `${PRODUCTION_DBS_API_URL}?raw=1` : PRODUCTION_DBS_API_URL;
    
    console.log('Calling DBS API:', apiUrl, useRawFormat ? '(raw format)' : '(full format)');

    let response: Response;
    try {
      // Add timeout for fetch (30 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(verifyPayload),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
    } catch (fetchError) {
      console.error('DBS API fetch error:', fetchError);
      
      let errorMessage = 'Failed to connect to DBS verification service';
      let errorDetails = 'Connection error';
      
      if (fetchError instanceof Error) {
        errorDetails = fetchError.message;
        if (fetchError.name === 'AbortError') {
          errorMessage = 'DBS verification service request timed out';
          errorDetails = 'Request took longer than 30 seconds';
        } else if (errorDetails.includes('ECONNREFUSED') || errorDetails.includes('fetch failed')) {
          errorMessage = 'DBS verification service is not available';
          errorDetails = 'Could not connect to the service. Please ensure it is running.';
        }
      }
      
      return NextResponse.json(
        { 
          error: errorMessage,
          details: errorDetails
        },
        { status: 503 }
      );
    }

    // Handle response - even 400 from DBS API might be a valid verification result
    let data: any;
    try {
      data = await response.json();
    } catch (jsonError) {
      // If we can't parse JSON and response is not ok, return error
      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('DBS API error response (non-JSON):', response.status, errorText);
        return NextResponse.json(
          { 
            error: 'Failed to verify DBS certificate',
            details: `API returned status ${response.status}: ${errorText}` 
          },
          { status: response.status >= 400 && response.status < 500 ? response.status : 500 }
        );
      }
      console.error('DBS API JSON parse error:', jsonError);
      return NextResponse.json(
        { 
          error: 'Invalid response from DBS verification service',
          details: 'Could not parse response'
        },
        { status: 502 }
      );
    }

    // If DBS API returned ok: false, this is a verification failure, not an HTTP error
    // Return it as a successful API call with verification failure
    if (data.ok === false || !data.ok) {
      console.log('DBS Verification failed:', data.error || 'Verification failed');
      return NextResponse.json({
        success: true,
        data: {
          ok: false,
          structured: data.structured || null,
          error: data.error || 'Verification failed',
          verificationDate: new Date().toISOString(),
        }
      });
    }

    // If response is not ok but no valid data structure, treat as HTTP error
    if (!response.ok && !data.ok && !data.error) {
      console.error('DBS API HTTP error:', response.status, data);
      return NextResponse.json(
        { 
          error: 'Failed to verify DBS certificate',
          details: `API returned status ${response.status}` 
        },
        { status: response.status >= 400 && response.status < 500 ? response.status : 500 }
      );
    }

    // Normalize the response - handle both full format and raw format
    let normalizedData: any;
    
    if (useRawFormat || !data.structured) {
      // Raw format or fields at top level
      normalizedData = {
        ok: data.ok !== false,
        structured: {
          personName: data.personName || '',
          dateOfBirth: data.dateOfBirth || '',
          certificateNumber: data.certificateNumber || verifyPayload.certificateNumber,
          certificatePrintDate: data.certificatePrintDate || '',
          outcomeText: data.outcomeText || '',
          outcome: data.outcome || 'error'
        },
        verificationDate: new Date().toISOString(),
      };
    } else {
      // Full format with nested structured object
      normalizedData = {
        ok: data.ok !== false,
        structured: data.structured || {},
        verificationDate: new Date().toISOString(),
      };
    }

    // Validate that we got proper verification details
    // If verification fails, we typically don't get structured details with outcome
    const hasStructuredData = normalizedData.structured && Object.keys(normalizedData.structured).length > 0;
    const hasOutcome = normalizedData.structured?.outcome && 
                       ['clear_and_current', 'current', 'not_current'].includes(normalizedData.structured.outcome);
    const hasCertificateNumber = normalizedData.structured?.certificateNumber && 
                                 normalizedData.structured.certificateNumber.trim() !== '';

    // If we don't have proper details (outcome, certificate number), verification failed
    if (!hasStructuredData || !hasOutcome || !hasCertificateNumber) {
      console.log('DBS Verification failed - missing verification details:', {
        hasStructuredData,
        hasOutcome,
        hasCertificateNumber,
        structured: normalizedData.structured
      });
      return NextResponse.json({
        success: true,
        data: {
          ok: false,
          structured: null,
          error: data.error || 'Verification failed - certificate details could not be verified',
          verificationDate: new Date().toISOString(),
        }
      });
    }

    // Validate certificate number matches - if returned certificate number doesn't match submitted one, it's a failure
    const returnedCertNumber = normalizedData.structured?.certificateNumber || '';
    const submittedCertNumber = verifyPayload.certificateNumber.trim().toUpperCase();
    
    // Normalize both for comparison (remove any whitespace, make uppercase)
    const normalizedReturned = returnedCertNumber.trim().toUpperCase();
    const normalizedSubmitted = submittedCertNumber.trim().toUpperCase();
    
    // If certificate numbers don't match exactly, treat as verification failure
    if (normalizedReturned && normalizedSubmitted && normalizedReturned !== normalizedSubmitted) {
      console.log('Certificate number mismatch:', {
        submitted: normalizedSubmitted,
        returned: normalizedReturned
      });
      return NextResponse.json({
        success: true,
        data: {
          ok: false,
          structured: normalizedData.structured,
          error: `Certificate number mismatch. Submitted: ${submittedCertNumber}, Returned: ${returnedCertNumber}`,
          verificationDate: new Date().toISOString(),
        }
      });
    }

    // All validations passed - verification is successful
    normalizedData.ok = true;

    // Return the verification result
    return NextResponse.json({
      success: true,
      data: normalizedData
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
