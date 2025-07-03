'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { apiClient, Client } from '@/lib/api';

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.getClients();
      if (response.success && response.data) {
        setClients(response.data || []);
      } else {
        setError(response.error || 'Failed to fetch clients.');
        setClients([]);
      }
    } catch {
      setError('An unexpected error occurred.');
      setClients([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const openDeleteModal = (client: Client) => {
    setClientToDelete(client);
    setIsModalOpen(true);
  };

  const closeDeleteModal = () => {
    setClientToDelete(null);
    setIsModalOpen(false);
  };

  const handleDeleteClient = async () => {
    if (clientToDelete) {
      const response = await apiClient.deleteClient(clientToDelete.id);
      if (response.success) {
        fetchClients();
        closeDeleteModal();
      } else {
        alert(`Error: ${response.error}`);
      }
    }
  };

  const getStatusClasses = (status: Client['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'TRIAL':
        return 'bg-yellow-100 text-yellow-800';
      case 'SUSPENDED':
        return 'bg-red-100 text-red-800';
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Clients</h2>
        <p className="text-gray-600">Manage hospitals, clinics, and care homes</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">All Clients ({clients.length})</h3>
            <Link href="/admin/users/clients/new">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Add New Client
              </button>
            </Link>
          </div>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="text-center text-gray-500">Loading clients...</div>
          ) : error ? (
            <div className="text-center text-red-500">Error: {error}</div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company Name</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {clients.map((client, index) => (
                      <tr key={`${client.id}-${index}`}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.companyName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.industry}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.subscriptionPlan}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClasses(client.status)}`}>
                            {client.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(client.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                          <Link href={`/admin/users/clients/${client.id}`} className="text-indigo-600 hover:text-indigo-900">
                            Edit
                          </Link>
                          <button onClick={() => openDeleteModal(client)} className="text-red-600 hover:text-red-900">
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {isModalOpen && clientToDelete && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
                  <div className="p-8 border w-96 shadow-lg rounded-md bg-white">
                    <div className="text-center">
                      <h3 className="text-2xl font-bold text-gray-900">Confirm Deletion</h3>
                      <p className="text-sm text-gray-500 mt-2">Are you sure you want to delete {clientToDelete.companyName}? This action cannot be undone.</p>
                      <div className="mt-4 flex justify-center space-x-4">
                        <button onClick={closeDeleteModal} className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400">Cancel</button>
                        <button onClick={handleDeleteClient} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">Delete</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 