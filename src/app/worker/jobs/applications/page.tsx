'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getWorkerApplications } from '@/lib/worker';
import Link from 'next/link';

interface Application {
  id: string;
  jobId: string;
  workerId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'INTERVIEW_SCHEDULED';
  job: {
    id: string;
    title: string;
    company: {
      name: string;
    };
    location: string;
  };
  appliedAt: string;
  updatedAt: string;
  interviewDate?: string;
  notes?: string;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const { user } = useAuth();

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const response = await getWorkerApplications(user.id);
        if (response.success && response.data) {
          setApplications(response.data.items || []);
          setTotalPages(response.data.pages || 1);
        } else {
          setError(response.error || 'Failed to fetch applications');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApplications();
  }, [user, page]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'INTERVIEW_SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (isLoading && applications.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">My Applications</h2>
        <p className="text-gray-700">Track the status of your job applications</p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <span className="text-sm font-medium text-gray-700">{applications.length} applications found</span>
          {isLoading && <span className="ml-2 text-sm text-blue-600">Loading...</span>}
          {error && <span className="ml-2 text-sm text-red-600 font-medium">{error}</span>}
        </div>
        <div className="flex space-x-2 mt-2 md:mt-0">
          <Link href="/worker/jobs" className="px-4 py-3 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors">
            All Jobs
          </Link>
          <Link href="/worker/jobs/recommended" className="px-4 py-3 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors">
            Recommended
          </Link>
        </div>
      </div>

      {applications.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No applications found</h3>
          <p className="mt-2 text-base text-gray-600">
            You haven't applied to any jobs yet.
          </p>
          <div className="mt-6">
            <Link href="/worker/jobs" className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Browse Jobs
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden rounded-lg border border-gray-100">
          <ul className="divide-y divide-gray-200">
            {applications.map((application) => (
              <li key={application.id} className="hover:bg-gray-50 transition-colors">
                <div className="px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <p className="text-lg font-medium text-blue-700 truncate">
                        {application.job.title}
                      </p>
                      <span className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(application.status)}`}>
                        {application.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className="text-sm font-medium text-gray-700">
                        Applied on <time dateTime={application.appliedAt} className="font-semibold">{formatDate(application.appliedAt)}</time>
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 sm:flex sm:justify-between">
                    <div className="sm:flex sm:space-x-6">
                      <p className="flex items-center text-sm text-gray-700">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="font-medium">{application.job.company.name}</span>
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-700 sm:mt-0">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {application.job.location}
                      </p>
                    </div>
                    {application.status === 'INTERVIEW_SCHEDULED' && application.interviewDate && (
                      <div className="mt-3 flex items-center text-sm text-gray-700 sm:mt-0 bg-blue-50 px-3 py-1 rounded-lg">
                        <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="font-medium">
                          Interview on <time dateTime={application.interviewDate} className="text-blue-700">{formatDate(application.interviewDate)}</time>
                        </p>
                      </div>
                    )}
                  </div>
                  {application.notes && (
                    <div className="mt-3 bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-700">{application.notes}</p>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-4 py-2 rounded-lg ${
                  pageNum === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
} 