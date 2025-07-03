'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { apiClient, Worker } from '@/lib/api';

export default function WorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1,
    hasNext: false,
    hasPrev: false,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState<Worker | null>(null);

  const fetchWorkers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getWorkers(pagination.page, pagination.limit);
      if (response.success && response.data) {
        const data = response.data;
        setWorkers(data.items || []);
        setPagination(prev => ({
          ...prev,
          total: data.total,
          pages: data.pages,
          hasNext: data.hasNext,
          hasPrev: data.hasPrev,
        }));
      } else {
        setError(response.error || 'Failed to fetch workers.');
        setWorkers([]);
      }
    } catch {
      setError('An unexpected error occurred.');
      setWorkers([]);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  useEffect(() => {
    fetchWorkers();
  }, [fetchWorkers]);

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const openDeleteModal = (worker: Worker) => {
    setWorkerToDelete(worker);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setWorkerToDelete(null);
    setIsModalOpen(false);
  };

  const handleDeleteWorker = async () => {
    if (workerToDelete) {
      const response = await apiClient.deleteWorker(workerToDelete.id);
      if (response.success) {
        fetchWorkers(); // Refresh the list
        closeDeleteModal();
      } else {
        alert(`Error: ${response.error}`);
      }
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Workers</h2>
        <p className="text-gray-600">Manage nurses, doctors, and other healthcare workers</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">All Workers ({pagination.total})</h3>
          </div>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="text-center text-gray-500">Loading workers...</div>
          ) : error ? (
            <div className="text-center text-red-500">Error: {error}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {workers.map((worker) => (
                      <tr key={worker.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{worker.firstName} {worker.lastName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{worker.email}</div>
                          <div>{worker.phone}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            worker.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {worker.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(worker.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                          <Link href={`/admin/users/workers/${worker.id}`} className="text-indigo-600 hover:text-indigo-900">
                            Edit
                          </Link>
                          <button onClick={() => openDeleteModal(worker)} className="text-red-600 hover:text-red-900">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Pagination Controls and Modal */}
              {isModalOpen && workerToDelete && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                  <div className="p-8 border w-96 shadow-lg rounded-md bg-white">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900">Confirm Deletion</h3>
                      <p className="text-sm text-gray-500 mt-2">Are you sure you want to delete {workerToDelete.firstName} {workerToDelete.lastName}? This action cannot be undone.</p>
                      <div className="mt-4 flex justify-center space-x-4">
                        <button onClick={closeDeleteModal} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">Cancel</button>
                        <button onClick={handleDeleteWorker} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-700">
                  Showing page {pagination.page} of {pagination.pages}
                </p>
                <div className="space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNext}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 