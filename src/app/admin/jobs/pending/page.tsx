'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/demo/func/api';
import type { Job, Client } from '@/demo/func/api';

export default function PendingJobsPage() {
  const [pendingJobs, setPendingJobs] = useState<Job[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchPendingJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const [jobsRes, clientsRes] = await Promise.all([
        apiClient.getJobs({ limit: 100 }),
        apiClient.getClients(),
      ]);
      if (jobsRes.success && jobsRes.data && clientsRes.success && clientsRes.data) {
        const jobs = jobsRes.data.items.filter(job => job.status === 'pending');
        setPendingJobs(jobs);
        setClients(clientsRes.data);
      } else {
        setError(jobsRes.error || clientsRes.error || 'Failed to load pending jobs or clients');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Pending jobs fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingJobs();
  }, [fetchPendingJobs]);

  const handleJobAction = async (jobId: string, action: 'approve' | 'reject') => {
    try {
      setIsProcessing(true);
      setError(null);
      const response = await apiClient.updateJob();
      if (response.success) {
        setPendingJobs(prev => prev.filter(job => job.id !== jobId));
        alert(`Job ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      } else {
        setError(`Failed to ${action} job: ${response.error}`);
      }
    } catch (err) {
      setError(`Failed to ${action} job`);
      console.error(`Job ${action} error:`, err);
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
        <h2 className="text-2xl font-bold text-gray-900">Pending Job Approvals</h2>
        <p className="mt-1 text-sm text-gray-500">
          Review and approve job requests from healthcare facilities
        </p>
      </div>
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Pending Approvals: {pendingJobs.length}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Jobs awaiting admin review and approval
            </p>
          </div>
          <button
            onClick={fetchPendingJobs}
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
      {pendingJobs.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No pending jobs</h3>
          <p className="mt-2 text-sm text-gray-500">
            All job requests have been reviewed and processed.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingJobs.map((job) => {
            const client = clients.find(c => c.id === job.clientId);
            return (
              <div key={job.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending Approval
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Client</p>
                        <p className="text-sm text-gray-900">
                          {client ? client.companyName : 'Unknown Client'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Location</p>
                        <p className="text-sm text-gray-900">{job.location}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Rate</p>
                        <p className="text-sm text-gray-900">{formatCurrency(job.rate)}/hr</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Posted</p>
                        <p className="text-sm text-gray-900">{formatDate(job.startDate)}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-500">Description</p>
                      <p className="text-sm text-gray-900 mt-1 line-clamp-2">{job.description}</p>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-500">Requirements</p>
                      <div className="mt-1 flex flex-wrap gap-2">
                        {job.requirements?.map((req, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800"
                          >
                            {req}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="ml-6 flex flex-col space-y-2">
                    <button
                      onClick={() => handleJobAction(job.id, 'approve')}
                      disabled={isProcessing}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </button>
                    <button
                      onClick={() => handleJobAction(job.id, 'reject')}
                      disabled={isProcessing}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 