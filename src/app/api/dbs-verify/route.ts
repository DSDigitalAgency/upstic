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
    // Default to raw format for simpler response (can be overridden with ?raw=0 or body.raw=false)
    const forceFullFormat = request.nextUrl.searchParams.get('raw') === '0' || body.raw === false;
    const useRawFormat = !forceFullFormat; // Default to true (raw format)
    
    // Always use production API
    // Use raw format by default as that's what the API returns
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

    // Check if the external API explicitly returned ok: false or if ok is missing/undefined
    // This is a verification failure, not an HTTP error - return it as a successful API call with verification failure
    if (data.ok === false || data.ok === undefined || data.ok === null) {
      console.log('DBS Verification failed - ok field is false, undefined, or null:', {
        ok: data.ok,
        error: data.error,
        hasStructured: !!data.structured
      });
      return NextResponse.json({
        success: true,
        data: {
          ok: false,
          structured: data.structured || null,
          error: data.error || 'Verification failed - certificate details could not be verified',
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

    // Log the raw response for debugging
    console.log('Raw API Response:', JSON.stringify(data, null, 2));
    
    // At this point, we know data.ok === true (we would have returned early otherwise)
    // Normalize the response - handle both full format and raw format
    let normalizedData: any;
    
    // Check if response has structured object (full format) or fields at top level (raw format)
    // Prioritize structured object if it exists, regardless of useRawFormat flag
    const hasStructuredObject = data.structured && typeof data.structured === 'object' && !Array.isArray(data.structured) && Object.keys(data.structured).length > 0;
    const hasTopLevelFields = (data.personName !== undefined && data.personName !== '') || 
                              (data.dateOfBirth !== undefined && data.dateOfBirth !== '') || 
                              (data.certificateNumber !== undefined && data.certificateNumber !== '');
    
    if (hasStructuredObject) {
      // Full format with nested structured object (even if raw=1 was requested, API might return structured)
      console.log('Using structured object from response');
      normalizedData = {
        ok: false, // Will be set to true only after all validations pass
        structured: data.structured,
        verificationDate: new Date().toISOString(),
      };
    } else if (hasTopLevelFields) {
      // Raw format with fields at top level
      console.log('Using top-level fields from response (raw format)');
      // DO NOT use fallback values - if the API didn't return them, it means verification failed
      normalizedData = {
        ok: false, // Will be set to true only after all validations pass
        structured: {
          personName: data.personName || '', // Empty string if not present
          dateOfBirth: data.dateOfBirth || '', // Empty string if not present
          certificateNumber: data.certificateNumber || '', // Empty string if not present - DO NOT use fallback
          certificatePrintDate: data.certificatePrintDate || '', // Empty string if not present
          outcomeText: data.outcomeText || '',
          outcome: data.outcome || 'error'
        },
        verificationDate: new Date().toISOString(),
      };
    } else {
      // No structured data found - verification failed
      console.log('No structured data found in response - verification failed');
      normalizedData = {
        ok: false,
        structured: null,
        verificationDate: new Date().toISOString(),
      };
    }
    
    console.log('Normalized data:', JSON.stringify(normalizedData, null, 2));

    // Validate that we got proper verification details
    // Even if external API returned ok: true, we need to verify the data is actually valid
    const hasStructuredData = normalizedData.structured && Object.keys(normalizedData.structured).length > 0;
    const hasOutcome = normalizedData.structured?.outcome && 
                       ['clear_and_current', 'current', 'not_current'].includes(normalizedData.structured.outcome);
    const hasCertificateNumber = normalizedData.structured?.certificateNumber && 
                                 normalizedData.structured.certificateNumber.trim() !== '';
    
    // Critical: personName and dateOfBirth must be non-empty for a valid verification
    // If these are empty, it means the verification didn't find a match for the submitted details
    const hasPersonName = normalizedData.structured?.personName && 
                          normalizedData.structured.personName.trim() !== '';
    const hasDateOfBirth = normalizedData.structured?.dateOfBirth && 
                           normalizedData.structured.dateOfBirth.trim() !== '';

    // If we don't have proper details (outcome, certificate number, personName, dateOfBirth), verification failed
    // This can happen even if external API returned ok: true but with incomplete data
    if (!hasStructuredData || !hasOutcome || !hasCertificateNumber || !hasPersonName || !hasDateOfBirth) {
      console.log('DBS Verification failed - missing verification details even though ok was true:', {
        hasStructuredData,
        hasOutcome,
        hasCertificateNumber,
        hasPersonName,
        hasDateOfBirth,
        structured: normalizedData.structured,
        externalOk: data.ok
      });
      return NextResponse.json({
        success: true,
        data: {
          ok: false,
          structured: null,
          error: data.error || 'Verification failed - certificate details do not match. Please verify the certificate number, surname, and date of birth.',
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

    // Validate that the returned personName contains the submitted surname
    // This ensures the verification actually matched the person we're checking
    const returnedPersonName = normalizedData.structured?.personName || '';
    const submittedSurname = verifyPayload.applicantSurname.trim().toUpperCase();
    const normalizedPersonName = returnedPersonName.trim().toUpperCase();
    
    // Check if the person name contains the surname (case-insensitive)
    // This handles cases like "ADEROJU KUJU" matching "KUJU"
    if (!normalizedPersonName.includes(submittedSurname)) {
      console.log('Surname mismatch in person name:', {
        submittedSurname,
        returnedPersonName: normalizedPersonName
      });
      return NextResponse.json({
        success: true,
        data: {
          ok: false,
          structured: normalizedData.structured,
          error: `Verification failed - the returned person name does not match the submitted surname. Please verify the certificate number, surname, and date of birth.`,
          verificationDate: new Date().toISOString(),
        }
      });
    }

    // All validations passed - verification is successful
    // Only set to true if we explicitly have valid verification data
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
