import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import mammoth from 'mammoth';

export async function POST(request: NextRequest) {
  try {
    const { fileUrl } = await request.json();
    
    // Extract the file path from the URL
    const filePath = path.join(process.cwd(), 'public', fileUrl);
    
    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      );
    }

    // Get file extension
    const fileExtension = path.extname(filePath).toLowerCase();
    
    let content = null;
    
    if (fileExtension === '.docx') {
      // Convert .docx to HTML using mammoth
      try {
        const fileBuffer = await fs.readFile(filePath);
        
        // Convert to HTML with formatting preserved
        const result = await mammoth.convertToHtml({ buffer: fileBuffer });
        const html = result.value;
        
        // Also get raw text for metadata
        const textResult = await mammoth.extractRawText({ buffer: fileBuffer });
        const text = textResult.value;
        
        // Split text into paragraphs for metadata
        const paragraphs = text.split('\n').filter(p => p.trim().length > 0);
        
        content = {
          title: path.basename(filePath, fileExtension),
          htmlContent: html, // HTML with original formatting
          paragraphs: paragraphs, // Raw text paragraphs
          metadata: {
            wordCount: text.split(/\s+/).filter(word => word.length > 0).length,
            pageCount: Math.ceil(paragraphs.length / 3), // Rough estimate
            lastModified: new Date().toISOString()
          }
        };
      } catch (error) {
        console.error('Error converting .docx to HTML:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to convert Word document to HTML' },
          { status: 500 }
        );
      }
    } else if (fileExtension === '.doc') {
      // For .doc files, we'll return a message that conversion is needed
      content = {
        title: path.basename(filePath, fileExtension),
        htmlContent: "<p>This is a .doc file which requires additional processing.</p><p>The content extraction for .doc files is not yet implemented.</p><p>Please convert the file to .docx format for full content preview.</p>",
        paragraphs: [
          "This is a .doc file which requires additional processing.",
          "The content extraction for .doc files is not yet implemented.",
          "Please convert the file to .docx format for full content preview."
        ],
        metadata: {
          wordCount: 0,
          pageCount: 1,
          lastModified: new Date().toISOString()
        }
      };
    } else {
      // For other file types, try to read as text
      try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const paragraphs = fileContent.split('\n').filter(p => p.trim().length > 0);
        
        content = {
          title: path.basename(filePath),
          htmlContent: `<p>${paragraphs.length > 0 ? paragraphs.join('</p><p>') : 'File content could not be extracted'}</p>`,
          paragraphs: paragraphs.length > 0 ? paragraphs : ["File content could not be extracted"],
          metadata: {
            wordCount: fileContent.split(/\s+/).filter(word => word.length > 0).length,
            pageCount: 1,
            lastModified: new Date().toISOString()
          }
        };
      } catch (error) {
        content = {
          title: path.basename(filePath),
          htmlContent: "<p>This file type is not supported for content extraction</p>",
          paragraphs: ["This file type is not supported for content extraction"],
          metadata: {
            wordCount: 0,
            pageCount: 1,
            lastModified: new Date().toISOString()
          }
        };
      }
    }

    return NextResponse.json({
      success: true,
      content: content
    });
    
  } catch (error) {
    console.error('Error reading document:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read document' },
      { status: 500 }
    );
  }
}
