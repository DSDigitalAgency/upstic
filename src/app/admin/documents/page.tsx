'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/demo/func/api';
import type { Document } from '@/demo/func/api';
import DocumentViewer from '@/components/DocumentViewer';

interface DocumentWithWorker extends Document {
  worker?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentWithWorker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'VALID' | 'EXPIRED' | 'PENDING_REVIEW'>('all');
  const [search, setSearch] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<DocumentWithWorker | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch all workers first
      const workersResponse = await apiClient.getWorkers(1, 100);
      const workers = workersResponse.success && workersResponse.data ? workersResponse.data.items : [];
      
      // Fetch documents for each worker
      const allDocuments: DocumentWithWorker[] = [];
      
      for (const worker of workers) {
        try {
          const response = await fetch(`/api/workers/documents?workerId=${worker.id}`);
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              const documentsWithWorker = data.data.map((doc: Document) => ({
                ...doc,
                worker: {
                  id: worker.id,
                  firstName: worker.firstName,
                  lastName: worker.lastName,
                  email: worker.email
                }
              }));
              allDocuments.push(...documentsWithWorker);
            }
          }
        } catch (err) {
          console.error(`Failed to fetch documents for worker ${worker.id}:`, err);
        }
      }
      
      setDocuments(allDocuments);
    } catch (err) {
      setError('Failed to load documents');
      console.error('Documents fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VALID':
        return 'bg-green-100 text-green-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      case 'PENDING_REVIEW':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'CERTIFICATION':
        return 'bg-blue-100 text-blue-800';
      case 'COMPLIANCE':
        return 'bg-purple-100 text-purple-800';
      case 'IDENTIFICATION':
        return 'bg-orange-100 text-orange-800';
      case 'OTHER':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredDocuments = documents.filter(document => {
    const matchesFilter = filter === 'all' || document.status === filter;
    const matchesSearch = search === '' || 
      document.title.toLowerCase().includes(search.toLowerCase()) ||
      document.worker?.firstName.toLowerCase().includes(search.toLowerCase()) ||
      document.worker?.lastName.toLowerCase().includes(search.toLowerCase()) ||
      document.worker?.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleVerifyDocument = async (documentId: string) => {
    try {
      // In a real application, you would make an API call to verify the document
      console.log(`Verifying document ${documentId}`);
      
      // Update the document status locally
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, status: 'VALID' as const, verifiedAt: new Date().toISOString(), verifiedBy: 'admin' }
          : doc
      ));
    } catch (err) {
      console.error('Failed to verify document:', err);
    }
  };

  const handleRejectDocument = async (documentId: string) => {
    try {
      // In a real application, you would make an API call to reject the document
      console.log(`Rejecting document ${documentId}`);
      
      // Update the document status locally
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId 
          ? { ...doc, status: 'EXPIRED' as const }
          : doc
      ));
    } catch (err) {
      console.error('Failed to reject document:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Worker Documents</h2>
        <p className="mt-1 text-sm text-gray-500">
          Review and manage all worker uploaded documents
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Total Documents</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">{documents.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Pending Review</h3>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {documents.filter(d => d.status === 'PENDING_REVIEW').length}
              </p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Verified</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {documents.filter(d => d.status === 'VALID').length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Expired</h3>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {documents.filter(d => d.status === 'EXPIRED').length}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-900">Status:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'VALID' | 'EXPIRED' | 'PENDING_REVIEW')}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Documents</option>
                <option value="PENDING_REVIEW">Pending Review</option>
                <option value="VALID">Verified</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-900">Search:</label>
              <input
                type="text"
                placeholder="Search documents..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Documents List */}
      {filteredDocuments.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No documents found</h3>
          <p className="mt-2 text-sm text-gray-500">
            {search || filter !== 'all' 
              ? 'No documents match your search criteria.'
              : 'No documents have been uploaded yet.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDocuments.map((document) => (
            <div key={document.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">{document.title}</h3>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                      {document.status.replace('_', ' ')}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(document.category)}`}>
                      {document.category}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Worker</p>
                      <p className="text-sm text-gray-900">
                        {document.worker ? `${document.worker.firstName} ${document.worker.lastName}` : 'Unknown'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-sm text-gray-900">{document.worker?.email || 'Unknown'}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">File Size</p>
                      <p className="text-sm text-gray-900">{formatFileSize(document.fileSize)}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Uploaded</p>
                      <p className="text-sm text-gray-900">{formatDate(document.uploadedAt)}</p>
                    </div>
                  </div>
                  
                  {document.description && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500">Description</p>
                      <p className="text-sm text-gray-900">{document.description}</p>
                    </div>
                  )}
                  
                  {document.expiryDate && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500">Expiry Date</p>
                      <p className="text-sm text-gray-900">{formatDate(document.expiryDate)}</p>
                    </div>
                  )}
                  
                  {document.verifiedAt && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500">Verified</p>
                      <p className="text-sm text-gray-900">{formatDate(document.verifiedAt)}</p>
                    </div>
                  )}
                </div>
                
                                 <div className="ml-6 flex flex-col space-y-2">
                   {document.fileUrl && (
                     <button
                       onClick={() => setSelectedDocument(document)}
                       className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                     >
                       <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                       </svg>
                       View Document
                     </button>
                   )}
                  
                  {document.status === 'PENDING_REVIEW' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleVerifyDocument(document.id)}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Verify
                      </button>
                      
                      <button
                        onClick={() => handleRejectDocument(document.id)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
                 </div>
       )}

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <DocumentViewer
          fileUrl={selectedDocument.fileUrl}
          fileName={selectedDocument.title}
          fileType={selectedDocument.fileType}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </div>
  );
} 