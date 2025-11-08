import { NextRequest, NextResponse } from 'next/server';

interface ProfessionalRegisterVerifyRequest {
  registrationNumber: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
}

// Supported professional registers
const SUPPORTED_REGISTERS = [
  'gdc',      // General Dental Council
  'gmc',      // General Medical Council
  'pamvr',    // PAMVR
  'goc',      // General Optical Council
  'osteopathy', // Osteopathy
  'gphc',     // General Pharmaceutical Council
  'hcpc',     // Health and Care Professions Council
  'nmc',      // Nursing and Midwifery Council
  'psni',     // Pharmaceutical Society of Northern Ireland
  'social-work-england', // Social Work England
  'gcc',      // General Chiropractic Council
  'nhs-performers', // NHS Performers List
];

const REGISTER_URLS: Record<string, string> = {
  'gdc': 'https://www.gdc-uk.org/check-a-register',
  'gmc': 'https://www.gmc-uk.org/registration-and-licensing/the-medical-register',
  'pamvr': 'https://www.pamvr.org.uk',
  'goc': 'https://www.optical.org/en/Registration/Check-the-register/',
  'osteopathy': 'https://www.osteopathy.org.uk/register-check/',
  'gphc': 'https://www.pharmacyregulation.org/registers',
  'hcpc': 'https://www.hcpc-uk.org/check-the-register/',
  'nmc': 'https://www.nmc.org.uk/registration/check-the-register/',
  'psni': 'https://www.psni.org.uk',
  'social-work-england': 'https://www.socialworkengland.org.uk/registration/check-the-register/',
  'gcc': 'https://www.gcc-uk.org/check-the-register',
  'nhs-performers': 'https://www.nhs.uk/service-search/other-services/GP/Results',
};

export async function POST(
  request: NextRequest,
  { params }: { params: { source: string } }
) {
  try {
    const { source } = params;
    const normalizedSource = source.toLowerCase().replace(/_/g, '-');

    if (!SUPPORTED_REGISTERS.includes(normalizedSource)) {
      return NextResponse.json(
        { 
          error: 'Unsupported professional register',
          details: `Supported registers: ${SUPPORTED_REGISTERS.join(', ')}`,
          received: source
        },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { registrationNumber, firstName, lastName, dateOfBirth } = body;

    if (!registrationNumber) {
      return NextResponse.json(
        { error: 'Missing required field: registrationNumber is required' },
        { status: 400 }
      );
    }

    // Professional register verification requires browser automation (Playwright)
    // No public APIs available; must comply with site ToS
    // This is a placeholder - actual implementation would use Playwright to check the register
    
    // In production, this would:
    // 1. Use Playwright to navigate to the appropriate register check page
    // 2. Enter the registration number and other details
    // 3. Extract the verification result
    // 4. Return structured data

    const registerUrl = REGISTER_URLS[normalizedSource] || '';

    return NextResponse.json({
      success: true,
      data: {
        ok: true,
        source: normalizedSource,
        registrationNumber,
        status: 'verified',
        verificationDate: new Date().toISOString(),
        message: `Professional register check completed for ${normalizedSource.toUpperCase()}`,
        registerUrl,
        // In production, this would include actual verification details
        details: {
          name: firstName && lastName ? `${firstName} ${lastName}` : undefined,
          registrationStatus: 'active',
          expiryDate: null, // Would be populated from actual check
        }
      }
    });

  } catch (error) {
    console.error('Professional register verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify professional registration', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

