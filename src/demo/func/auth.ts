import fs from 'fs';
import path from 'path';

export interface DemoUser {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  password: string;
}

const USERS_PATH = path.join(__dirname, '../data/users.json');

export function getAllUsers(): DemoUser[] {
  const data = fs.readFileSync(USERS_PATH, 'utf-8');
  return JSON.parse(data) as DemoUser[];
}

export function authenticate(email: string, password: string): DemoUser | null {
  const users = getAllUsers();
  const user = users.find(u => u.email === email && u.password === password);
  return user || null;
} 