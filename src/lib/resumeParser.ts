// Resume parser utility for extracting information from uploaded resumes
// This is a simplified parser - in a real application, you might use more sophisticated libraries

export interface ParsedResume {
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

export async function parseResume(file: File): Promise<ParsedResume> {
  const text = await extractTextFromFile(file);
  return extractResumeData(text);
}

async function extractTextFromFile(file: File): Promise<string> {
  // For PDF files, we'll need a PDF parser
  // For now, we'll return a placeholder text
  // In a real application, you might use libraries like pdf-parse, mammoth, etc.
  
  if (file.type === 'application/pdf') {
    // For PDF files, we'd need to use a PDF parsing library
    // For demo purposes, we'll return a sample text
    return `
      John Smith
      john.smith@email.com
      (555) 123-4567
      123 Main Street, City, State 12345
      
      SKILLS
      Registered Nurse, Patient Care, ICU, Emergency Care, Pediatrics
      
      EXPERIENCE
      Registered Nurse - City Hospital (2020-2023)
      Provided patient care in ICU unit
      
      Licensed Practical Nurse - Community Clinic (2018-2020)
      Assisted with patient care and documentation
      
      EDUCATION
      Bachelor of Science in Nursing - University of Health Sciences (2018)
      Associate Degree in Nursing - Community College (2016)
      
      CERTIFICATIONS
      Registered Nurse License - State Board of Nursing
      Basic Life Support (BLS) - American Heart Association
      Advanced Cardiac Life Support (ACLS) - American Heart Association
    `;
  } else {
    // For DOC/DOCX files, we'd need to use a Word parsing library
    // For demo purposes, we'll return a sample text
    return `
      Sarah Johnson
      sarah.johnson@email.com
      (555) 987-6543
      456 Oak Avenue, Town, State 54321
      
      SKILLS
      Healthcare Assistant, Patient Care, Dementia Care, Medication Administration
      
      EXPERIENCE
      Healthcare Assistant - Senior Care Facility (2021-2023)
      Provided personal care and assistance to elderly residents
      
      Care Assistant - Home Health Agency (2019-2021)
      Assisted clients with daily living activities
      
      EDUCATION
      Healthcare Assistant Certificate - Technical Institute (2019)
      High School Diploma - Local High School (2018)
      
      CERTIFICATIONS
      Healthcare Assistant License - State Department of Health
      First Aid and CPR - Red Cross
    `;
  }
}

function extractResumeData(text: string): ParsedResume {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  
  const result: ParsedResume = {
    skills: [],
    experience: [],
    education: [],
    certifications: []
  };
  
  let currentSection = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Extract name (first two lines are usually name)
    if (i === 0 && !result.firstName) {
      const nameParts = line.split(' ');
      if (nameParts.length >= 2) {
        result.firstName = nameParts[0];
        result.lastName = nameParts.slice(1).join(' ');
      }
    }
    
    // Extract email
    if (line.includes('@') && !result.email) {
      result.email = line;
    }
    
    // Extract phone
    if (line.includes('(') && line.includes(')') && !result.phone) {
      result.phone = line;
    }
    
    // Extract address
    if (line.includes(',') && line.includes('Street') && !result.address) {
      result.address = line;
    }
    
    // Detect sections
    if (line.toUpperCase().includes('SKILLS')) {
      currentSection = 'skills';
      continue;
    }
    
    if (line.toUpperCase().includes('EXPERIENCE')) {
      currentSection = 'experience';
      continue;
    }
    
    if (line.toUpperCase().includes('EDUCATION')) {
      currentSection = 'education';
      continue;
    }
    
    if (line.toUpperCase().includes('CERTIFICATIONS')) {
      currentSection = 'certifications';
      continue;
    }
    
    // Parse section content
    switch (currentSection) {
      case 'skills':
        if (line && !line.includes('SKILLS')) {
          const skills = line.split(',').map(skill => skill.trim());
          result.skills.push(...skills);
        }
        break;
        
      case 'experience':
        if (line && !line.includes('EXPERIENCE')) {
          // Simple experience parsing
          if (line.includes('-')) {
            const parts = line.split('-');
            if (parts.length >= 2) {
              const titleCompany = parts[0].trim();
              const duration = parts[1].trim();
              
              // Try to separate title and company
              const titleCompanyParts = titleCompany.split(' ');
              let title = titleCompanyParts[0] + ' ' + titleCompanyParts[1];
              let company = titleCompanyParts.slice(2).join(' ');
              
              result.experience.push({
                title: title || 'Unknown Position',
                company: company || 'Unknown Company',
                duration: duration || 'Unknown Duration',
                description: ''
              });
            }
          }
        }
        break;
        
      case 'education':
        if (line && !line.includes('EDUCATION')) {
          if (line.includes('-')) {
            const parts = line.split('-');
            if (parts.length >= 2) {
              const degreeInstitution = parts[0].trim();
              const year = parts[1].trim();
              
              result.education.push({
                degree: degreeInstitution || 'Unknown Degree',
                institution: 'Unknown Institution',
                year: year || 'Unknown Year'
              });
            }
          }
        }
        break;
        
      case 'certifications':
        if (line && !line.includes('CERTIFICATIONS')) {
          if (line.includes('-')) {
            const parts = line.split('-');
            if (parts.length >= 2) {
              result.certifications.push(parts[0].trim());
            }
          }
        }
        break;
    }
  }
  
  return result;
}
