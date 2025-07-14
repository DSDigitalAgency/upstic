"use client";

import React, { useEffect, useState, useCallback } from 'react';
import JobsTable from '@/components/JobsTable';
import { apiClient, Job, Client } from '@/demo/func/api';

export default function RejectedJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobsRes, clientsRes] = await Promise.all([
        apiClient.getJobs({ limit: 100 }),
        apiClient.getClients(),
      ]);
      if (jobsRes.success && jobsRes.data && clientsRes.success && clientsRes.data) {
        setJobs(jobsRes.data.items.filter(job => job.status === 'inactive'));
        setClients(clientsRes.data);
      } else {
        setError(jobsRes.error || clientsRes.error || 'Failed to fetch jobs or clients');
      }
    } catch {
      setError('Failed to fetch jobs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleJobDeleted = (jobId: string) => {
    setJobs(jobs.filter(job => job.id !== jobId));
  };

  // Removed unused function

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rejected Jobs</h1>
        <p className="text-gray-600">Manage jobs that have been rejected</p>
      </div>

      <JobsTable
        jobs={jobs}
        clients={clients}
        isLoading={loading}
        error={error}
        onJobDeleted={handleJobDeleted}
      />
    </div>
  );
} 