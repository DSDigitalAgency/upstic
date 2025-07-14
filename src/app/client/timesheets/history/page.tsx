'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Client, Timesheet, Worker, Job } from '@/lib/api';

interface EnrichedTimesheet extends Timesheet {
  workerName: string;
  jobTitle: string;
}

export default function TimesheetHistoryPage() {
  const { user } = useAuth();
  const [timesheets, setTimesheets] = useState<EnrichedTimesheet[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setClient] = useState<Client | null>(null);
  const [filter, setFilter] = useState<'ALL' | 'pending' | 'approved' | 'rejected'>('ALL');

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
        
        // Filter for timesheets for this client
        const clientTimesheets = allTimesheets.filter(
          (timesheet: Timesheet) => timesheet.clientId === clientProfile.id
        );

        // Get worker names for display
        const workersResponse = await apiClient.getWorkers();
        const workers = workersResponse.data?.items || [];
        const jobsResponse = await apiClient.getJobs();
        const jobs = jobsResponse.data?.items || [];

        const enrichedTimesheets = clientTimesheets.map((timesheet: Timesheet) => {
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
        console.error('Error loading timesheet history:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const filteredTimesheets = timesheets.filter(timesheet => {
    if (filter === 'ALL') return true;
    return timesheet.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading timesheet history...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Timesheet History</h1>
        <p className="text-gray-600">
          View all timesheets and their current status
        </p>
      </div>

      {/* Filter Controls */}
      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              filter === 'ALL'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All ({timesheets.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              filter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Pending ({timesheets.filter(t => t.status === 'pending').length})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              filter === 'approved'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Approved ({timesheets.filter(t => t.status === 'approved').length})
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              filter === 'rejected'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Rejected ({timesheets.filter(t => t.status === 'rejected').length})
          </button>
        </div>
      </div>

      {filteredTimesheets.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Timesheets Found</h3>
          <p className="text-gray-500">
            {filter === 'ALL' 
              ? 'No timesheets have been submitted yet.'
              : `No ${filter.toLowerCase()} timesheets found.`
            }
          </p>
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
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTimesheets.map((timesheet) => (
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(timesheet.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {timesheet.notes || 'No description provided'}
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