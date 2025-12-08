import { NextRequest, NextResponse } from 'next/server';
import { nmcScraper } from '@/lib/nmcScraper';
import { hcpcScraper } from '@/lib/hcpcScraper';
import { gmcScraper } from '@/lib/gmcScraper';
import { gdcScraper } from '@/lib/gdcScraper';

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

    const registerUrl = REGISTER_URLS[normalizedSource] || '';

    // Use web scraping for professional registers
    if (normalizedSource === 'nmc') {
      console.log('[NMC API] Starting NMC verification for registration:', registrationNumber);
      
      const result = await nmcScraper({
        registrationNumber,
        firstName,
        lastName,
        dateOfBirth,
      });

      return NextResponse.json({
        success: result.success,
        verified: result.verified,
        data: {
          source: normalizedSource,
          registrationNumber: result.registrationNumber,
          status: result.status,
          result: result.result,
          message: result.message,
          details: result.details,
          verificationDate: result.verificationDate,
          registerUrl,
        },
        error: result.status === 'error' ? result.message : undefined,
      });
    }

    if (normalizedSource === 'hcpc') {
      console.log('[HCPC API] Starting HCPC verification for registration:', registrationNumber);
      
      const result = await hcpcScraper({
        registrationNumber,
        firstName,
        lastName,
        dateOfBirth,
      });

      return NextResponse.json({
        success: result.success,
        verified: result.verified,
        data: {
          source: normalizedSource,
          registrationNumber: result.registrationNumber,
          status: result.status,
          result: result.result,
          message: result.message,
          details: result.details,
          verificationDate: result.verificationDate,
          registerUrl,
        },
        error: result.status === 'error' ? result.message : undefined,
      });
    }

    if (normalizedSource === 'gmc') {
      console.log('[GMC API] Starting GMC verification for registration:', registrationNumber);
      
      const result = await gmcScraper({
        registrationNumber,
        firstName,
        lastName,
        dateOfBirth,
      });

      return NextResponse.json({
        success: result.success,
        verified: result.verified,
        data: {
          source: normalizedSource,
          registrationNumber: result.registrationNumber,
          status: result.status,
          result: result.result,
          message: result.message,
          details: result.details,
          verificationDate: result.verificationDate,
          registerUrl,
        },
        error: result.status === 'error' ? result.message : undefined,
      });
    }

    if (normalizedSource === 'gdc') {
      console.log('[GDC API] Starting GDC verification for registration:', registrationNumber);
      
      const result = await gdcScraper({
        registrationNumber,
        firstName,
        lastName,
        dateOfBirth,
      });

      return NextResponse.json({
        success: result.success,
        verified: result.verified,
        data: {
          source: normalizedSource,
          registrationNumber: result.registrationNumber,
          status: result.status,
          result: result.result,
          message: result.message,
          details: result.details,
          verificationDate: result.verificationDate,
          registerUrl,
        },
        error: result.status === 'error' ? result.message : undefined,
      });
    }

    // For other registers, return mock response (to be implemented)
    // Professional register verification requires browser automation (Playwright)
    // No public APIs available; must comply with site ToS
    
    return NextResponse.json({
      success: true,
      verified: true,
      data: {
        source: normalizedSource,
        registrationNumber,
        status: 'verified',
        verificationDate: new Date().toISOString(),
        message: `Professional register check completed for ${normalizedSource.toUpperCase()} (mock response - implementation pending)`,
        registerUrl,
        details: {
          name: firstName && lastName ? `${firstName} ${lastName}` : undefined,
          registrationStatus: 'active',
          expiryDate: null,
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

