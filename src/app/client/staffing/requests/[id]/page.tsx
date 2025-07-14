"use client";
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { Job } from '@/lib/api';

export default function JobDetailPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;
    const fetchJob = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiClient.getJobs({ page: 1, limit: 100 });
        const found = res.data?.items.find((j: Job) => j.id === jobId) || null;
        setJob(found);
        if (!found) setError('Job not found.');
      } catch {
        setError('Failed to fetch job details.');
      } finally {
        setLoading(false);
      }
    };
    fetchJob();
  }, [jobId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!job) return null;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6 mt-6">
      <button
        className="mb-4 text-blue-600 hover:underline text-sm"
        onClick={() => router.push('/client/staffing/requests')}
      >
        &larr; Back to Staffing Requests
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{job.title}</h1>
      <div className="flex items-center gap-2 mb-4">
        <span className={`px-2 py-1 text-xs rounded font-semibold ${job.status === 'active' ? 'bg-green-100 text-green-700' : job.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : job.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{job.status}</span>
      </div>
      <div className="mb-2 text-gray-700"><b>Description:</b> {job.description}</div>
      <div className="mb-2 text-gray-700"><b>Location:</b> {job.location}</div>
      <div className="mb-2 text-gray-700"><b>Start Date:</b> {job.startDate}</div>
      <div className="mb-2 text-gray-700"><b>End Date:</b> {job.endDate}</div>
      <div className="mb-2 text-gray-700"><b>Experience:</b> {job.experience} years</div>
      <div className="mb-2 text-gray-700"><b>Salary:</b> £{job.salaryMin} - £{job.salaryMax} {job.salary?.currency || ''}</div>
      <div className="mb-2 text-gray-700"><b>Skills:</b> {job.skills?.join(', ')}</div>
      <div className="mb-2 text-gray-700"><b>Requirements:</b> {job.requirements?.join(', ')}</div>
      <div className="mb-2 text-gray-700"><b>Responsibilities:</b> {Array.isArray(job.responsibilities) ? job.responsibilities.join(', ') : job.responsibilities}</div>
      <div className="mt-4 text-xs text-gray-400">Job ID: {job.id}</div>
    </div>
  );
} 