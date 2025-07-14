'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, Assignment } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function WorkerAssignmentsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'active' | 'completed'>('all');

  const fetchAssignments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch assignments, workers, and jobs for this worker
      const [assignmentsResponse, workersResponse, jobsResponse] = await Promise.all([
        apiClient.getAssignments(),
        apiClient.getWorkers(),
        apiClient.getJobs()
      ]);
      
      const allAssignments = assignmentsResponse.data || [];
      const workers = workersResponse.data?.items || [];
      const jobs = jobsResponse.data?.items || [];
      
      // Find the worker ID for the current user
      const currentWorker = workers.find(worker => worker.userId === user?.id);
      const workerId = currentWorker?.id;
      
      // Filter assignments for current worker and map job data
      const workerAssignments = allAssignments
        .filter(assignment => assignment.workerId === workerId)
        .map(assignment => {
          const job = jobs.find(j => j.id === assignment.jobId);
          return {
            ...assignment,
            title: job?.title || `Job ${assignment.jobId}`,
            description: job?.description || assignment.description,
            location: job?.location || assignment.location
          };
        });
      
      setAssignments(workerAssignments);
    } catch (err) {
      setError('Failed to load assignments');
      console.error('Assignments fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAssignments();
    }
  }, [user, fetchAssignments]);

  const handleAcceptAssignment = async (assignmentId: string) => {
    try {
      const response = await apiClient.put(`/assignments/${assignmentId}`, {
        status: 'active'
      });
      
      if (response.success) {
        fetchAssignments(); // Refresh the list
      } else {
        setError('Failed to accept assignment');
      }
    } catch (err) {
      setError('Failed to accept assignment');
      console.error('Accept assignment error:', err);
    }
  };

  const handleRejectAssignment = async (assignmentId: string) => {
    try {
      const response = await apiClient.put(`/assignments/${assignmentId}`, {
        status: 'cancelled'
      });
      
      if (response.success) {
        fetchAssignments(); // Refresh the list
      } else {
        setError('Failed to reject assignment');
      }
    } catch (err) {
      setError('Failed to reject assignment');
      console.error('Reject assignment error:', err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    if (filter === 'all') return true;
    return assignment.status === filter.toUpperCase();
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
        <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
        <p className="text-gray-600">View and manage your job assignments</p>
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
              { key: 'upcoming', label: 'Pending', count: assignments.filter(a => a.status === 'pending').length },
              { key: 'active', label: 'Active', count: assignments.filter(a => a.status === 'active').length },
              { key: 'completed', label: 'Completed', count: assignments.filter(a => a.status === 'completed').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as 'all' | 'upcoming' | 'active' | 'completed')}
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

      {/* Assignments List */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredAssignments.map((assignment) => (
            <li key={assignment.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {assignment.title || `Job ${assignment.jobId}`}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Client #{assignment.clientId} • {assignment.location || 'Location TBD'}
                      </p>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                        <span>
                          {new Date(assignment.startDate).toLocaleDateString()} - {new Date(assignment.endDate).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <span>{assignment.hoursPerWeek} hours/week</span>
                        <span>•</span>
                        <span>£{assignment.rate}/hr</span>
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${getStatusColor(assignment.status)}`}>
                        {getStatusLabel(assignment.status)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Assignment Details */}
                  <div className="mt-3 text-sm text-gray-500">
                    <p>{assignment.description}</p>
                    {assignment.notes && (
                      <p className="mt-1 italic">Notes: {assignment.notes}</p>
                    )}
                  </div>

                  {/* Assignment Notes */}
                  {assignment.notes && (
                    <div className="mt-3 text-sm text-gray-500">
                      <p><strong>Notes:</strong> {assignment.notes}</p>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="ml-4 flex-shrink-0 flex space-x-2">
                  {assignment.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleAcceptAssignment(assignment.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectAssignment(assignment.id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  
                  {assignment.status === 'active' && (
                    <button
                      onClick={() => router.push(`/worker/timesheets/submit?assignmentId=${assignment.id}`)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Submit Timesheet
                    </button>
                  )}
                  
                  <button
                    onClick={() => router.push(`/worker/assignments/${assignment.id}`)}
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
                ? 'You don\'t have any assignments yet. Browse available jobs to get started.'
                : `No ${filter} assignments found.`
              }
            </p>
            {filter === 'all' && (
              <div className="mt-6">
                <button
                  onClick={() => router.push('/worker/jobs')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Browse Jobs
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 