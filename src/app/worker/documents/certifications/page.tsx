'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Worker } from '@/demo/func/api';

interface CertificationDoc {
  id: string;
  workerId: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category: string;
  status: string;
  expiryDate?: string;
  uploadedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
}

export default function Certifications() {
  const [certifications, setCertifications] = useState<CertificationDoc[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const [workerId, setWorkerId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkerId = async () => {
      if (!user?.id) return;
      const res = await (await import('@/demo/func/api')).apiClient.getWorkers(1, 100);
      if (res.success && res.data) {
        const worker = res.data.items.find((w: Worker) => w.userId === user.id);
        if (worker) setWorkerId(worker.id);
        else setWorkerId(null);
      } else {
        setWorkerId(null);
      }
    };
    fetchWorkerId();
  }, [user]);

  useEffect(() => {
    const fetchCertifications = async () => {
      if (!workerId) return;
      setIsLoading(true);
      try {
        const response = await fetch('/api/demo-data/documents.json');
        if (response.ok) {
          const allDocs: CertificationDoc[] = await response.json();
          const certDocs = allDocs.filter(doc => doc.workerId === workerId && doc.category === 'CERTIFICATION');
          setCertifications(certDocs);
        } else {
          setError('Failed to fetch certifications');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCertifications();
  }, [workerId]);

  const getStatusBadgeColor = (status: string) => {
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

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getDaysUntilExpiry = (expiryDate: string) => {
    if (!expiryDate) return null;
    
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const getExpiryStatusClass = (expiryDate: string) => {
    if (!expiryDate) return '';
    
    const daysUntil = getDaysUntilExpiry(expiryDate);
    
    if (daysUntil === null) return '';
    if (daysUntil < 0) return 'text-red-600 font-medium';
    if (daysUntil <= 30) return 'text-yellow-600 font-medium';
    return 'text-green-600';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Certifications</h2>
        <p className="text-gray-600">Manage your professional certifications and licenses</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">Your Certifications</h3>
          <Link 
            href="/worker/documents/upload" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Add Certification
          </Link>
        </div>

        {certifications.length === 0 ? (
          <div className="p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No certifications</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by adding your professional certifications.</p>
            <div className="mt-6">
              <Link 
                href="/worker/documents/upload" 
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Certification
              </Link>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {certifications.map((cert) => {
              const daysUntilExpiry = getDaysUntilExpiry(cert.expiryDate || '');
              const expiryStatusClass = getExpiryStatusClass(cert.expiryDate || '');
              
              return (
                <div key={cert.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{cert.title}</h4>
                        {cert.description && (
                          <p className="mt-1 text-sm text-gray-600">{cert.description}</p>
                        )}
                        <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <svg className="mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>Uploaded: {formatDate(cert.uploadedAt)}</span>
                          </div>
                          <div className="flex items-center">
                            <svg className="mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className={expiryStatusClass}>
                              {cert.expiryDate ? (
                                <>
                                  Expires: {formatDate(cert.expiryDate)}
                                  {daysUntilExpiry !== null && (
                                    <span className="ml-1">
                                      {daysUntilExpiry < 0
                                        ? ' (Expired)'
                                        : daysUntilExpiry === 0
                                        ? ' (Expires today)'
                                        : ` (${daysUntilExpiry} days left)`}
                                    </span>
                                  )}
                                </>
                              ) : (
                                'No expiration date'
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(cert.status)}`}>
                        {cert.status.replace('_', ' ')}
                      </span>
                      <div className="flex space-x-2">
                        <a 
                          href={cert.fileUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          View
                        </a>
                        <Link 
                          href={`/worker/documents/upload?edit=${cert.id}`} 
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-800"
                        >
                          Update
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Certification Requirements</h3>
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-green-500">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-700">All certifications must be current and valid for active employment</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-green-500">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-700">You&apos;ll receive notifications 30 days before any certification expires</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 h-5 w-5 text-green-500">
              <svg fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-gray-700">Upload renewed certifications as soon as they&apos;re available</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 