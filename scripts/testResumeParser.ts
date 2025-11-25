import fs from 'fs/promises';
import path from 'path';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';
import { extractResumeData } from '../src/lib/resumeParser';

async function extractTextFromPath(filePath: string): Promise<string> {
  const absolutePath = path.resolve(filePath);
  const buffer = await fs.readFile(absolutePath);
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.pdf') {
    const pdfData = await pdfParse(Buffer.from(buffer));
    return pdfData.text || '';
  }

  if (ext === '.docx' || ext === '.doc') {
    const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
    return result.value || '';
  }

  return buffer.toString('utf8');
}

async function main() {
  const targetFile = process.argv[2] || 'demofiles/cv.pdf';
  console.log(`Parsing resume: ${targetFile}`);

  const text = await extractTextFromPath(targetFile);
  const parsed = extractResumeData(text);

  console.log('=== Parsed Resume Data ===');
  console.log(JSON.stringify(parsed, null, 2));
}

main().catch((error) => {
  console.error('Failed to parse resume:', error);
  process.exit(1);
});

