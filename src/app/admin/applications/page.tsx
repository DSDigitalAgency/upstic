'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api';
import type { Job, Worker } from '@/lib/api';

interface Application {
  id: string;
  jobId: string;
  workerId: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ASSIGNMENT_CREATED';
  coverLetter?: string;
  notes?: string;
  expectedRate?: number;
  availability?: string;
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  job?: Job;
  worker?: Worker;
}

export default function ApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Fetch applications from the mock API
      const response = await apiClient.getApplications();
      if (response.success && response.data) {
        const applications = response.data;
        // Fetch jobs and workers for enrichment
        const [jobsRes, workersRes] = await Promise.all([
          apiClient.getJobs({ limit: 100 }),
          apiClient.getWorkers(1, 100)
        ]);
        const jobs: Job[] = jobsRes.success && jobsRes.data ? jobsRes.data.items : [];
        const workers: Worker[] = workersRes.success && workersRes.data ? workersRes.data.items : [];
        // Attach job and worker objects to each application
        const enriched = applications.map((app: Application) => ({
          ...app,
          job: jobs.find((j: Job) => j.id === app.jobId),
          worker: workers.find((w: Worker) => w.id === app.workerId)
        }));
        setApplications(enriched);
      } else {
        setError('Failed to load applications');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Applications fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplicationAction = async (applicationId: string, action: 'accept' | 'reject') => {
    try {
      setIsProcessing(true);
      setError(null);
      
      // Update application status
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: action === 'accept' ? 'ACCEPTED' : 'REJECTED' }
            : app
        )
      );
      
      // Show success message
      alert(`Application ${action === 'accept' ? 'accepted' : 'rejected'} successfully`);
    } catch (err) {
      setError(`Failed to ${action} application`);
      console.error(`Application ${action} error:`, err);
    } finally {
      setIsProcessing(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ACCEPTED':
        return 'bg-green-100 text-green-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      case 'ASSIGNMENT_CREATED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredApplications = applications.filter((app: Application) => {
    if (filter === 'all') return true;
    return app.status === filter.toUpperCase();
  });

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
        <h2 className="text-2xl font-bold text-gray-900">Worker Applications</h2>
        <p className="mt-1 text-sm text-gray-500">
          Review and manage worker applications for job positions
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

      {/* Stats and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Applications: {filteredApplications.length}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Total applications in the system
              </p>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-900">Filter:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'pending' | 'accepted' | 'rejected')}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Applications</option>
                <option value="pending">Pending Review</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
          
          <button
            onClick={fetchApplications}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
        </div>
      </div>

      {/* Applications List */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No applications found</h3>
          <p className="mt-2 text-sm text-gray-500">
            {filter === 'all' 
              ? 'No applications have been submitted yet.'
              : `No ${filter} applications found.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <div key={application.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {application.worker?.firstName} {application.worker?.lastName}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                      {application.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Job Position</p>
                      <p className="text-sm text-gray-900">{application.job?.title}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Worker</p>
                      <p className="text-sm text-gray-900">
                        {application.worker?.firstName} {application.worker?.lastName}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Expected Rate</p>
                      <p className="text-sm text-gray-900">
                        {application.expectedRate ? formatCurrency(application.expectedRate) : 'Not specified'}
                      </p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-500">Applied</p>
                      <p className="text-sm text-gray-900">{formatDate(application.appliedAt)}</p>
                    </div>
                  </div>
                  
                  {application.coverLetter && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500">Cover Letter</p>
                      <p className="text-sm text-gray-900 mt-1">{application.coverLetter}</p>
                    </div>
                  )}
                  
                  {application.notes && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500">Notes</p>
                      <p className="text-sm text-gray-900 mt-1">{application.notes}</p>
                    </div>
                  )}
                  
                  {application.availability && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-500">Availability</p>
                      <p className="text-sm text-gray-900 mt-1">{application.availability}</p>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-500">Worker Skills</p>
                    <div className="mt-1 flex flex-wrap gap-2">
                      {application.worker?.skills?.map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="ml-6 flex flex-col space-y-2">
                  {application.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleApplicationAction(application.id, 'accept')}
                        disabled={isProcessing}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Accept
                      </button>
                      
                      <button
                        onClick={() => handleApplicationAction(application.id, 'reject')}
                        disabled={isProcessing}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Reject
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => router.push(`/admin/jobs/${application.jobId}`)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Job
                  </button>
                  
                  <button
                    onClick={() => router.push(`/admin/users/workers/${application.workerId}`)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    View Worker
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 