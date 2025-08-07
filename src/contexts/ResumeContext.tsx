'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ParsedResumeData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  certifications: string[];
}

interface ResumeContextType {
  resumeData: ParsedResumeData | null;
  setResumeData: (data: ParsedResumeData | null) => void;
  clearResumeData: () => void;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: ReactNode }) {
  const [resumeData, setResumeData] = useState<ParsedResumeData | null>(null);

  const clearResumeData = () => {
    setResumeData(null);
  };

  return (
    <ResumeContext.Provider value={{ resumeData, setResumeData, clearResumeData }}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume() {
  const context = useContext(ResumeContext);
  if (context === undefined) {
    throw new Error('useResume must be used within a ResumeProvider');
  }
  return context;
}
