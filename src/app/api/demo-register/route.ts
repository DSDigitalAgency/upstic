import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import { parseResume } from '@/lib/resumeParser';

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: 'worker' | 'client' | 'admin';
  password: string;
  resumeUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

export async function POST(request: NextRequest) {
  try {
    let email: string, password: string, username: string, firstName: string, lastName: string, phone: string, role: string;
    let resumeFile: File | null = null;
    let parsedResume: any = null;

    // Check if the request contains form data (resume upload) or JSON
    const contentType = request.headers.get('content-type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      // Handle FormData with resume file
      const formData = await request.formData();
      email = formData.get('email') as string;
      password = formData.get('password') as string;
      username = formData.get('username') as string;
      firstName = formData.get('firstName') as string;
      lastName = formData.get('lastName') as string;
      phone = formData.get('phone') as string;
      role = formData.get('role') as string;
      resumeFile = formData.get('resume') as File;
      
      // Parse resume if provided
      if (resumeFile) {
        try {
          parsedResume = await parseResume(resumeFile);
          
          // Override form data with resume data if available
          if (parsedResume.firstName && !firstName) firstName = parsedResume.firstName;
          if (parsedResume.lastName && !lastName) lastName = parsedResume.lastName;
          if (parsedResume.email && !email) email = parsedResume.email;
          if (parsedResume.phone && !phone) phone = parsedResume.phone;
        } catch (error) {
          console.error('Resume parsing error:', error);
          // Continue with registration even if resume parsing fails
        }
      }
    } else {
      // Handle JSON data
      const body = await request.json();
      email = body.email;
      password = body.password;
      username = body.username;
      firstName = body.firstName;
      lastName = body.lastName;
      phone = body.phone;
      role = body.role;
    }

    // Validate required fields
    if (!email || !password || !username || !firstName || !lastName || !phone || !role) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Read existing users
    const usersFilePath = path.join(process.cwd(), 'src', 'demo', 'data', 'users.json');
    let users: User[] = [];
    
    try {
      const usersData = await fs.readFile(usersFilePath, 'utf-8');
      users = JSON.parse(usersData);
    } catch (error) {
      // File doesn't exist or is empty, start with empty array
      users = [];
    }

    // Check if email already exists
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUsername = users.find(user => user.username === username);
    if (existingUsername) {
      return NextResponse.json(
        { error: 'This username is already taken' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Save resume file if provided
    let resumeUrl = '';
    if (resumeFile) {
      try {
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'resumes');
        await fs.mkdir(uploadsDir, { recursive: true });
        
        const fileName = `resume_${Date.now()}_${resumeFile.name}`;
        const filePath = path.join(uploadsDir, fileName);
        
        const bytes = await resumeFile.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await fs.writeFile(filePath, buffer);
        
        resumeUrl = `/uploads/resumes/${fileName}`;
      } catch (error) {
        console.error('Resume save error:', error);
        // Continue with registration even if resume save fails
      }
    }

    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      username,
      firstName,
      lastName,
      phone,
      role: role as 'worker' | 'client' | 'admin',
      password: hashedPassword,
      resumeUrl: resumeUrl || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add user to array
    users.push(newUser);

    // Write back to file
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2));

    // Return user data without password
    const { password: _, ...userWithoutPassword } = newUser;
    
    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
      message: 'Account created successfully',
      resumeData: parsedResume || null,
      resumeUrl: resumeUrl || null
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    );
  }
} 