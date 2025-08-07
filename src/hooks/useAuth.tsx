'use client';

import React, { useState, useEffect, createContext, useContext } from 'react';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'client' | 'worker';
  username: string;
  firstName: string;
  lastName: string;
  phone: string;
  resumeUrl?: string | null;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  register: (userData: {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: 'worker' | 'client' | 'admin';
    resume?: File | null;
  }) => Promise<{ success: boolean; error?: string; resumeData?: any }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const res = await fetch('/api/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      if (!res.ok) {
        const data = await res.json();
        return { success: false, error: data.error || 'Invalid email or password' };
      }
      const data = await res.json();
      setUser(data.user as User);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { success: true, resumeData: data.resumeData };
    } catch {
      return { success: false, error: 'Login failed' };
    }
  };

  const register = async (userData: {
    email: string;
    password: string;
    username: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: 'worker' | 'client' | 'admin';
    resume?: File | null;
  }) => {
    try {
      let res;
      
      if (userData.resume) {
        // If resume is provided, use FormData
        const formData = new FormData();
        formData.append('email', userData.email);
        formData.append('password', userData.password);
        formData.append('username', userData.username);
        formData.append('firstName', userData.firstName);
        formData.append('lastName', userData.lastName);
        formData.append('phone', userData.phone);
        formData.append('role', userData.role);
        formData.append('resume', userData.resume);
        
        res = await fetch('/api/demo-register', {
          method: 'POST',
          body: formData,
        });
      } else {
        // If no resume, use JSON
        res = await fetch('/api/demo-register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(userData),
        });
      }
      
      const data = await res.json();
      
      if (!res.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }
      
      setUser(data.user as User);
      localStorage.setItem('user', JSON.stringify(data.user));
      return { success: true, resumeData: data.resumeData };
    } catch {
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 