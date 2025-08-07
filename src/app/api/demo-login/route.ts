import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const USERS_PATH = path.join(process.cwd(), 'src/demo/data/users.json');
const WORKERS_PATH = path.join(process.cwd(), 'src/demo/data/workers.json');

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // First check users.json
    let users;
    try {
      const data = fs.readFileSync(USERS_PATH, 'utf-8');
      users = JSON.parse(data);
    } catch {
      return NextResponse.json(
        { error: 'Failed to read users data' },
        { status: 500 }
      );
    }

    let user = users.find((u: { email: string; password: string }) => u.email === email);
    
    // If not found in users.json, check workers.json
    if (!user) {
      let workers;
      try {
        const workersData = fs.readFileSync(WORKERS_PATH, 'utf-8');
        workers = JSON.parse(workersData);
      } catch {
        return NextResponse.json(
          { error: 'Failed to read workers data' },
          { status: 500 }
        );
      }

      const worker = workers.find((w: { email: string; password?: string }) => w.email === email);
      if (worker) {
        // Create a user object from worker data
        user = {
          id: worker.id,
          email: worker.email,
          firstName: worker.firstName,
          lastName: worker.lastName,
          phone: worker.phone,
          role: 'worker',
          password: worker.password || 'default-password', // Use default if no password
          createdAt: worker.createdAt,
          updatedAt: worker.updatedAt
        };
      }
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if password is hashed (new users) or plain text (demo users)
    let isPasswordValid = false;
    
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      // Password is hashed, use bcrypt compare
      isPasswordValid = await bcrypt.compare(password, user.password);
    } else {
      // Password is plain text (demo users), direct comparison
      isPasswordValid = user.password === password;
    }
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Don't return password in response
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _unused, ...userWithoutPassword } = user;
    return NextResponse.json({ user: userWithoutPassword });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 