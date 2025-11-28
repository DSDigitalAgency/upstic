import { NextRequest, NextResponse } from 'next/server';
import { checkDBSCertificate, DBSCheckRequest } from '@/lib/dbsScraper';

// Validate DBS certificate number format (12 digits)
function isValidCertificateNumber(certNumber: string): boolean {
  const cleaned = certNumber.replace(/\s/g, '');
  return /^\d{12}$/.test(cleaned);
}

// Validate date of birth
function isValidDOB(dob: { day: string; month: string; year: string }): { valid: boolean; error?: string } {
  const day = parseInt(dob.day, 10);
  const month = parseInt(dob.month, 10);
  const year = parseInt(dob.year, 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    return { valid: false, error: 'Date of birth must contain valid numbers' };
  }

  if (day < 1 || day > 31) {
    return { valid: false, error: 'Day must be between 1 and 31' };
  }

  if (month < 1 || month > 12) {
    return { valid: false, error: 'Month must be between 1 and 12' };
  }

  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear) {
    return { valid: false, error: `Year must be between 1900 and ${currentYear}` };
  }

  // Check if date is valid
  const date = new Date(year, month - 1, day);
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
    return { valid: false, error: 'Invalid date - this date does not exist' };
  }

  // Check person is at least 16 years old (minimum working age in UK)
  const today = new Date();
  const age = today.getFullYear() - year - (today.getMonth() < month - 1 || (today.getMonth() === month - 1 && today.getDate() < day) ? 1 : 0);
  if (age < 16) {
    return { valid: false, error: 'Person must be at least 16 years old' };
  }

  return { valid: true };
}

// Validate name (first or last)
function isValidName(name: string, fieldName: string): { valid: boolean; error?: string } {
  const cleaned = name.trim();
  
  if (cleaned.length < 1) {
    return { valid: false, error: `${fieldName} is required` };
  }
  
  if (cleaned.length > 50) {
    return { valid: false, error: `${fieldName} must be less than 50 characters` };
  }
  
  // Allow letters, hyphens, apostrophes, and spaces (for compound names)
  if (!/^[a-zA-Z\s'-]+$/.test(cleaned)) {
    return { valid: false, error: `${fieldName} contains invalid characters` };
  }
  
  return { valid: true };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { certificateNumber, firstName, lastName, dob } = body;

    // Check required fields
    if (!certificateNumber) {
      return NextResponse.json({
        success: false,
        error: 'Certificate number is required',
      }, { status: 400 });
    }

    if (!firstName) {
      return NextResponse.json({
        success: false,
        error: 'First name is required',
      }, { status: 400 });
    }

    if (!lastName) {
      return NextResponse.json({
        success: false,
        error: 'Last name is required',
      }, { status: 400 });
    }

    if (!dob || !dob.day || !dob.month || !dob.year) {
      return NextResponse.json({
        success: false,
        error: 'Complete date of birth (day, month, year) is required',
      }, { status: 400 });
    }

    // Validate certificate number format
    const cleanedCertNumber = certificateNumber.replace(/\s/g, '');
    if (!isValidCertificateNumber(cleanedCertNumber)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid certificate number format',
        details: 'DBS certificate number must be exactly 12 digits',
      }, { status: 400 });
    }

    // Validate first name
    const firstNameValidation = isValidName(firstName, 'First name');
    if (!firstNameValidation.valid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid first name',
        details: firstNameValidation.error,
      }, { status: 400 });
    }

    // Validate last name
    const lastNameValidation = isValidName(lastName, 'Last name');
    if (!lastNameValidation.valid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid last name',
        details: lastNameValidation.error,
      }, { status: 400 });
    }

    // Validate date of birth
    const dobValidation = isValidDOB(dob);
    if (!dobValidation.valid) {
      return NextResponse.json({
        success: false,
        error: 'Invalid date of birth',
        details: dobValidation.error,
      }, { status: 400 });
    }

    // Perform DBS check via web scraping
    console.log('Starting DBS verification for certificate:', cleanedCertNumber);
    
    const dbsRequest: DBSCheckRequest = {
      certificateNumber: cleanedCertNumber,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dob: {
        day: dob.day,
        month: dob.month,
        year: dob.year,
      },
    };

    const result = await checkDBSCertificate(dbsRequest);

    return NextResponse.json({
      success: result.success,
      verified: result.verified,
      data: result.data,
      error: result.error,
    });

  } catch (error) {
    console.error('DBS Update Service verification error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process verification request',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
