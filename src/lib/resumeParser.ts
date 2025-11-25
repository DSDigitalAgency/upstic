// Resume parser utility for extracting information from uploaded resumes
// Handles documents with images and icons by extracting only text content

import mammoth from 'mammoth';

export interface ParsedResume {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
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
    fieldOfStudy?: string;
  }>;
  certifications: string[];
}

export async function parseResume(file: File): Promise<ParsedResume> {
  const text = await extractTextFromFile(file);
  return extractResumeData(text);
}

async function extractTextFromFile(file: File): Promise<string> {
  try {
    // Check file type
    const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isDOCX = file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                   file.type === 'application/msword' ||
                   file.name.toLowerCase().endsWith('.docx') ||
                   file.name.toLowerCase().endsWith('.doc');
    
    if (isDOCX) {
      // Extract text from DOCX files using mammoth
      // Mammoth automatically ignores images and icons, extracting only text
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Extract raw text - this will ignore images, icons, and other non-text elements
      const result = await mammoth.extractRawText({ buffer });
      let text = result.value;
      
      // Clean up the text - remove excessive whitespace and normalize line breaks
      // For two-column layouts, mammoth may extract text in a mixed order
      // We'll preserve the structure but normalize it
      text = text
        .replace(/\r\n/g, '\n')  // Normalize line breaks
        .replace(/\r/g, '\n')     // Handle old Mac line breaks
        .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newline
        .replace(/[ \t]+/g, ' ')  // Replace multiple spaces/tabs with single space
        .trim();
      
      return text;
    } else if (isPDF) {
      // Extract text from PDF files using pdf-parse v1.1.1
      // This runs server-side in API routes
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      try {
        // Ensure test directory exists before importing (pdf-parse needs it)
        const fs = await import('fs/promises');
        const path = await import('path');
        const testDir = path.join(process.cwd(), 'test', 'data');
        const testFile = path.join(testDir, '05-versions-space.pdf');
        
        try {
          await fs.mkdir(testDir, { recursive: true });
          // Create empty placeholder file if it doesn't exist
          try {
            await fs.access(testFile);
          } catch {
            await fs.writeFile(testFile, '');
          }
        } catch (dirError) {
          // If we can't create the directory, log but continue
          console.warn('Could not create test directory for pdf-parse:', dirError);
        }
        
        // pdf-parse v1.1.1 is a CommonJS module
        // Use dynamic import - Next.js will handle CommonJS interop
        let pdfParse: any;
        
        try {
          // Use dynamic import - Next.js will handle CommonJS interop
          const pdfParseModule = await import('pdf-parse');
          
          // pdf-parse v1.1.1 exports as CommonJS, but Next.js wraps it
          // The function is typically available as default or as the module itself
          if (typeof pdfParseModule === 'function') {
            pdfParse = pdfParseModule;
          } else if (typeof pdfParseModule.default === 'function') {
            pdfParse = pdfParseModule.default;
          } else if (pdfParseModule.default && typeof pdfParseModule.default === 'object') {
            // Sometimes it's nested: { default: { default: function } }
            pdfParse = pdfParseModule.default.default || pdfParseModule.default;
  } else {
            // Try the module itself
            pdfParse = pdfParseModule;
          }
          
          // If still not a function, log for debugging
          if (typeof pdfParse !== 'function') {
            console.error('PDF parse module structure:', {
              moduleType: typeof pdfParseModule,
              hasDefault: 'default' in pdfParseModule,
              defaultType: typeof pdfParseModule.default,
              keys: Object.keys(pdfParseModule)
            });
            throw new Error('Could not find PDF parse function in module');
          }
        } catch (importError: any) {
          console.error('Error importing pdf-parse:', importError);
          // If it's the test file error, provide a more helpful message
          if (importError.code === 'ENOENT' && importError.path?.includes('test/data')) {
            throw new Error('PDF parser initialization error. Please ensure the test directory exists.');
          }
          throw new Error(`Failed to import pdf-parse: ${importError?.message || 'Unknown error'}`);
        }
        
        // Ensure we have a function
        if (typeof pdfParse !== 'function') {
          throw new Error('PDF parser is not a function. The module structure may have changed.');
        }
        
        const pdfData = await pdfParse(buffer);
        let text = pdfData.text || '';
        
        // Clean up the text - remove excessive whitespace and normalize line breaks
        // PDF extraction can produce inconsistent spacing
        text = text
          .replace(/\r\n/g, '\n')  // Normalize line breaks
          .replace(/\r/g, '\n')     // Handle old Mac line breaks
          .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newline
          .replace(/[ \t]+/g, ' ')  // Replace multiple spaces/tabs with single space
          .replace(/\f/g, '\n')     // Replace form feeds with newlines
          .trim();
        
        return text;
      } catch (error: any) {
        console.error('Error parsing PDF:', error);
        // Return a more helpful error message
        const errorMessage = error?.message || 'Unknown error';
        throw new Error(`Failed to parse PDF file: ${errorMessage}. Please ensure it is a valid PDF.`);
      }
    } else {
      // Try to read as plain text
      return await file.text();
    }
  } catch (error) {
    console.error('Error extracting text from file:', error);
    // Return empty string if extraction fails
    // The parser will handle empty text gracefully
    return '';
  }
}

