import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const USERS_PATH = path.join(process.cwd(), 'src/demo/data/users.json');

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

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

    const user = users.find((u: { email: string; password: string }) => u.email === email && u.password === password);
    if (!user) {
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