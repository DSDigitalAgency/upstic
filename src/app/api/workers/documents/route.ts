import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const expiryDate = formData.get('expiryDate') as string;
    const documentId = formData.get('documentId') as string;
    const file = formData.get('file') as File;
    const workerId = formData.get('workerId') as string;

    if (!title || !category || !workerId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!file && !documentId) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'documents', workerId);
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    let fileName = '';
    let filePath = '';

    if (file) {
      // Generate unique filename
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop();
      fileName = `${category.toLowerCase()}_${timestamp}.${fileExtension}`;
      filePath = join(uploadsDir, fileName);

      // Convert file to buffer and save
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);
    }

    // Create document record
    const document = {
      id: documentId || `doc-${Date.now()}`,
      title,
      description: description || '',
      fileUrl: file ? `/uploads/documents/${workerId}/${fileName}` : '',
      fileType: file ? file.type : '',
      fileSize: file ? file.size : 0,
      category: category as 'CERTIFICATION' | 'COMPLIANCE' | 'IDENTIFICATION' | 'OTHER',
      status: 'PENDING_REVIEW' as 'VALID' | 'EXPIRED' | 'PENDING_REVIEW',
      expiryDate: expiryDate || null,
      uploadedAt: new Date().toISOString(),
      workerId,
      verifiedAt: null,
      verifiedBy: null,
      tags: []
    };

    // In a real application, you would save this to a database
    // For now, we'll return the document object
    return NextResponse.json({
      success: true,
      data: document,
      message: 'Document uploaded successfully'
    });

  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workerId = searchParams.get('workerId');

    if (!workerId) {
      return NextResponse.json(
        { success: false, error: 'Worker ID required' },
        { status: 400 }
      );
    }

    // Check if the worker's upload directory exists
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'documents', workerId);
    
    if (!existsSync(uploadsDir)) {
      // Return empty array if no documents exist
      return NextResponse.json({
        success: true,
        data: []
      });
    }

    // Read all files in the worker's upload directory
    const files = await readdir(uploadsDir);
    
    // Convert files to document objects
    const documents = files.map((fileName, index) => {
      const filePath = join(uploadsDir, fileName);
      const fileExtension = fileName.split('.').pop()?.toLowerCase();
      
      // Determine file type based on extension
      let fileType = 'application/octet-stream';
      if (fileExtension === 'pdf') {
        fileType = 'application/pdf';
      } else if (['jpg', 'jpeg'].includes(fileExtension || '')) {
        fileType = 'image/jpeg';
      } else if (fileExtension === 'png') {
        fileType = 'image/png';
      } else if (['doc', 'docx'].includes(fileExtension || '')) {
        fileType = 'application/msword';
      }

      // Determine category and title based on filename
      let category = 'OTHER' as 'CERTIFICATION' | 'COMPLIANCE' | 'IDENTIFICATION' | 'OTHER';
      let title = fileName;
      
      if (fileName.toLowerCase().includes('cv') || fileName.toLowerCase().includes('resume')) {
        category = 'COMPLIANCE';
        title = 'CV - Professional Resume';
      } else if (fileName.toLowerCase().includes('right_to_work') || fileName.toLowerCase().includes('right to work')) {
        category = 'COMPLIANCE';
        title = 'Right to Work Document';
      } else if (fileName.toLowerCase().includes('proof_of_address') || fileName.toLowerCase().includes('proof of address')) {
        category = 'COMPLIANCE';
        title = 'Proof of Address';
      } else if (fileName.toLowerCase().includes('photo')) {
        category = 'COMPLIANCE';
        title = 'Profile Photo';
      } else if (fileName.toLowerCase().includes('qualification')) {
        category = 'CERTIFICATION';
        title = 'Qualification Certificates';
      } else if (fileName.toLowerCase().includes('dbs')) {
        category = 'CERTIFICATION';
        title = 'DBS Certificate';
      } else if (fileName.toLowerCase().includes('sponsorship')) {
        category = 'IDENTIFICATION';
        title = 'Certificate of Sponsorship';
      }

      return {
        id: `doc-${Date.now()}-${index}`,
        title,
        description: `Uploaded ${title.toLowerCase()}`,
        fileUrl: `/uploads/documents/${workerId}/${fileName}`,
        fileType,
        fileSize: 0, // We could get actual file size if needed
        category,
        status: 'VALID' as 'VALID' | 'EXPIRED' | 'PENDING_REVIEW',
        expiryDate: null,
        uploadedAt: new Date().toISOString(),
        workerId,
        verifiedAt: new Date().toISOString(),
        verifiedBy: 'admin-1',
        tags: [category.toLowerCase()]
      };
    });

    return NextResponse.json({
      success: true,
      data: documents
    });

  } catch (error) {
    console.error('Document fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
} 