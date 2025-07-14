'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Client, Timesheet, Worker, Job } from '@/lib/api';

interface EnrichedTimesheet extends Timesheet {
  workerName: string;
  jobTitle: string;
}

export default function ApprovedTimesheetsPage() {
  const { user } = useAuth();
  const [timesheets, setTimesheets] = useState<EnrichedTimesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setClient] = useState<Client | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      try {
        // Get all clients and find the one for this user
        const clientsResponse = await apiClient.getClients();
        const clients = clientsResponse.data || [];
        const clientProfile = clients.find((c: Client) => c.userId === user.id);
        
        if (!clientProfile) {
          console.error('Client profile not found for user:', user.id);
          return;
        }
        
        setClient(clientProfile);

        // Get all timesheets from the API
        const timesheetsResponse = await apiClient.getTimesheets();
        const allTimesheets = timesheetsResponse.data || [];
        
        // Filter for approved timesheets for this client
        const approvedTimesheets = allTimesheets.filter(
          (timesheet: Timesheet) => 
            timesheet.clientId === clientProfile.id && 
            timesheet.status === 'approved'
        );

        // Get worker names for display
        const workersResponse = await apiClient.getWorkers();
        const workers = workersResponse.data?.items || [];
        const jobsResponse = await apiClient.getJobs();
        const jobs = jobsResponse.data?.items || [];

        const enrichedTimesheets = approvedTimesheets.map((timesheet: Timesheet) => {
          const worker = workers.find((w: Worker) => w.id === timesheet.workerId);
          const job = jobs.find((j: Job) => j.id === timesheet.jobId);
          
          return {
            ...timesheet,
            workerName: worker ? `${worker.firstName} ${worker.lastName}` : 'Unknown Worker',
            jobTitle: job ? job.title : 'Unknown Job',
          };
        });

        setTimesheets(enrichedTimesheets);
      } catch (error) {
        console.error('Error loading approved timesheets:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading approved timesheets...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Approved Timesheets</h1>
        <p className="text-gray-600">
          View all approved timesheets for your workers
        </p>
      </div>

      {timesheets.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Approved Timesheets</h3>
          <p className="text-gray-500">Approved timesheets will appear here once you approve them.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Worker
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hours
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Approved Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timesheets.map((timesheet) => (
                  <tr key={timesheet.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {timesheet.workerName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {timesheet.jobTitle}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(timesheet.weekStarting).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {timesheet.totalHours} hours
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {timesheet.notes || 'No description provided'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {timesheet.approvedAt ? new Date(timesheet.approvedAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
} 