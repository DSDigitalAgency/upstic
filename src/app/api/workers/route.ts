import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const workerData = await request.json();
    
    // Create a new worker with the provided data
    const newWorker = {
      id: workerData.id || `worker-${Date.now()}`,
      userId: workerData.userId,
      email: workerData.email || '',
      firstName: workerData.firstName,
      lastName: workerData.lastName,
      phone: workerData.phone,
      dateOfBirth: workerData.dateOfBirth,
      address: workerData.address,
      city: workerData.city,
      state: workerData.state,
      zipCode: workerData.zipCode,
      nationalInsurance: workerData.nationalInsurance,
      education: workerData.education || [],
      workHistory: workerData.workHistory || [],
      skills: workerData.skills || [],
      certifications: workerData.certifications || [],
      licenses: workerData.licenses || [],
      references: workerData.references || [],
      emergencyContact: workerData.emergencyContact,
      bankDetails: workerData.bankDetails,
      dbsVerification: workerData.dbsVerification || null,
      documents: workerData.documents || { cv: null, rightToWork: null, certificateOfSponsorship: null, proofOfAddress: null, qualificationCertificates: null, dbsCertificate: null, dbsUpdateService: null, immunizationRecords: null, occupationalHealth: null, photo: null },
      declarations: workerData.declarations || { gdprConsent: false, workPolicies: false, dataProcessing: false, backgroundCheck: false, healthDeclaration: false, termsAccepted: false },
      preferences: workerData.preferences || { preferredShifts: [], preferredLocations: [], hourlyRate: '0', maxTravelDistance: 50, notifications: { email: true, sms: false, push: true } },
      status: workerData.status || 'pending',
      rating: workerData.rating || 0,
      completedJobs: workerData.completedJobs || 0,
      createdAt: workerData.createdAt || new Date().toISOString(),
      updatedAt: workerData.updatedAt || new Date().toISOString()
    };

    // Read existing workers
    const workersFilePath = path.join(process.cwd(), 'src', 'demo', 'data', 'workers.json');
    let workers = [];
    
    try {
      const workersData = await fs.readFile(workersFilePath, 'utf-8');
      workers = JSON.parse(workersData);
    } catch (error) {
      // File doesn't exist or is empty, start with empty array
      workers = [];
    }

    // Add new worker
    workers.push(newWorker);

    // Write back to file
    await fs.writeFile(workersFilePath, JSON.stringify(workers, null, 2));

    return NextResponse.json(newWorker);
  } catch (error) {
    console.error('Error creating worker:', error);
    return NextResponse.json(
      { error: 'Failed to create worker' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const workersFilePath = path.join(process.cwd(), 'src', 'demo', 'data', 'workers.json');
    const workersData = await fs.readFile(workersFilePath, 'utf-8');
    const workers = JSON.parse(workersData);
    
    return NextResponse.json(workers);
  } catch (error) {
    console.error('Error reading workers:', error);
    return NextResponse.json(
      { error: 'Failed to read workers' },
      { status: 500 }
    );
  }
}
