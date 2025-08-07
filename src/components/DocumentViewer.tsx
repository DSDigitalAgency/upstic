'use client';

import { useState, useEffect } from 'react';

interface DocumentViewerProps {
  fileUrl: string | null | undefined;
  fileName: string;
  fileType: string;
  onClose: () => void;
}

export default function DocumentViewer({ fileUrl, fileName, fileType, onClose }: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentContent, setDocumentContent] = useState<any>(null);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError('Failed to load document');
  };

  // Fetch document content for Office documents
  const fetchDocumentContent = async (url: string) => {
    console.log('DocumentViewer - fetchDocumentContent called with URL:', url);
    try {
      const response = await fetch('/api/read-document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileUrl: url }),
      });

      console.log('DocumentViewer - API response status:', response.status);
      const data = await response.json();
      console.log('DocumentViewer - API response data:', data);
      
      if (data.success) {
        console.log('DocumentViewer - Setting document content:', data.content);
        setDocumentContent(data.content);
      } else {
        console.error('Failed to fetch document content:', data.error);
      }
    } catch (error) {
      console.error('Error fetching document content:', error);
    }
  };

  // Handle relative file paths by converting them to full URLs
  const getFullUrl = (url: string | null | undefined) => {
    console.log('DocumentViewer - getFullUrl called with:', url, typeof url);
    if (!url || typeof url !== 'string') {
      console.log('DocumentViewer - getFullUrl returning empty string');
      return '';
    }
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
      console.log('DocumentViewer - getFullUrl returning original URL:', url);
      return url;
    }
    // If it's just a filename, assume it's in the uploads directory
    const fullUrl = `/uploads/documents/${url}`;
    console.log('DocumentViewer - getFullUrl returning constructed URL:', fullUrl);
    return fullUrl;
  };

  const fullUrl = getFullUrl(fileUrl);
  const isImage = fileType.startsWith('image/');
  const isPDF = fileType === 'application/pdf';
  const isWordDocument = fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || 
                        fileType === 'application/msword' ||
                        fileName.toLowerCase().endsWith('.docx') ||
                        fileName.toLowerCase().endsWith('.doc');
  const isExcelDocument = fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                         fileType === 'application/vnd.ms-excel' ||
                         fileName.toLowerCase().endsWith('.xlsx') ||
                         fileName.toLowerCase().endsWith('.xls');
  const isPowerPointDocument = fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' ||
                              fileType === 'application/vnd.ms-powerpoint' ||
                              fileName.toLowerCase().endsWith('.pptx') ||
                              fileName.toLowerCase().endsWith('.ppt');
  const isOfficeDocument = isWordDocument || isExcelDocument || isPowerPointDocument;

  // Stop loading immediately for non-previewable documents
  const canPreview = isImage || isPDF;
  
  useEffect(() => {
    if (!canPreview) {
      setIsLoading(false);
    }
  }, [canPreview]);

  // Fetch document content for Office documents
  useEffect(() => {
    if (isOfficeDocument && fullUrl) {
      console.log('DocumentViewer - useEffect triggered for Office document:', fullUrl);
      fetchDocumentContent(fullUrl);
    }
  }, [isOfficeDocument, fullUrl]);

  // Debug rendering logic
  console.log('DocumentViewer Render Debug:', {
    fileName,
    fileType,
    fullUrl,
    isImage,
    isPDF,
    isWordDocument,
    isExcelDocument,
    isPowerPointDocument,
    isOfficeDocument,
    canPreview,
    isLoading,
    error,
    documentContent: documentContent ? 'Content loaded' : 'No content'
  });

  // Debug which rendering path is taken
  useEffect(() => {
    if (isImage) {
      console.log('DocumentViewer - Will render image');
    } else if (isPDF) {
      console.log('DocumentViewer - Will render PDF');
    } else if (isOfficeDocument) {
      console.log('DocumentViewer - Will render Office document');
    } else {
      console.log('DocumentViewer - Will render other document');
    }
  }, [isImage, isPDF, isOfficeDocument]);

  // Get file extension for better type detection
  const getFileExtension = (filename: string) => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  // Get file type icon
  const getFileTypeIcon = (fileType: string, fileName: string) => {
    const ext = getFileExtension(fileName);
    if (fileType.startsWith('image/')) return '🖼️';
    if (fileType === 'application/pdf') return '📄';
    if (ext === 'docx' || ext === 'doc') return '📝';
    if (ext === 'xlsx' || ext === 'xls') return '📊';
    if (ext === 'pptx' || ext === 'ppt') return '📈';
    return '📎';
  };

  // Get document type label
  const getDocumentTypeLabel = (fileType: string, fileName: string) => {
    const ext = getFileExtension(fileName);
    if (fileType.startsWith('image/')) return 'Image';
    if (fileType === 'application/pdf') return 'PDF Document';
    if (ext === 'docx' || ext === 'doc') return 'Word Document';
    if (ext === 'xlsx' || ext === 'xls') return 'Excel Spreadsheet';
    if (ext === 'pptx' || ext === 'ppt') return 'PowerPoint Presentation';
    return 'Document';
  };

  // Convert Word document URL to Microsoft Office Online Viewer URL
  const getOfficeViewerUrl = (url: string) => {
    // Use Microsoft Office Online Viewer for Word documents
    const encodedUrl = encodeURIComponent(url);
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
  };

  // Check if we can use Office Online Viewer (requires publicly accessible URL)
  const canUseOfficeViewer = (url: string) => {
    // Check if we're in a localhost environment
    const isLocalhost = typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('localhost') ||
      window.location.hostname.includes('127.0.0.1')
    );
    
    // For localhost, we'll show local options instead of external viewer
    return !isLocalhost;
  };

  // Don't render if no valid URL
  if (!fullUrl) {
    console.log('DocumentViewer - No valid URL, returning null');
    return null;
  }

  console.log('DocumentViewer - Rendering component with fullUrl:', fullUrl);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{fileName}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-4 overflow-auto">
          {isLoading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">{error}</p>
                <p className="mt-1 text-xs text-gray-400">File: {fullUrl}</p>
                <a
                  href={fullUrl}
                  download={fileName}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Download File
                </a>
              </div>
            </div>
          )}

          {!error && (
            <div className="h-full">
              {isImage ? (
                <img
                  src={fullUrl}
                  alt={fileName}
                  className="max-w-full max-h-full mx-auto"
                  onLoad={handleLoad}
                  onError={handleError}
                  style={{ display: isLoading ? 'none' : 'block' }}
                />
              ) : isPDF ? (
                <iframe
                  src={fullUrl}
                  className="w-full h-full border-0"
                  onLoad={handleLoad}
                  onError={handleError}
                  style={{ display: isLoading ? 'none' : 'block' }}
                />
              ) : isOfficeDocument ? (
                 <div className="h-full">
                   {documentContent ? (
                     <>
                        <div 
                          className="document-content"
                          dangerouslySetInnerHTML={{ 
                            __html: documentContent.htmlContent 
                          }}
                          style={{
                            fontFamily: 'Arial, sans-serif',
                            lineHeight: '1.6',
                            color: '#374151',
                            fontSize: '14px',
                            padding: '20px',
                            backgroundColor: '#ffffff',
                            height: '100%',
                            overflowY: 'auto',
                            // Word document styling
                            textAlign: 'left',
                            whiteSpace: 'pre-wrap',
                            wordWrap: 'break-word'
                          }}
                        />
                        <style jsx>{`
                          .document-content h1 {
                            font-size: 18px;
                            font-weight: bold;
                            margin: 16px 0 8px 0;
                            color: #1f2937;
                          }
                          .document-content h2 {
                            font-size: 16px;
                            font-weight: bold;
                            margin: 14px 0 6px 0;
                            color: #1f2937;
                          }
                          .document-content h3 {
                            font-size: 15px;
                            font-weight: bold;
                            margin: 12px 0 6px 0;
                            color: #1f2937;
                          }
                          .document-content p {
                            margin: 8px 0;
                            line-height: 1.6;
                          }
                          .document-content ul, .document-content ol {
                            margin: 8px 0;
                            padding-left: 20px;
                          }
                          .document-content li {
                            margin: 4px 0;
                          }
                          .document-content strong {
                            font-weight: bold;
                          }
                          .document-content em {
                            font-style: italic;
                          }
                          .document-content table {
                            border-collapse: collapse;
                            width: 100%;
                            margin: 8px 0;
                          }
                          .document-content th, .document-content td {
                            border: 1px solid #d1d5db;
                            padding: 6px 8px;
                            text-align: left;
                          }
                          .document-content th {
                            background-color: #f9fafb;
                            font-weight: bold;
                          }
                        `}</style>
                      </>
                    ) : (
                     <div className="flex items-center justify-center h-64">
                       <div className="text-center">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                         <p className="text-sm text-gray-500 mb-2">Converting document to HTML...</p>
                         <p className="text-xs text-gray-400">This may take a few seconds for large documents</p>
                       </div>
                     </div>
                   )}
                 </div>
               ) : (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="text-4xl mb-2">{getFileTypeIcon(fileType, fileName)}</div>
                    <p className="mt-2 text-sm text-gray-500">{getDocumentTypeLabel(fileType, fileName)}</p>
                    <p className="mt-1 text-xs text-gray-400">File: {fileName}</p>
                    <p className="mt-1 text-xs text-gray-400">Type: {fileType}</p>
                    <p className="mt-2 text-xs text-gray-500">Preview not available for this file type</p>
                    <a
                      href={fullUrl}
                      download={fileName}
                      className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Download File
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 