export function extractResumeData(text: string): ParsedResume {
  if (!text || text.trim().length === 0) {
    return {
      skills: [],
      experience: [],
      education: [],
      certifications: []
    };
  }
  
  // Debug: Log first 1000 chars to see what we're working with (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('Extracted text preview (first 1000 chars):', text.substring(0, 1000));
  }
  
  // Clean and normalize text - preserve structure better
  // First, normalize line breaks and basic whitespace
  let cleanedText = text
    .replace(/\r\n/g, '\n')  // Normalize line breaks first
    .replace(/\r/g, '\n')
    .replace(/\f/g, '\n')    // Form feeds to newlines
    .replace(/\t/g, ' ')     // Tabs to spaces
    .trim();
  
  // Define phone regex patterns BEFORE using them in filter
  const phoneRegexStrict = /\+?\d{10,15}/; // For formats like +447350152400
  const phoneRegexUK = /\+44\d{10}/; // UK format: +44 followed by 10 digits
  const jobTitleRegex = /\b(volunteer|support|worker|assistant|personal|care|health|carer|nurse)\b/i;
  const jobDescriptionVerbRegex = /\b(Provided|Providing|Support|Supporting|Supported|Maintained|Maintaining|Recorded|Recording|Promoted|Promoting|Organized|Organising|Organizing|Encouraged|Encouraging|Offered|Offering|Used|Using|Accompanied|Accompanying|Boosting|Helping|Ensuring|Delivering|Coordinated|Coordinating|Built|Building)\b/i;
  const fallbackTitleKeywordRegex = /\b(Worker|Assistant|Carer|Caregiver|Coordinator|Manager|Volunteer|Nurse|Practitioner|Officer|Associate|Specialist|Supervisor|Lead)\b/i;
  const nameStopWords = new Set([
    'LANGUAGES',
    'SKILLS',
    'HOBBIES',
    'INTEREST',
    'INTERESTS',
    'SPECTRUM',
    'DISORDER',
    'AUTISM',
    'SAFEGUARDING',
    'ADULTS',
    'CHILDREN',
    'SUPPORTING',
    'SUPPORTED',
    'INCLUDING',
    'WITH',
    'AND',
    'SUMMARY',
    'PROFILE',
    'OBJECTIVE',
    'RESPONSIBILITY',
    'RESPONSIBILITIES',
    'DUTIES',
    'CERTIFICATIONS',
    'TRAINING'
  ]);
  
  // Split into lines first, then clean each line individually
  // This preserves the line structure which is important for parsing
  const lines = cleanedText
    .split('\n')
    .map(line => {
      // Clean each line: be more selective about what we remove
      // Keep letters, numbers, common punctuation, whitespace, and + for phone numbers
      let cleaned = line
        .replace(/[^\w\s@.,()\-:–—/#&*+]/g, ' ') // Keep + for phone numbers like +447350152400
        .replace(/\s+/g, ' ') // Normalize multiple spaces to single space
        .trim();
      return cleaned;
    })
    .filter(line => {
      // Don't filter out phone numbers (lines that are just phone numbers)
      const trimmedLine = line.trim();
      if (phoneRegexStrict.test(trimmedLine) || phoneRegexUK.test(trimmedLine)) {
        return true; // Keep phone number lines
      }
      return trimmedLine.length > 0 && 
            !trimmedLine.match(/^[•\-\*]+$/) && // Not just bullets
            !trimmedLine.match(/^[0-9\.]+$/) && // Not just numbers
            trimmedLine.length > 1; // At least 2 characters
    });
  
  // Debug: Log first 20 lines to see structure (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.log('First 20 lines after cleaning:', lines.slice(0, 20));
  }
  
  const result: ParsedResume = {
    skills: [],
    experience: [],
    education: [],
    certifications: []
  };
  
  let currentSection = '';
  let experienceBuffer: string[] = [];
  let educationBuffer: string[] = [];
  
  // Email regex pattern
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  
  // Phone regex patterns (various formats including international)
  // Note: phoneRegexStrict and phoneRegexUK are already defined above in the filter
  const phoneRegex = /\+?\d{1,4}[\s\-]?\(?\d{2,4}\)?[\s\-]?\d{2,4}[\s\-]?\d{2,4}[\s\-]?\d{2,4}/;
  
  // Extract all emails and phones first (they might appear anywhere)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Extract email (can appear anywhere)
    const emailMatch = line.match(emailRegex);
    if (emailMatch && !result.email) {
      result.email = emailMatch[0];
      console.log('Extracted email:', result.email, 'from line:', i);
    }
    
    // Extract phone (can appear anywhere, handle international formats)
    if (!result.phone) {
      // Check if the entire line is a phone number (common in resumes)
      const trimmedLine = line.trim();
      
      // Try UK format first (+44XXXXXXXXXX)
      let phoneMatch = trimmedLine.match(phoneRegexUK);
      if (phoneMatch) {
        result.phone = phoneMatch[0];
        console.log('Extracted phone (UK format):', result.phone, 'from line:', i);
        continue;
      }
      
      // Check if line is mostly just a phone number
      if (phoneRegexStrict.test(trimmedLine) && trimmedLine.length <= 20) {
        const match = trimmedLine.match(phoneRegexStrict);
        if (match) {
          result.phone = match[0];
          console.log('Extracted phone (line match):', result.phone, 'from line:', i);
          continue;
        }
      }
      
      // Try strict format within the line (like +447350152400)
      phoneMatch = line.match(phoneRegexStrict);
      if (phoneMatch) {
        result.phone = phoneMatch[0].trim();
        console.log('Extracted phone (strict):', result.phone, 'from line:', i);
        continue;
      }
      
      // Fallback to flexible format
      phoneMatch = line.match(phoneRegex);
      if (phoneMatch) {
        result.phone = phoneMatch[0].trim();
        console.log('Extracted phone (flexible):', result.phone, 'from line:', i);
      }
    }
  }
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const upperLine = line.toUpperCase();
    
    // Extract name - search more broadly
    // Names can appear at the top, after CONTACT, or before PROFESSIONAL SUMMARY
    // Look for lines that are likely names (2-5 words, proper capitalization)
    // IMPORTANT: Names usually appear BEFORE "PROFESSIONAL SUMMARY" or "CONTACT"
    // From the PDF structure, name appears at the very top before any sections
    if (i < 50 && !result.firstName && line.length > 0) {
      let shouldAttemptName = true;

      if (upperLine.includes('PROFESSIONAL') && upperLine.includes('SUMMARY')) {
        shouldAttemptName = false;
      }

      if (jobTitleRegex.test(line) ||
          line.includes('Volunteer Support') || line.includes('Support Worker')) {
        shouldAttemptName = false;
      }

      if (shouldAttemptName) {
        const nameParts = line.split(/\s+/).filter(part => part.length > 0);
        if (nameParts.length >= 2 && nameParts.length <= 5 && 
            !emailRegex.test(line) && !phoneRegexStrict.test(line) && !phoneRegexUK.test(line) &&
            !line.includes('@') && !line.match(/^\d/) &&
            !upperLine.match(/^(CONTACT|SKILLS|LANGUAGES|EXPERIENCE|EDUCATION|CERTIFICATIONS|PROFESSIONAL|SUMMARY|WORK|HISTORY|REFERENCES|HOBBIES|PERSONAL|ADDRESS|PHONE|EMAIL|NIGERIA|PARKLAND|TELFORD|SHROPSHIRE|AVENUE|STREET|ROAD|LANE|HOSPITAL|HEALTH|CARE|ASSISTANT|GENERAL|ISOLO|COMPASSIONATE|DEDICATED|VOLUNTEER|SUPPORT|WORKER)\b/) &&
            !line.match(/^\d{1,2}\/\d{4}/) && // Not a date
            !line.includes('parkland') && !line.includes('Telford') && !line.includes('Shropshire') && // Not address
            !line.includes('avenue') && !line.includes('TF4') && // Not address parts
            !line.includes('hospital') && !line.includes('Health Care') && // Not company names
            !line.includes('Compassionate') && !line.includes('dedicated') && // Not summary text
            !line.match(/^[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}$/i)) { // Not a postcode
          const hasStopWord = nameParts.some(part => nameStopWords.has(part.toUpperCase()));
          if (!hasStopWord) {
            const isLikelyName = nameParts.every(part => {
              const partTrimmed = part.trim();
              return /^[A-Z][a-z]+$/.test(partTrimmed) ||  
                     /^[A-Z]+$/.test(partTrimmed) ||        
                     /^[A-Z][a-z]+[A-Z][a-z]*$/.test(partTrimmed) ||
                     /^[A-Z][a-z]+-[A-Z][a-z]+$/.test(partTrimmed);
            });
            if (isLikelyName) {
              result.firstName = nameParts[0];
              result.lastName = nameParts.slice(1).join(' ');
              console.log('Extracted name:', result.firstName, result.lastName, 'from line:', line, 'at index:', i);
              continue;
            }
          }
        }
      }
    }
    
    // Also check for name patterns that might be missed (e.g., after # or ** markers)
    if (i < 20 && !result.firstName && line.length > 0) {
      // Remove markdown-style markers (#, **, etc.) and check again
      const cleanedLine = line.replace(/^[#\*\s]+/, '').replace(/[\*\s]+$/, '').trim();
      if (cleanedLine !== line && cleanedLine.length > 0) {
        const nameParts = cleanedLine.split(/\s+/).filter(part => part.length > 0);
        if (nameParts.length >= 2 && nameParts.length <= 5 && 
            !emailRegex.test(cleanedLine) && !phoneRegex.test(cleanedLine) &&
            !cleanedLine.includes('@') && !cleanedLine.match(/^\d/) &&
            !cleanedLine.toUpperCase().match(/^(CONTACT|SKILLS|LANGUAGES|EXPERIENCE|EDUCATION|CERTIFICATIONS|PROFESSIONAL|SUMMARY|WORK|HISTORY|REFERENCES|HOBBIES|PERSONAL|ADDRESS|PHONE|EMAIL)\b/)) {
          const isLikelyName = nameParts.every(part => {
            const partTrimmed = part.trim();
            return /^[A-Z][a-z]+$/.test(partTrimmed) ||  
                   /^[A-Z]+$/.test(partTrimmed) ||        
                   /^[A-Z][a-z]+[A-Z][a-z]*$/.test(partTrimmed) ||
                   /^[A-Z][a-z]+-[A-Z][a-z]+$/.test(partTrimmed);
          });
          if (isLikelyName && nameParts.length >= 2 && nameParts.length <= 5) {
        result.firstName = nameParts[0];
        result.lastName = nameParts.slice(1).join(' ');
            console.log('Extracted name (from cleaned line):', result.firstName, result.lastName, 'from line:', line);
            continue;
          }
        }
      }
    }
    
    // Extract address (lines with commas and common address keywords, handle longer addresses)
    // Also check if current line + next line form an address
    if (!result.address && (line.includes(',') || line.includes('Street') || line.includes('Avenue') || 
        line.includes('Road') || line.includes('Lane') || line.includes('parkland') ||
        line.includes('Telford') || line.includes('Shropshire') || line.includes('Northampton') ||
        line.includes('City') || line.includes('State') || line.includes('Postcode') || 
        line.includes('Zip') || line.includes('TF') || line.match(/\b[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}\b/i))) {
      // Handle longer addresses (up to 200 chars) and remove icon prefixes
      let addressLine = line.replace(/^[^\w]*/, '').trim(); // Remove leading non-word chars (icons)
      
      // Check if previous line might be part of the address (common in PDFs)
      if (i > 0 && addressLine.match(/\b[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}\b/i)) {
        // Current line has postcode, check if previous line is street
        const prevLine = lines[i - 1].trim();
        if (prevLine.includes('parkland') || prevLine.includes('avenue') || 
            prevLine.includes('street') || prevLine.includes('road') ||
            (prevLine.includes(',') && prevLine.length < 50)) {
          addressLine = `${prevLine} ${addressLine}`.trim();
        }
    }
    
      // Check if next line continues the address (common in PDFs where address is split)
      if (i + 1 < lines.length) {
        const nextLine = lines[i + 1].trim();
        if (nextLine.match(/\b[A-Z]{1,2}\d{1,2}\s?\d[A-Z]{2}\b/i) || // UK postcode
            nextLine.includes('Telford') || nextLine.includes('Shropshire') ||
            (nextLine.includes(',') && addressLine.includes(',') && nextLine.length < 50) ||
            (nextLine.includes('TF') && addressLine.includes('TF'))) {
          addressLine = `${addressLine} ${nextLine}`.trim();
        }
      }
      
      if (addressLine.length > 10 && addressLine.length < 200) {
        result.address = addressLine;
        console.log('Extracted address:', result.address, 'from lines:', i);
      }
    }
    
    // Detect sections (more flexible matching)
    // IMPORTANT: Check for major sections first to properly end previous sections
    if (upperLine.match(/^(EXPERIENCE|WORK\s+EXPERIENCE|WORK\s+HISTORY|EMPLOYMENT|PROFESSIONAL\s+EXPERIENCE|CAREER)/)) {
      currentSection = 'experience';
      experienceBuffer = [];
      continue;
    }
    
    if (upperLine.match(/^(EDUCATION|QUALIFICATIONS?|ACADEMIC)/)) {
      currentSection = 'education';
      educationBuffer = [];
      continue;
    }
    
    if (upperLine.match(/^(PROFESSIONAL\s+SUMMARY|SUMMARY|PROFILE|OBJECTIVE)/)) {
      currentSection = ''; // End any previous section
      continue;
    }
    
    if (upperLine.match(/^(CERTIFICATIONS?|LICENSES?|CREDENTIALS?|PROFESSIONAL\s+CERTIFICATIONS?)/)) {
      currentSection = 'certifications';
      continue;
    }
    
    // Don't end certifications section on "HOBBIES AND INTEREST" header - 
    // certifications can come after this header in some resume formats
    // We'll handle hobbies filtering inside the certifications case
    
    if (upperLine.match(/^(REFERENCES|REFERENCE)/)) {
      currentSection = ''; // End any previous section
      continue;
    }
    
    if (upperLine.match(/^(SKILLS?|COMPETENCIES?|TECHNICAL\s+SKILLS?)/)) {
      currentSection = 'skills';
      continue;
    }
    
    // Parse section content
    switch (currentSection) {
      case 'skills':
        // Stop skills section if we hit major sections
        if (upperLine.match(/^(PROFESSIONAL\s+SUMMARY|SUMMARY|WORK\s+HISTORY|EXPERIENCE|EDUCATION|CERTIFICATIONS?|REFERENCES|LANGUAGES)/)) {
          currentSection = '';
          continue;
        }
        
        if (line && !upperLine.match(/^(SKILLS?|COMPETENCIES?|LANGUAGES)/)) {
          // Filter out long descriptive text (likely from professional summary)
          if (line.length > 100) {
            continue; // Skip long paragraphs
          }
          
          // Split by common delimiters, but also handle line-by-line skills
          // Some resumes list one skill per line
          if (line.includes(',') || line.includes(';') || line.includes('|') || line.includes('•')) {
            // Multiple skills on one line
            const skills = line
              .split(/[,;|•\-\n]/)
              .map(skill => skill.trim())
              .filter(skill => {
                return skill.length > 0 && 
                       skill.length < 50 && 
                       !skill.match(/^[•\-\*]+$/) &&
                       !skill.match(/^(LANGUAGES|PROFESSIONAL|SUMMARY|WORK|HISTORY|EXPERIENCE|EDUCATION|CERTIFICATIONS?|REFERENCES)$/i);
              });
          result.skills.push(...skills);
          } else {
            // Single skill per line (common in formatted resumes)
            const skill = line.trim();
            // Filter out section headers and long descriptive text
            if (skill.length > 0 && 
                skill.length < 50 && 
                !skill.match(/^[•\-\*]+$/) &&
                !upperLine.match(/^(LANGUAGES|PROFESSIONAL|SUMMARY|WORK|HISTORY|EXPERIENCE|EDUCATION|CERTIFICATIONS?|REFERENCES)$/)) {
              result.skills.push(skill);
            }
          }
        }
        break;
        
      case 'experience':
        if (line && !upperLine.match(/^(EXPERIENCE|WORK|EMPLOYMENT|HISTORY)/)) {
          experienceBuffer.push(line);
          
          // Fix: Handle cases where title and date are concatenated (e.g., "Support Worker01/2025")
          // Add space before date patterns
          let processedLine = line.replace(/([a-zA-Z])(\d{1,2}\/\d{4})/g, '$1 $2');
          
          // Try to parse experience entries
          // Look for patterns like:
          // "Job Title - Company - Location (Date)"
          // "Job Title at Company - Location (Date)"
          // "Job Title DateRange" (concatenated)
          // "Job Title" followed by "Company - Location" on next line with dates
          
          // Pattern 0: "Title DateRange" (e.g., "Support Worker 01/2025 - Current")
          const titleDateMatch = processedLine.match(/^(.+?)\s+(\d{1,2}\/\d{4}\s*[-–—]\s*(?:Current|Present|\d{1,2}\/\d{4}))/i);
          
          // Pattern 1: "Title - Company - Location (Date)"
          const titleCompanyLocationMatch = processedLine.match(/^(.+?)\s*[-–—]\s*(.+?)\s*[-–—]\s*(.+?)\s*\((.+?)\)/);
          // Pattern 2: "Title - Company (Date)"
          const titleCompanyMatch = processedLine.match(/^(.+?)\s*[-–—]\s*(.+?)\s*\((.+?)\)/);
          // Pattern 3: "Title at Company - Location (Date)"
          const titleAtMatch = processedLine.match(/^(.+?)\s+at\s+(.+?)\s*[-–—]\s*(.+?)\s*\((.+?)\)/);
          // Pattern 4: "Title at Company (Date)"
          const titleAtSimpleMatch = processedLine.match(/^(.+?)\s+at\s+(.+?)\s*\((.+?)\)/);
          
          // Handle title with date on same line, company on next line
          if (titleDateMatch && i + 1 < lines.length) {
            const nextLine = lines[i + 1];
            const title = titleDateMatch[1].trim();
            const duration = titleDateMatch[2].trim();
              
            // Check if next line is company (contains dash, location keywords, or company indicators)
            if (nextLine.includes('-') || nextLine.includes('at') || 
                nextLine.match(/(Health Care|Hospital|Clinic|Agency|Care|Ltd|Inc|General)/i)) {
              // Split company and location if dash present
              const companyParts = nextLine.split(/\s*[-–—]\s*/);
              const company = companyParts[0].trim();
              const location = companyParts.length > 1 ? companyParts.slice(1).join(' - ').trim() : '';
              
              result.experience.push({
                title: title || 'Unknown Position',
                company: location ? `${company} - ${location}` : company || 'Unknown Company',
                duration: duration || 'Unknown Duration',
                description: ''
              });
              console.log('Extracted experience (title+date, company on next line):', title, company, duration);
              // Skip next line since we've processed it
              i++;
              continue;
            }
          }
          
          // Also handle: "Title" on one line, "DateRange" on same or next, "Company - Location" on next
          if (titleDateMatch) {
            const title = titleDateMatch[1].trim();
            const duration = titleDateMatch[2].trim();
            // If we have title and date but no company yet, check next line
            if (i + 1 < lines.length) {
              const nextLine = lines[i + 1];
              if (nextLine && !nextLine.match(/^\d{1,2}\/\d{4}/) && // Not another date
                  (nextLine.includes('-') || nextLine.match(/(Health Care|Hospital|Clinic|Agency)/i))) {
                const companyParts = nextLine.split(/\s*[-–—]\s*/);
                const company = companyParts[0].trim();
                const location = companyParts.length > 1 ? companyParts.slice(1).join(' - ').trim() : '';
              
              result.experience.push({
                title: title || 'Unknown Position',
                  company: location ? `${company} - ${location}` : company || 'Unknown Company',
                duration: duration || 'Unknown Duration',
                description: ''
              });
                console.log('Extracted experience (title+date pattern):', title, company, duration);
                i++; // Skip next line
                continue;
              }
            }
          }
          
          if (titleCompanyLocationMatch) {
            result.experience.push({
              title: titleCompanyLocationMatch[1].trim() || 'Unknown Position',
              company: `${titleCompanyLocationMatch[2].trim()} - ${titleCompanyLocationMatch[3].trim()}` || 'Unknown Company',
              duration: titleCompanyLocationMatch[4].trim() || 'Unknown Duration',
              description: ''
            });
          } else if (titleAtMatch) {
            result.experience.push({
              title: titleAtMatch[1].trim() || 'Unknown Position',
              company: `${titleAtMatch[2].trim()} - ${titleAtMatch[3].trim()}` || 'Unknown Company',
              duration: titleAtMatch[4].trim() || 'Unknown Duration',
              description: ''
            });
          } else if (titleCompanyMatch) {
            result.experience.push({
              title: titleCompanyMatch[1].trim() || 'Unknown Position',
              company: titleCompanyMatch[2].trim() || 'Unknown Company',
              duration: titleCompanyMatch[3].trim() || 'Unknown Duration',
              description: ''
            });
          } else if (titleAtSimpleMatch) {
            result.experience.push({
              title: titleAtSimpleMatch[1].trim() || 'Unknown Position',
              company: titleAtSimpleMatch[2].trim() || 'Unknown Company',
              duration: titleAtSimpleMatch[3].trim() || 'Unknown Duration',
              description: ''
            });
          } else if (line.includes('(') && line.includes(')')) {
            // Try to extract date range from parentheses (format: "01/2025 - Current" or "01/2025 - 12/2025")
            const dateMatch = line.match(/\(([^)]+)\)/);
            if (dateMatch) {
              const dateStr = dateMatch[1].trim();
              // Check if it looks like a date range
              if (dateStr.match(/\d{1,2}\/\d{4}/) || dateStr.match(/Current|Present/i)) {
                const parts = line.replace(/\([^)]+\)/, '').trim().split(/\s*[-–—]\s*/);
                if (parts.length >= 1) {
                  const titleCompany = parts[0].trim();
                  const titleCompanyParts = titleCompany.split(/\s+(at|@)\s+/i);
                  
                  result.experience.push({
                    title: titleCompanyParts[0] || titleCompany || 'Unknown Position',
                    company: titleCompanyParts[1] || (parts[1] || 'Unknown Company'),
                    duration: dateStr || 'Unknown Duration',
                    description: ''
                  });
                }
              }
            }
          } else if (line.match(/^\d{1,2}\/\d{4}\s*[-–—]\s*(Current|Present|\d{1,2}\/\d{4})/i)) {
            // Date range on its own line - might be continuation from previous line
            if (result.experience.length > 0 && !result.experience[result.experience.length - 1].duration) {
              const dateMatch = line.match(/(\d{1,2}\/\d{4}\s*[-–—]\s*(?:Current|Present|\d{1,2}\/\d{4}))/i);
              if (dateMatch) {
                result.experience[result.experience.length - 1].duration = dateMatch[1].trim();
              }
            }
          } else {
            const cleanedLine = line.trim();
            const isDescription = jobDescriptionVerbRegex.test(cleanedLine) || /[.!]$/.test(cleanedLine);
            const mightBeTitle = cleanedLine.length < 60 &&
                                 !cleanedLine.includes('-') &&
                                 !cleanedLine.includes('(') &&
                                 !cleanedLine.match(/^\d/) &&
                                 fallbackTitleKeywordRegex.test(cleanedLine);
            const mightBeCompany = cleanedLine.includes('-') || cleanedLine.match(/(Health Care|Hospital|Clinic|Agency|Care|Ltd|Inc)/i);
            
            if (mightBeCompany && result.experience.length > 0) {
              const lastExp = result.experience[result.experience.length - 1];
              if (lastExp.title && lastExp.title !== 'Unknown Position' && 
                  (lastExp.company === 'Unknown Company' || !lastExp.company)) {
                lastExp.company = cleanedLine;
              }
            } else if (mightBeTitle && (result.experience.length === 0 || 
                       result.experience[result.experience.length - 1].company !== 'Unknown Company')) {
              result.experience.push({
                title: cleanedLine,
                company: 'Unknown Company',
                duration: 'Unknown Duration',
                description: ''
              });
            } else if (result.experience.length > 0 && (isDescription || cleanedLine.length > 0)) {
              const lastExp = result.experience[result.experience.length - 1];
              const descLine = cleanedLine.replace(/^[•\-\s]+/, '');
              if (descLine.length > 0) {
                lastExp.description = lastExp.description
                  ? `${lastExp.description}\n${descLine}`
                  : descLine;
              }
            }
          }
        }
        break;
        
      case 'education':
        if (line && !upperLine.match(/^(EDUCATION|QUALIFICATIONS?|ACADEMIC)/)) {
          educationBuffer.push(line);
          
          // Pattern: "Degree: Field, DateRange" with institution in next line
          const colonPattern = line.match(/^(.+?):\s*(.+?),\s*(\d{1,2}\/\d{4}(?:\s*[-–—]\s*(?:\d{1,2}\/\d{4}|Current|Present))?)/);
          if (colonPattern) {
            const degreeBase = colonPattern[1].trim();
            const field = colonPattern[2].trim();
            const year = colonPattern[3].trim();
            let institution = '';
            if (i + 1 < lines.length) {
              const nextLine = lines[i + 1].trim();
              if (nextLine && 
                  !nextLine.match(/^\d{1,2}\/\d{4}/) &&
                  !nextLine.match(/^(SKILLS|LANGUAGES|WORK|EXPERIENCE|CERTIFICATIONS?|REFERENCES|PROFILE|SUMMARY|HOBBIES|INTERESTS)/i)) {
                institution = nextLine;
                i++;
              }
            }
            result.education.push({
              degree: degreeBase,
              institution: institution || '',
              year: year || 'Unknown Year',
              fieldOfStudy: field || undefined
            });
            continue;
          }
          
          // Try to parse education entries
          // Look for patterns like: "Degree - Institution (Year)" or "Degree, Institution, Year"
          const degreeMatch = line.match(/^(.+?)\s*[-–—]\s*(.+?)\s*\((.+?)\)/);
          const degreeCommaMatch = line.match(/^(.+?),\s*(.+?),\s*(.+?)$/);
          
          if (degreeMatch) {
            result.education.push({
              degree: degreeMatch[1].trim() || 'Unknown Degree',
              institution: degreeMatch[2].trim() || 'Unknown Institution',
              year: degreeMatch[3].trim() || 'Unknown Year'
            });
          } else if (degreeCommaMatch) {
            result.education.push({
              degree: degreeCommaMatch[1].trim() || 'Unknown Degree',
              institution: degreeCommaMatch[2].trim() || 'Unknown Institution',
              year: degreeCommaMatch[3].trim() || 'Unknown Year'
            });
          } else if (line.includes('(') && line.includes(')')) {
            // Try to extract year from parentheses
            const yearMatch = line.match(/\(([^)]+)\)/);
            if (yearMatch) {
              const degreeInstitution = line.replace(/\([^)]+\)/, '').trim();
              const parts = degreeInstitution.split(/\s*[-–—]\s*/);
              
              result.education.push({
                degree: parts[0] || degreeInstitution || 'Unknown Degree',
                institution: parts[1] || 'Unknown Institution',
                year: yearMatch[1] || 'Unknown Year'
              });
            }
          }
        }
        break;
        
      case 'certifications':
        // Stop certifications section if we hit references or languages
        if (upperLine.match(/^(REFERENCES|REFERENCE|LANGUAGES)$/)) {
          currentSection = '';
          continue;
        }
        
        // Skip "HOBBIES AND INTEREST" header - it's just a subsection header, certifications come after it
        if (upperLine.match(/^(HOBBIES|INTERESTS?|HOBBIES\s+AND\s+INTERESTS?)$/)) {
          continue; // Skip the header but continue processing certifications
        }
        
        if (line && !upperLine.match(/^(CERTIFICATIONS?|LICENSES?|CREDENTIALS?)/)) {
          const cleanedLine = line.trim();
          
          // Skip empty lines and bullet-only lines
          if (!cleanedLine || cleanedLine.match(/^[•\-\*]+$/)) {
            continue;
          }
          
          // Filter out hobbies (common words that appear in hobbies sections)
          // These come AFTER certifications in this resume structure
          const hobbyKeywords = /^(Research|Reading|Music|Sport|Making\s+new\s+friends|Travel|Cooking|Photography|Gaming|Movies|Books|Hiking|Swimming|Dancing|Singing|Art|Painting|Writing|Gardening|Fishing|Cycling|Running|Yoga|Meditation|Volunteering|Community\s+service)$/i;
          if (hobbyKeywords.test(cleanedLine)) {
            // Once we hit hobbies, stop processing certifications
            continue;
          }
          
          // Remove date/year information if present, but keep the main cert name
          let certLine = cleanedLine.replace(/\([^)]*\)/g, '').trim();
          
          // Handle certifications with dates like "Care Certificate, 2024-01-01, Completed Online & Practical"
          if (certLine.includes(',')) {
            const parts = certLine.split(',');
            certLine = parts[0].trim(); // Take first part before comma
          }
          
          // Filter out section headers and empty lines, but be more lenient
          if (certLine.length > 2 && certLine.length < 100) {
            // Split by dash to get main cert name
            const parts = certLine.split(/\s*[-–—]\s*/);
            const certName = parts[0].trim();
            
            // Only add if it looks like a certification name (not a hobby or section header)
            // Be more lenient - accept anything that looks like a cert name
            if (certName.length > 2 && 
                !certName.match(/^(Research|Reading|Music|Sport|Making|new|friends|HOBBIES|INTERESTS?|REFERENCES|LANGUAGES)$/i) &&
                !certName.match(/^[•\-\*]+$/) &&
                (certName.includes('Certificate') || 
                 certName.includes('Diploma') || 
                 certName.includes('Support') ||
                 certName.includes('Handling') ||
                 certName.includes('Prevention') ||
                 certName.includes('Safety') ||
                 certName.includes('Awareness') ||
                 certName.includes('Rights'))) {
              result.certifications.push(certName);
            }
          }
        }
        break;
    }
  }
  
  // Extract skills from work experience descriptions if no skills section was found
  if (result.skills.length === 0 && result.experience.length > 0) {
    const skillKeywords = [
      'Person-centered care planning',
      'Dementia & Alzheimer',
      'Manual handling',
      'mobility assistance',
      'Medication prompting',
      'Safeguarding',
      'Infection prevention',
      'communication',
      'Empathy',
      'Patience',
      'Active listening',
      'Multidisciplinary team',
      'record-keeping',
      'MAPA'
    ];
    
    // Extract skills from experience descriptions
    for (const exp of result.experience) {
      if (exp.description) {
        const descLines = exp.description.split('\n');
        for (let idx = 0; idx < descLines.length; idx++) {
          const line = descLines[idx];
          const cleaned = line.trim().replace(/^[•\-\s]+/, '');
          
          // Skip if it's clearly a name (matches firstName or lastName)
          if (result.firstName && cleaned.includes(result.firstName)) continue;
          if (result.lastName && cleaned.includes(result.lastName)) continue;
          
          // Handle multi-line skills (e.g., "Medication prompting and\ndocumentation")
          let fullSkill = cleaned;
          if (idx + 1 < descLines.length && cleaned.endsWith('and')) {
            const nextLine = descLines[idx + 1].trim().replace(/^[•\-\s]+/, '');
            if (nextLine.length > 0 && nextLine.length < 30 && !nextLine.includes('.')) {
              fullSkill = `${cleaned} ${nextLine}`;
              idx++; // Skip next line since we've combined it
            }
          }
          
          // Look for skill-like phrases (short, capitalized, or common skill terms)
          if (fullSkill.length > 5 && fullSkill.length < 60 && 
              !fullSkill.includes('.') && 
              !fullSkill.match(/^(Supported|Offered|Used|Encouraged|Organized|Accompanied|Promoted|Built|This includes|English:)/i)) {
            // Skip if it's clearly a name (matches firstName or lastName)
            if (result.firstName && fullSkill.includes(result.firstName)) continue;
            if (result.lastName) {
              const lastNameParts = result.lastName.split(' ');
              if (lastNameParts.some(part => fullSkill.includes(part))) continue;
            }
            // Skip if it's just a name pattern (2-3 capitalized words that look like a name)
            // But allow if it contains skill keywords
            if (/^[A-Z][a-z]+(\s+[A-Z][a-z]+){1,2}$/.test(fullSkill) && 
                !fullSkill.match(/\b(care|support|handling|management|planning|assistance|prevention|control|communication|listening|collaboration|Alzheimer|Dementia|Safeguarding|Infection|Medication|Empathy|Patience|Active|listening|team)\b/i)) {
              continue; // Looks like a name, not a skill
            }
            
            // Check if it matches known skill patterns
            const isSkill = skillKeywords.some(keyword => fullSkill.includes(keyword)) ||
                          /^[A-Z][a-z]+(\s+[A-Z][a-z]+)*(\s+&(\s+[A-Z][a-z]+)+)?$/.test(fullSkill) || // Title case phrases
                          fullSkill.match(/\b(care|support|handling|management|planning|assistance|prevention|control|communication|listening|collaboration)\b/i);
            if (isSkill && !result.skills.includes(fullSkill)) {
              result.skills.push(fullSkill);
            }
          }
        }
      }
    }
  }
  
  // Clean up results - remove duplicates and empty entries
  result.skills = [...new Set(result.skills.filter(skill => skill.length > 0 && skill.length < 100))];
  result.certifications = [...new Set(result.certifications.filter(cert => cert.length > 0 && cert.length < 100))];
  result.experience = result.experience.filter(exp => exp.title && exp.title !== 'Unknown Position');
  result.education = result.education.filter(edu => edu.degree && edu.degree !== 'Unknown Degree');
  
  // Helper to decide if line looks like a standalone name fragment
  const looksLikeNameFragment = (text: string) => {
    if (!text) return false;
    if (text.length > 60) return false;
    const hasDigits = /\d/.test(text);
    if (hasDigits) return false;
    if (text.includes('@') || text.includes('.com')) return false;
    if (text.includes(',')) return false;
    if (jobTitleRegex.test(text)) return false;
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length === 0 || words.length > 3) return false;
    if (words.some(word => nameStopWords.has(word.toUpperCase()))) return false;
    return words.every(word => /^[A-Z][a-z'’-]{1,}$/.test(word));
  };

  // Final attempt: if name not found, search broader section of text
  if (!result.firstName) {
    const maxSearchWindow = Math.min(lines.length, 400);
    const searchLines = lines.slice(0, maxSearchWindow);

    // Pattern for 2-4 word names: First Middle? Last
    const namePatterns = [
      /\b([A-Z][a-z]{3,})\s+([A-Z][a-z]{2,})\s+([A-Z][a-z]{2,})\b/g, // 3 words: "Aduragbemi Samson Shodeinde"
      /\b([A-Z][a-z]{3,})\s+([A-Z][a-z]{2,})\b/g, // 2 words: "John Smith"
    ];
    
    const candidates: Array<{first: string, last: string, lineIndex: number, score: number}> = [];
    
    for (let idx = 0; idx < searchLines.length; idx++) {
      const line = searchLines[idx];
      const upperLine = line.toUpperCase();
      if (!line) continue;
      
      // Skip if it's clearly not a name line
      // CRITICAL: Exclude "PROFESSIONAL SUMMARY" - it's a section header, not a name
      // Also exclude job titles like "Volunteer Support Worker"
      const isJobTitle = jobTitleRegex.test(line) ||
                        line.includes('Worker') || line.includes('Assistant') ||
                        line.includes('Volunteer Support');
      
      if ((upperLine.includes('PROFESSIONAL') && upperLine.includes('SUMMARY')) ||
          isJobTitle ||
          upperLine.match(/^(CONTACT|SKILLS|LANGUAGES|EXPERIENCE|EDUCATION|CERTIFICATIONS|PROFESSIONAL|SUMMARY|WORK|HISTORY|REFERENCES|HOBBIES|PERSONAL|ADDRESS|PHONE|EMAIL|NIGERIA|TELFORD|SHROPSHIRE|PARKLAND|AVENUE|STREET|ROAD|LANE)/) ||
          line.includes('@') || phoneRegexStrict.test(line) || phoneRegexUK.test(line) ||
          line.match(/^\d/) || line.includes('parkland') || line.includes('Telford')) {
        continue;
      }
      
      const nextLine = searchLines[idx + 1] || '';
      const canAppendNext = looksLikeNameFragment(nextLine);

      // Try 3-word pattern first (more specific)
      let match;
      const pattern3 = namePatterns[0];
      while ((match = pattern3.exec(line)) !== null) {
        const first = match[1];
        const middle = match[2];
        const last = match[3];
        
        // Filter out false positives - exclude company names, section headers, etc.
        const upperFirst = first.toUpperCase();
        const upperMiddle = middle.toUpperCase();
        const upperLast = last.toUpperCase();
        
        // Exclude if any part matches common false positives (job titles, section headers, etc.)
        const falsePositives = /^(CONTACT|SKILLS|LANGUAGES|EXPERIENCE|EDUCATION|CERTIFICATIONS|PROFESSIONAL|SUMMARY|WORK|HISTORY|REFERENCES|HOBBIES|PERSONAL|ADDRESS|PHONE|EMAIL|NIGERIA|TELFORD|SHROPSHIRE|PARKLAND|AVENUE|STREET|ROAD|LANE|CURRENT|PRESENT|COMPASSIONATE|DEDICATED|HEALTH|CARE|ASSISTANT|HOSPITAL|GENERAL|ISOLO|AVERY|NORTHAMPTON|NORTHAMPTONSHIRE|LAGOS|VOLUNTEER|SUPPORT|WORKER|PERSONAL|CARE|ASSISTANT)$/;
        
        // Also exclude if it's clearly a job title pattern
        const isJobTitle = jobTitleRegex.test(line) ||
                          line.includes('Worker') || line.includes('Assistant') ||
                          line.includes('Volunteer Support');
        
        if (!falsePositives.test(upperFirst) &&
            !falsePositives.test(upperMiddle) &&
            !falsePositives.test(upperLast) &&
            !nameStopWords.has(upperFirst) &&
            !nameStopWords.has(upperMiddle) &&
            !nameStopWords.has(upperLast) &&
            !isJobTitle &&
            !line.includes('hospital') &&
            !line.includes('Health Care') &&
            !line.includes('Avery') &&
            !line.includes('Isolo')) {
          let finalLast = `${middle} ${last}`;
          if (canAppendNext) {
            finalLast = `${finalLast} ${nextLine.trim()}`;
          }
          const baseScore = idx < 30 ? 20 : (idx < 80 ? 12 : (idx < 150 ? 8 : 4));
          const score = baseScore + (canAppendNext ? 10 : 0);
          candidates.push({
            first,
            last: finalLast,
            lineIndex: idx,
            score
          });
        }
      }
      
      // Try 2-word pattern
      const pattern2 = namePatterns[1];
      pattern2.lastIndex = 0; // Reset regex
      while ((match = pattern2.exec(line)) !== null) {
        const first = match[1];
        const last = match[2];
        
        // Filter out false positives - exclude company names, section headers, etc.
        const upperFirst = first.toUpperCase();
        const upperLast = last.toUpperCase();
        
        // Exclude if any part matches common false positives (job titles, section headers, etc.)
        const falsePositives = /^(CONTACT|SKILLS|LANGUAGES|EXPERIENCE|EDUCATION|CERTIFICATIONS|PROFESSIONAL|SUMMARY|WORK|HISTORY|REFERENCES|HOBBIES|PERSONAL|ADDRESS|PHONE|EMAIL|NIGERIA|TELFORD|SHROPSHIRE|PARKLAND|AVENUE|STREET|ROAD|LANE|CURRENT|PRESENT|COMPASSIONATE|DEDICATED|HEALTH|CARE|ASSISTANT|HOSPITAL|GENERAL|ISOLO|AVERY|NORTHAMPTON|NORTHAMPTONSHIRE|LAGOS|VOLUNTEER|SUPPORT|WORKER|PERSONAL|CARE|ASSISTANT)$/;
        
        // Also exclude if it's clearly a job title pattern
        const isJobTitle = jobTitleRegex.test(line) ||
                          line.includes('Worker') || line.includes('Assistant') ||
                          line.includes('Volunteer Support');
        
        if (!falsePositives.test(upperFirst) &&
            !falsePositives.test(upperLast) &&
            !nameStopWords.has(upperFirst) &&
            !nameStopWords.has(upperLast) &&
            !isJobTitle &&
            !line.includes('hospital') &&
            !line.includes('Health Care') &&
            !line.includes('Avery') &&
            !line.includes('Isolo')) {
          let finalLast = last;
          if (canAppendNext) {
            finalLast = `${finalLast} ${nextLine.trim()}`;
          }
          const baseScore = idx < 30 ? 15 : (idx < 80 ? 9 : (idx < 150 ? 5 : 2));
          const score = baseScore + (canAppendNext ? 8 : 0);
          candidates.push({
            first,
            last: finalLast,
            lineIndex: idx,
            score
          });
        }
      }
    }
    
    // Sort by score (higher is better) and take the best candidate
    if (candidates.length > 0) {
      candidates.sort((a, b) => b.score - a.score);
      const bestCandidate = candidates[0];
      result.firstName = bestCandidate.first;
      result.lastName = bestCandidate.last;
      console.log('Extracted name (pattern search):', result.firstName, result.lastName, 'at line', bestCandidate.lineIndex, 'score:', bestCandidate.score);
    }
  }
  
  // Log final extraction results for debugging
  const extractionSummary = {
    name: result.firstName && result.lastName ? `${result.firstName} ${result.lastName}` : 'Not found',
    email: result.email || 'Not found',
    phone: result.phone || 'Not found',
    address: result.address || 'Not found',
    dateOfBirth: result.dateOfBirth || 'Not found',
    skillsCount: result.skills.length,
    experienceCount: result.experience.length,
    educationCount: result.education.length,
    certificationsCount: result.certifications.length
  };
  
  console.log('=== FINAL EXTRACTION RESULTS ===');
  console.log(JSON.stringify(extractionSummary, null, 2));
  console.log('================================');
  
  // Ensure we return the result even if some fields are missing
  return result;
}
