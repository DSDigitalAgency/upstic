'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, Assignment, Worker, Job, Client } from '@/lib/api';

interface AssignmentWithDetails extends Assignment {
  worker?: Worker;
  job?: Job;
  client?: Client;
}

export default function AssignmentsPage() {
  const router = useRouter();
  const [assignments, setAssignments] = useState<AssignmentWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'active' | 'completed' | 'cancelled'>('all');

  const fetchAssignments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Fetch assignments
      const assignmentsResponse = await apiClient.getAssignments();
      const assignmentsData = assignmentsResponse.data || [];
      // Fetch workers, jobs, and clients for details
      const [workersResponse, jobsResponse, clientsResponse] = await Promise.all([
        apiClient.getWorkers(1, 100),
        apiClient.getJobs({ limit: 100 }),
        apiClient.getClients(),
      ]);
      // Combine data
      const assignmentsWithDetails: AssignmentWithDetails[] = assignmentsData.map(assignment => ({
        ...assignment,
        worker: (workersResponse.data?.items || []).find(w => w.id === assignment.workerId),
        job: (jobsResponse.data?.items || []).find(j => j.id === assignment.jobId),
        client: (clientsResponse.data || []).find(c => c.id === assignment.clientId),
      }));
      setAssignments(assignmentsWithDetails);
    } catch (err) {
      setError('Failed to load assignments');
      console.error('Assignments fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const handleStatusUpdate = async () => {
    try {
      const response = await apiClient.put();
      
      if (response.success) {
        fetchAssignments(); // Refresh the list
      } else {
        setError('Failed to update assignment status');
      }
    } catch (err) {
      setError('Failed to update assignment status');
      console.error('Status update error:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return 'bg-blue-100 text-blue-800';
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return 'Upcoming';
      case 'ACTIVE':
        return 'Active';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true;
    return assignment.status === filter;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Assignments Management</h1>
        <p className="text-gray-600">View and manage all job assignments</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
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

      {/* Filter Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'All', count: assignments.length },
              { key: 'pending', label: 'Pending', count: assignments.filter(a => a.status === 'pending').length },
              { key: 'active', label: 'Active', count: assignments.filter(a => a.status === 'active').length },
              { key: 'completed', label: 'Completed', count: assignments.filter(a => a.status === 'completed').length },
              { key: 'cancelled', label: 'Cancelled', count: assignments.filter(a => a.status === 'cancelled').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as 'all' | 'pending' | 'active' | 'completed' | 'cancelled')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  filter === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Assignments Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredAssignments.map((assignment) => (
            <li key={assignment.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {assignment.job?.title || assignment.title || assignment.id}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {assignment.client?.companyName || assignment.clientId} • {assignment.job?.location || assignment.location || 'N/A'}
                      </p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          {new Date(assignment.startDate).toLocaleDateString()} - {new Date(assignment.endDate).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{assignment.job?.shift || assignment.shiftType || 'N/A'} Shift</span>
                        <span>•</span>
                        <span>£{assignment.rate || assignment.job?.rate}/hr</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${getStatusColor(assignment.status)}`}>
                        {getStatusLabel(assignment.status)}
                      </span>
                    </div>
                  </div>
                  {/* Worker Information */}
                  {assignment.worker && (
                    <div className="mt-3 flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {assignment.worker.firstName.charAt(0)}{assignment.worker.lastName.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {assignment.worker.firstName} {assignment.worker.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          {assignment.worker.skills?.join(', ')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="ml-4 flex-shrink-0 flex space-x-2">
                  {assignment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate()}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        Activate
                      </button>
                      <button
                        onClick={() => handleStatusUpdate()}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                      >
                        Cancel
                      </button>
                    </>
                  )}
                  
                  {assignment.status === 'active' && (
                    <button
                      onClick={() => handleStatusUpdate()}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Complete
                    </button>
                  )}
                  
                  <button
                    onClick={() => router.push(`/admin/jobs/assignments/${assignment.id}`)}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
        
        {filteredAssignments.length === 0 && (
          <div className="px-6 py-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'all' 
                ? 'Get started by creating a new assignment from a job.'
                : `No ${filter} assignments found.`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 