"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Job } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Client } from '@/lib/api';

export default function StaffingRequestsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (authLoading || !user) return;
    const fetchJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch client profile by userId
        const clientRes = await apiClient.getClients();
        const client = (clientRes.data || []).find((c: Client) => c.userId === user.id) || null;
        if (!client) throw new Error('No client profile found for this user');
        // Fetch jobs and filter by client.id
        const res = await apiClient.getJobs({ page: 1, limit: 100 });
        const allJobs = res.data?.items || [];
        const clientJobs = allJobs.filter(j => j.clientId === client.id);
        // Debug output
        console.log('Client profile:', client);
        console.log('All jobs:', allJobs);
        console.log('Filtered client jobs:', clientJobs);
        setJobs(clientJobs);
      } catch {
        setError('Failed to fetch staffing requests');
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, [user, authLoading]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Staffing Requests</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => router.push('/client/staffing/requests/new')}
        >
          + New Request
        </button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : jobs.length === 0 ? (
        <div>No staffing requests found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map(job => (
            <div key={job.id} className="bg-white rounded-lg shadow p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">{job.title}</h2>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 text-xs rounded font-semibold ${job.status === 'active' ? 'bg-green-100 text-green-700' : job.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : job.status === 'completed' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{job.status}</span>
                </div>
                <div className="text-sm text-gray-600 mb-1">Start: {job.startDate}</div>
                <div className="text-sm text-gray-600 mb-2">End: {job.endDate}</div>
                <div className="text-xs text-gray-400">ID: {job.id}</div>
              </div>
              <div className="mt-4 flex justify-end gap-2">
                <button
                  className="px-4 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 text-sm font-medium"
                  onClick={() => router.push(`/client/staffing/requests/${job.id}`)}
                >
                  View
                </button>
                <button
                  className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
                  onClick={() => router.push(`/client/staffing/requests/edit/${job.id}`)}
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 