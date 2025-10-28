'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/demo/func/api';
import { Assignment, Worker, Job } from '@/demo/func/api';
import DBSStatusBadge from '@/components/DBSStatusBadge';

interface AssignmentWithDetails extends Assignment {
  worker?: Worker;
  job?: Job;
}

export function AssignmentDetailsClient({ assignmentId }: { assignmentId: string }) {
  const router = useRouter();
  const [assignment, setAssignment] = useState<AssignmentWithDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchAssignmentDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch assignment using assignmentId
      const assignmentResponse = await apiClient.getAssignmentById(assignmentId);
      if (!assignmentResponse.success || !assignmentResponse.data) {
        throw new Error('Failed to load assignment details');
      }

      // Fetch worker and job details
      const workerResponse = await apiClient.getWorkers();
      const workersResponse = await apiClient.getJobs();
      const jobs = workersResponse.data?.items || [];
      const job = jobs.find(j => j.title === assignmentResponse.data!.title);

      setAssignment({
        ...assignmentResponse.data,
        worker: (workerResponse.data?.items || []).find(w => w.id === assignmentResponse.data!.workerId),
        job
      });
    } catch (err) {
      setError('Failed to load assignment details');
      console.error('Assignment details fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [assignmentId]);

  useEffect(() => {
    fetchAssignmentDetails();
  }, [fetchAssignmentDetails]);

  const handleStatusUpdate = async () => {
    if (!assignment) return;

    setIsUpdating(true);
    try {
      const response = await apiClient.put();
      
      if (response.success) {
        fetchAssignmentDetails(); // Refresh the data
      } else {
        setError('Failed to update assignment status');
      }
    } catch (err) {
      setError('Failed to update assignment status');
      console.error('Status update error:', err);
    } finally {
      setIsUpdating(false);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <p className="text-sm text-red-700 mt-1">Assignment not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{assignment.title || assignment.id}</h1>
            <p className="text-gray-600">{assignment.location || 'N/A'} • {assignment.job?.location || 'N/A'}</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ring-1 ring-inset ${getStatusColor(assignment.status)}`}>
              {getStatusLabel(assignment.status)}
            </span>
            <button
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Back
            </button>
          </div>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Assignment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Assignment Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Assignment Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Date</label>
                <p className="text-sm text-gray-900 mt-1">{new Date(assignment.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Date</label>
                <p className="text-sm text-gray-900 mt-1">{new Date(assignment.endDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Shift Type</label>
                <p className="text-sm text-gray-900 mt-1">{assignment.shiftType || assignment.job?.shift || 'N/A'} Shift</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Hourly Rate</label>
                <p className="text-sm text-gray-900 mt-1">£{assignment.hourlyRate || assignment.rate || assignment.job?.rate}/hr</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Total Hours</label>
                <p className="text-sm text-gray-900 mt-1">{assignment.totalHours || assignment.hoursPerWeek || 'N/A'} hours</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <p className="text-sm text-gray-900 mt-1">{getStatusLabel(assignment.status)}</p>
              </div>
            </div>
            
            {assignment.notes && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700">Notes</label>
                <p className="text-sm text-gray-900 mt-1">{assignment.notes}</p>
              </div>
            )}
          </div>

          {/* Job Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Job Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Job Title</label>
                <p className="text-sm text-gray-900 mt-1">{assignment.job?.title || assignment.title || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <p className="text-sm text-gray-900 mt-1">{assignment.job?.location || assignment.location || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <p className="text-sm text-gray-900 mt-1">{assignment.job?.department || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Shift</label>
                <p className="text-sm text-gray-900 mt-1">{assignment.job?.shift || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="text-sm text-gray-900 mt-1">{assignment.job?.description || assignment.description || 'N/A'}</p>
              </div>
            </div>
          </div>

          {/* Worker Information */}
          {assignment.worker && (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Worker Information</h2>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-lg font-medium text-gray-700">
                      {assignment.worker.firstName.charAt(0)}{assignment.worker.lastName.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    {assignment.worker.firstName} {assignment.worker.lastName}
                  </h3>
                  <p className="text-sm text-gray-500">{assignment.worker.email}</p>
                  <p className="text-sm text-gray-500">{assignment.worker.skills?.join(', ')}</p>
                </div>
              </div>
              
              {/* DBS Verification Status */}
              {assignment.worker.dbsVerification && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">DBS Verification Status</h4>
                  <DBSStatusBadge verification={assignment.worker.dbsVerification} showDetails={true} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Status Actions</h3>
            <div className="space-y-3">
              {assignment.status === 'pending' && (
                <>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={isUpdating}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {isUpdating ? 'Updating...' : 'Activate Assignment'}
                  </button>
                  <button
                    onClick={handleStatusUpdate}
                    disabled={isUpdating}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
                  >
                    {isUpdating ? 'Updating...' : 'Cancel Assignment'}
                  </button>
                </>
              )}
              
              {assignment.status === 'active' && (
                <button
                  onClick={handleStatusUpdate}
                  disabled={isUpdating}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Mark as Completed'}
                </button>
              )}
            </div>
          </div>

          {/* Assignment Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Details</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Assignment ID</span>
                <p className="text-sm text-gray-900">{assignment.id}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Created</span>
                <p className="text-sm text-gray-900">{assignment.createdAt ? new Date(assignment.createdAt).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Last Updated</span>
                <p className="text-sm text-gray-900">{assignment.updatedAt ? new Date(assignment.updatedAt).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 