'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/demo/func/api';
import type { Worker } from '@/demo/func/api';
import { LoadingButton } from '@/components/ui/loading-button';

export default function PendingWorkers() {
  const [pendingWorkers, setPendingWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingWorker, setProcessingWorker] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingWorkers();
  }, []);

  const fetchPendingWorkers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.getWorkers(1, 100);
      if (response.success && response.data) {
        const pending = response.data.items.filter(worker => worker.status === 'pending');
        setPendingWorkers(pending);
      } else {
        setError('Failed to load pending workers');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Error fetching pending workers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (workerId: string) => {
    setProcessingWorker(workerId);
    try {
      const result = await apiClient.updateWorker(workerId, { status: 'approved' });
      if (result.success) {
        // Refresh the list
        await fetchPendingWorkers();
      } else {
        alert('Failed to approve worker');
      }
    } catch (error) {
      console.error('Error approving worker:', error);
      alert('Failed to approve worker');
    } finally {
      setProcessingWorker(null);
    }
  };

  const handleReject = async (workerId: string) => {
    setProcessingWorker(workerId);
    try {
      const result = await apiClient.updateWorker(workerId, { status: 'rejected' });
      if (result.success) {
        // Refresh the list
        await fetchPendingWorkers();
      } else {
        alert('Failed to reject worker');
      }
    } catch (error) {
      console.error('Error rejecting worker:', error);
      alert('Failed to reject worker');
    } finally {
      setProcessingWorker(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Worker Approvals</h1>
          <p className="text-gray-600 mt-1">
            Review and approve worker applications
          </p>
        </div>
        <button
          onClick={fetchPendingWorkers}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {pendingWorkers.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Approvals</h3>
          <p className="text-gray-600">All worker applications have been reviewed.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pendingWorkers.map((worker) => (
            <div key={worker.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {worker.firstName} {worker.lastName}
                  </h3>
                  <p className="text-gray-600">{worker.email}</p>
                  <p className="text-sm text-gray-500">Phone: {worker.phone}</p>
                </div>
                <div className="flex space-x-2">
                  <LoadingButton
                    onClick={() => handleApprove(worker.id)}
                    loading={processingWorker === worker.id}
                    disabled={processingWorker === worker.id}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm"
                  >
                    Approve
                  </LoadingButton>
                  <LoadingButton
                    onClick={() => handleReject(worker.id)}
                    loading={processingWorker === worker.id}
                    disabled={processingWorker === worker.id}
                    variant="secondary"
                    className="px-4 py-2 rounded-lg text-sm"
                  >
                    Reject
                  </LoadingButton>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Date of Birth:</span> {worker.dateOfBirth || 'Not provided'}</p>
                    <p><span className="font-medium">Address:</span> {worker.address || 'Not provided'}</p>
                    <p><span className="font-medium">City:</span> {worker.city || 'Not provided'}</p>
                    <p><span className="font-medium">State:</span> {worker.state || 'Not provided'}</p>
                    <p><span className="font-medium">ZIP:</span> {worker.zipCode || 'Not provided'}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Professional Information</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Skills:</span> {worker.skills?.join(', ') || 'Not provided'}</p>
                    <p><span className="font-medium">Experience:</span> Experience details available in profile</p>
                    <p><span className="font-medium">Certifications:</span> {worker.certifications?.join(', ') || 'Not provided'}</p>
                    <p><span className="font-medium">Hourly Rate:</span> Rate details available in profile</p>
                  </div>
                </div>
              </div>

              {worker.emergencyContact && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Emergency Contact</h4>
                  <div className="text-sm text-gray-600">
                    <p><span className="font-medium">Name:</span> {worker.emergencyContact.name}</p>
                    <p><span className="font-medium">Phone:</span> {worker.emergencyContact.phone}</p>
                    <p><span className="font-medium">Relationship:</span> {worker.emergencyContact.relationship}</p>
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500">
                <p>Submitted: {new Date(worker.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 