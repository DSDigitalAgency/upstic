'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { Document, Worker } from '@/lib/api';

interface ComplianceStats {
  totalDocuments: number;
  validDocuments: number;
  expiredDocuments: number;
  pendingReview: number;
  totalWorkers: number;
  compliantWorkers: number;
  nonCompliantWorkers: number;
}

export default function CompliancePage() {
  const [stats, setStats] = useState<ComplianceStats>({
    totalDocuments: 0,
    validDocuments: 0,
    expiredDocuments: 0,
    pendingReview: 0,
    totalWorkers: 0,
    compliantWorkers: 0,
    nonCompliantWorkers: 0,
  });
  const [documents, setDocuments] = useState<Document[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'certifications' | 'audits'>('overview');

  useEffect(() => {
    const fetchComplianceData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch documents
        const documentsResponse = await apiClient.getDocuments();
        const documentsData = documentsResponse.data || [];

        // Fetch workers
        const workersResponse = await apiClient.getWorkers();
        const workersData = workersResponse.data?.items || [];

        // Calculate stats
        const validDocuments = documentsData.filter(d => d.status === 'VALID');
        const expiredDocuments = documentsData.filter(d => d.status === 'EXPIRED');
        const pendingDocuments = documentsData.filter(d => d.status === 'PENDING_REVIEW');

        // Calculate worker compliance (mock logic)
        const compliantWorkers = workersData.filter(w => w.rating >= 4.0).length;
        const nonCompliantWorkers = workersData.length - compliantWorkers;

        setStats({
          totalDocuments: documentsData.length,
          validDocuments: validDocuments.length,
          expiredDocuments: expiredDocuments.length,
          pendingReview: pendingDocuments.length,
          totalWorkers: workersData.length,
          compliantWorkers,
          nonCompliantWorkers,
        });

        setDocuments(documentsData);
        setWorkers(workersData);

      } catch (err) {
        setError('Failed to load compliance data');
        console.error('Compliance data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchComplianceData();
  }, []);

  const handleApproveDocument = async (documentId: string) => {
    try {
      // Mock document approval - in a real app this would update the document
      console.log(`Approving document ${documentId}`);
      
      // Refresh data
      const documentsResponse = await apiClient.getDocuments();
      const documentsData = documentsResponse.data || [];
      setDocuments(documentsData);
      
      // Update stats
      const validDocuments = documentsData.filter(d => d.status === 'VALID');
      const pendingDocuments = documentsData.filter(d => d.status === 'PENDING_REVIEW');
      
      setStats(prev => ({
        ...prev,
        validDocuments: validDocuments.length,
        pendingReview: pendingDocuments.length,
      }));
    } catch (err) {
      console.error('Failed to approve document:', err);
    }
  };

  const handleRejectDocument = async (documentId: string, reason: string) => {
    try {
      // Mock document rejection - in a real app this would update the document
      console.log(`Rejecting document ${documentId} with reason: ${reason}`);
      
      // Refresh data
      const documentsResponse = await apiClient.getDocuments();
      const documentsData = documentsResponse.data || [];
      setDocuments(documentsData);
      
      // Update stats
      const expiredDocuments = documentsData.filter(d => d.status === 'EXPIRED');
      const pendingDocuments = documentsData.filter(d => d.status === 'PENDING_REVIEW');
      
      setStats(prev => ({
        ...prev,
        expiredDocuments: expiredDocuments.length,
        pendingReview: pendingDocuments.length,
      }));
    } catch (err) {
      console.error('Failed to reject document:', err);
    }
  };

  const getDocumentIcon = (category: string) => {
    switch (category) {
      case 'CERTIFICATION':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'COMPLIANCE':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      case 'IDENTIFICATION':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Compliance Management</h1>
        <p className="text-gray-600">Monitor staff compliance and document verification</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Total Documents</h3>
              <p className="text-2xl font-bold text-blue-600">{stats.totalDocuments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Valid</h3>
              <p className="text-2xl font-bold text-green-600">{stats.validDocuments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Expired</h3>
              <p className="text-2xl font-bold text-red-600">{stats.expiredDocuments}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">Pending</h3>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingReview}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Worker Compliance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Total Workers</h3>
              <p className="text-3xl font-bold text-gray-900">{stats.totalWorkers}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Compliant</h3>
              <p className="text-3xl font-bold text-green-600">{stats.compliantWorkers}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Non-Compliant</h3>
              <p className="text-3xl font-bold text-red-600">{stats.nonCompliantWorkers}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'documents', label: 'Documents' },
              { id: 'certifications', label: 'Certifications' },
              { id: 'audits', label: 'Audit Logs' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'overview' | 'documents' | 'certifications' | 'audits')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Documents</h3>
                  <div className="space-y-3">
                    {documents.slice(0, 5).map((document) => (
                      <div key={document.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            document.status === 'VALID' ? 'bg-green-100' :
                            document.status === 'EXPIRED' ? 'bg-red-100' :
                            'bg-yellow-100'
                          }`}>
                            {getDocumentIcon(document.category)}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{document.title}</p>
                            <p className="text-xs text-gray-500">
                              {document.category} • {new Date(document.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          document.status === 'VALID' ? 'bg-green-100 text-green-800' :
                          document.status === 'EXPIRED' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {document.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Worker Compliance</h3>
                  <div className="space-y-3">
                    {workers.slice(0, 5).map((worker) => (
                      <div key={worker.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {worker.firstName} {worker.lastName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {worker.skills.join(', ')} • Rating: {worker.rating}/5
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            worker.rating >= 4.0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {worker.rating >= 4.0 ? 'Compliant' : 'Non-Compliant'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">All Documents</h3>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                  Upload Document
                </button>
              </div>
              
              <div className="space-y-3">
                {documents.map((document) => (
                  <div key={document.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                        document.status === 'VALID' ? 'bg-green-100' :
                        document.status === 'EXPIRED' ? 'bg-red-100' :
                        'bg-yellow-100'
                      }`}>
                        {getDocumentIcon(document.category)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{document.title}</p>
                        <p className="text-xs text-gray-500">
                          {document.category} • Worker: {document.workerId} • {new Date(document.uploadedAt).toLocaleDateString()}
                        </p>
                        {document.description && (
                          <p className="text-xs text-gray-500">{document.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        document.status === 'VALID' ? 'bg-green-100 text-green-800' :
                        document.status === 'EXPIRED' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {document.status}
                      </span>
                      {document.status === 'PENDING_REVIEW' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApproveDocument(document.id)}
                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectDocument(document.id, 'Rejected by client')}
                            className="px-3 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'certifications' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Certifications</h3>
              
              <div className="space-y-3">
                {documents.filter(d => d.category === 'CERTIFICATION').map((document) => (
                  <div key={document.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{document.title}</p>
                        <p className="text-xs text-gray-500">
                          Worker: {document.workerId} • {new Date(document.uploadedAt).toLocaleDateString()}
                        </p>
                        {document.expiryDate && (
                          <p className="text-xs text-gray-500">
                            Expires: {new Date(document.expiryDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      document.status === 'VALID' ? 'bg-green-100 text-green-800' :
                      document.status === 'EXPIRED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {document.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'audits' && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Audit Logs</h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  Audit logs view coming soon. This will show detailed compliance audit trails and verification history.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 