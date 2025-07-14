'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, Job, Client } from '@/lib/api';
import JobsTable from '@/components/JobsTable';
import { debounce } from 'lodash';
import { Input } from '@/components/ui/input';

export default function ActiveJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const router = useRouter();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedFetchJobs = useCallback(
    debounce(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [jobsRes, clientsRes] = await Promise.all([
          apiClient.getJobs({ page: 1, limit: 100 }),
          apiClient.getClients(),
        ]);
        if (jobsRes.success && jobsRes.data && clientsRes.success && clientsRes.data) {
          const activeJobs = jobsRes.data.items.filter(job => {
            const status = job.status.toUpperCase();
            return status === 'ACTIVE' || status === 'OPEN';
          });
          setJobs(activeJobs);
          setClients(clientsRes.data);
        } else {
          setError('Failed to fetch active jobs or clients.');
        }
      } catch (error) {
        console.error('Failed to fetch active jobs:', error);
        setError('An error occurred while fetching jobs.');
      } finally {
        setIsLoading(false);
      }
    }, 500),
    []
  );

  useEffect(() => {
    debouncedFetchJobs();
    return () => {
      debouncedFetchJobs.cancel();
    };
  }, [debouncedFetchJobs]);

  const handleJobDeleted = (jobId: string) => {
    setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Active Jobs</h2>
          <p className="mt-1 text-sm text-gray-500">Manage currently open job postings and assignments</p>
        </div>
        <button 
          onClick={() => router.push('/admin/jobs/new')}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Job
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <div className="flex-1 max-w-md">
              <label htmlFor="search" className="sr-only">Search jobs</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <Input
                  id="search"
                  type="search"
                  placeholder="Search jobs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span className="font-medium">{jobs.length}</span>
              <span>jobs found</span>
            </div>
          </div>
        </div>

        <JobsTable 
          jobs={jobs} 
          clients={clients}
          isLoading={isLoading} 
          error={error} 
          onJobDeleted={handleJobDeleted} 
        />
      </div>
    </div>
  );
} 