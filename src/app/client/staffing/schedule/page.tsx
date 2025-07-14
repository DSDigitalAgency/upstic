"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Assignment, Worker, Job, Client } from '@/lib/api';

export default function SchedulePage() {
  const { user, isLoading: authLoading } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading || !user) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch client profile
        const clientRes = await apiClient.getClients();
        const client = (clientRes.data || []).find((c: Client) => c.userId === user.id) || null;
        if (!client) throw new Error('No client profile found for this user');
        // Fetch assignments for this client
        const assignmentsRes = await apiClient.getAssignments();
        const clientAssignments = (assignmentsRes.data || []).filter(a => a.clientId === client.id);
        setAssignments(clientAssignments);
        // Fetch all workers
        const workersRes = await apiClient.getWorkers(1, 100);
        setWorkers(workersRes.data?.items || []);
        // Fetch all jobs
        const jobsRes = await apiClient.getJobs({ page: 1, limit: 100 });
        setJobs(jobsRes.data?.items || []);
      } catch {
        setError('Failed to load schedule.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, authLoading]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Schedule</h1>
      {assignments.length === 0 ? (
        <div>No assignments found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white rounded shadow">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-gray-900">Job Title</th>
                <th className="px-4 py-2 text-left text-gray-900">Worker</th>
                <th className="px-4 py-2 text-left text-gray-900">Start Date</th>
                <th className="px-4 py-2 text-left text-gray-900">End Date</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map(assignment => {
                const worker = workers.find(w => w.id === assignment.workerId);
                const job = jobs.find(j => j.id === assignment.jobId || j.id === assignment.id);
                return (
                  <tr key={assignment.id} className="border-t">
                    <td className="px-4 py-2 text-gray-900">{job?.title || 'Job'}</td>
                    <td className="px-4 py-2 text-gray-900">{worker ? `${worker.firstName} ${worker.lastName}` : assignment.workerId}</td>
                    <td className="px-4 py-2 text-gray-900">{assignment.startDate}</td>
                    <td className="px-4 py-2 text-gray-900">{assignment.endDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
} 