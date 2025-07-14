"use client";
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Timesheet, Worker, Job, Client, Assignment } from '@/lib/api';

export default function ClientTimesheetsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
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
        // Fetch all timesheets for this client
        const timesheetsRes = await apiClient.getTimesheets();
        const clientTimesheets = (timesheetsRes.data || []).filter(t => t.clientId === client.id);
        setTimesheets(clientTimesheets);
        // Fetch all workers
        const workersRes = await apiClient.getWorkers(1, 100);
        setWorkers(workersRes.data?.items || []);
        // Fetch all jobs
        const jobsRes = await apiClient.getJobs({ page: 1, limit: 100 });
        setJobs(jobsRes.data?.items || []);
        // Fetch all assignments
        const assignmentsRes = await apiClient.getAssignments();
        setAssignments(assignmentsRes.data || []);
      } catch {
        setError('Failed to load timesheets.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, authLoading]);

  const handleApprove = async (timesheetId: string) => {
    try {
      await apiClient.put(`/timesheets/${timesheetId}`, {
        status: 'approved',
        approvedAt: new Date().toISOString(),
        approvedBy: user?.id,
      });
      setTimesheets(prev => prev.map(t => t.id === timesheetId ? { ...t, status: 'approved' } : t));
    } catch {
      alert('Failed to approve timesheet.');
    }
  };

  const handleReject = async (timesheetId: string) => {
    try {
      await apiClient.put(`/timesheets/${timesheetId}`, {
        status: 'rejected',
        rejectedReason: 'Rejected by client',
      });
      setTimesheets(prev => prev.map(t => t.id === timesheetId ? { ...t, status: 'rejected' } : t));
    } catch {
      alert('Failed to reject timesheet.');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Timesheets</h1>
      {timesheets.length === 0 ? (
        <div>No timesheets found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 bg-white rounded shadow">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-gray-900">Worker</th>
                <th className="px-4 py-2 text-left text-gray-900">Job</th>
                <th className="px-4 py-2 text-left text-gray-900">Date</th>
                <th className="px-4 py-2 text-left text-gray-900">Start</th>
                <th className="px-4 py-2 text-left text-gray-900">End</th>
                <th className="px-4 py-2 text-left text-gray-900">Hours</th>
                <th className="px-4 py-2 text-left text-gray-900">Status</th>
                <th className="px-4 py-2 text-left text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody>
              {timesheets.map(timesheet => {
                const worker = workers.find(w => w.id === timesheet.workerId);
                const assignment = assignments.find(a => a.id === timesheet.assignmentId);
                const job = jobs.find(j => j.id === assignment?.id);
                return (
                  <tr key={timesheet.id} className="border-t">
                    <td className="px-4 py-2 text-gray-900">{worker ? `${worker.firstName} ${worker.lastName}` : timesheet.workerId}</td>
                    <td className="px-4 py-2 text-gray-900">{job?.title || 'Unknown'}</td>
                    <td className="px-4 py-2 text-gray-900">{timesheet.date}</td>
                    <td className="px-4 py-2 text-gray-900">{timesheet.startTime}</td>
                    <td className="px-4 py-2 text-gray-900">{timesheet.endTime}</td>
                    <td className="px-4 py-2 text-gray-900">{timesheet.totalHours}</td>
                    <td className="px-4 py-2 text-gray-900">{timesheet.status}</td>
                    <td className="px-4 py-2">
                      {timesheet.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                            onClick={() => handleApprove(timesheet.id)}
                          >
                            Approve
                          </button>
                          <button
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                            onClick={() => handleReject(timesheet.id)}
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
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