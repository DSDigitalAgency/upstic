import { NextRequest, NextResponse } from 'next/server';

interface ImmigrationStatusRequest {
  shareCode: string;
  dateOfBirth: string;
  supplementaryDocument?: File | string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { shareCode, dateOfBirth, supplementaryDocument } = body;

    if (!shareCode || !dateOfBirth) {
      return NextResponse.json(
        { error: 'Missing required fields: shareCode and dateOfBirth are required' },
        { status: 400 }
      );
    }

    // Employee immigration status check
    // https://www.gov.uk/employee-immigration-employment-status
    // Result needs to be saved as PDF format plus option to upload Supplementary Document

    // For demo/testing: Return mock response
    // In production, this would use browser automation to check the government service
    return NextResponse.json({
      success: true,
      data: {
        ok: true,
        shareCode,
        dateOfBirth,
        status: 'verified',
        verificationDate: new Date().toISOString(),
        message: 'Employee immigration status check completed',
        pdfResultUrl: null, // Would be populated with PDF result
        supplementaryDocumentUploaded: !!supplementaryDocument,
        details: {
          workStatus: 'allowed',
          expiryDate: null,
          restrictions: [],
        }
      }
    });

  } catch (error) {
    console.error('Immigration status verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify immigration status', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

