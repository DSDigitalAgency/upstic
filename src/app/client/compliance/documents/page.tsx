'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface ComplianceDocument {
  id: string;
  title: string;
  description: string;
  category: 'LICENSE' | 'INSURANCE' | 'CERTIFICATION' | 'POLICY' | 'OTHER';
  status: 'VALID' | 'EXPIRED' | 'PENDING_REVIEW' | 'EXPIRING_SOON';
  expiryDate: string;
  uploadedAt: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
}

export default function ClientComplianceDocumentsPage() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<ComplianceDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'VALID' | 'EXPIRED' | 'PENDING_REVIEW' | 'EXPIRING_SOON'>('all');

  useEffect(() => {
    // Mock data for compliance documents
    const mockDocuments: ComplianceDocument[] = [
      {
        id: '1',
        title: 'Healthcare Facility License',
        description: 'Primary healthcare facility operating license',
        category: 'LICENSE',
        status: 'VALID',
        expiryDate: '2025-06-15',
        uploadedAt: '2023-01-15',
        fileUrl: '/documents/license.pdf',
        fileSize: 2048576,
        fileType: 'pdf'
      },
      {
        id: '2',
        title: 'Professional Liability Insurance',
        description: 'Comprehensive professional liability coverage',
        category: 'INSURANCE',
        status: 'EXPIRING_SOON',
        expiryDate: '2024-03-30',
        uploadedAt: '2023-03-15',
        fileUrl: '/documents/insurance.pdf',
        fileSize: 1536000,
        fileType: 'pdf'
      },
      {
        id: '3',
        title: 'CQC Registration Certificate',
        description: 'Care Quality Commission registration',
        category: 'CERTIFICATION',
        status: 'VALID',
        expiryDate: '2026-12-31',
        uploadedAt: '2023-02-20',
        fileUrl: '/documents/cqc-cert.pdf',
        fileSize: 1024000,
        fileType: 'pdf'
      },
      {
        id: '4',
        title: 'Health and Safety Policy',
        description: 'Updated health and safety procedures',
        category: 'POLICY',
        status: 'PENDING_REVIEW',
        expiryDate: '2024-12-31',
        uploadedAt: '2024-01-10',
        fileUrl: '/documents/hs-policy.pdf',
        fileSize: 512000,
        fileType: 'pdf'
      }
    ];

    setDocuments(mockDocuments);
    setLoading(false);
  }, [user]);

  const filteredDocuments = documents.filter(doc => {
    if (filter === 'all') return true;
    return doc.status === filter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'VALID':
        return 'bg-green-100 text-green-800';
      case 'EXPIRED':
        return 'bg-red-100 text-red-800';
      case 'PENDING_REVIEW':
        return 'bg-yellow-100 text-yellow-800';
      case 'EXPIRING_SOON':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'LICENSE':
        return 'bg-blue-100 text-blue-800';
      case 'INSURANCE':
        return 'bg-purple-100 text-purple-800';
      case 'CERTIFICATION':
        return 'bg-green-100 text-green-800';
      case 'POLICY':
        return 'bg-indigo-100 text-indigo-800';
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Compliance Documents</h1>
        <div className="flex space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'VALID' | 'EXPIRED' | 'PENDING_REVIEW' | 'EXPIRING_SOON')}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-900 bg-white"
          >
            <option value="all">All Documents</option>
            <option value="VALID">Valid</option>
            <option value="EXPIRED">Expired</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="EXPIRING_SOON">Expiring Soon</option>
          </select>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg">
        {filteredDocuments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No compliance documents found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Document
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    File Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDocuments.map((document) => (
                  <tr key={document.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {document.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {document.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(document.category)}`}>
                        {document.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(document.status)}`}>
                        {document.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(document.expiryDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatFileSize(document.fileSize)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        View
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 