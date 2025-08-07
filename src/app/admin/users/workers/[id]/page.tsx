'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient, Worker } from '@/lib/api';

export default function EditWorkerPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [worker, setWorker] = useState<Partial<Worker>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchWorker = async () => {
        setIsLoading(true);
        const response = await apiClient.getWorkers();
        if (response.success && response.data) {
          const worker = response.data.items.find(w => w.id === id);
          if (worker) {
            setWorker(worker);
          } else {
            setError('Worker not found');
          }
        } else {
          setError('Failed to fetch worker data.');
        }
        setIsLoading(false);
      };
      fetchWorker();
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'skills') {
      setWorker(prev => ({ ...prev, skills: value.split(',').map(skill => skill.trim()) }));
    } else {
      setWorker(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    const response = await apiClient.updateWorker(id, worker);
    if (response.success) {
      router.push('/admin/users/workers');
    } else {
      setError(response.error || 'Failed to update worker.');
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="text-center p-8">Loading...</div>;
  if (error) return <div className="text-center p-8 text-red-500">Error: {error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Worker: {worker.firstName} {worker.lastName}</h2>
      
      <div className="bg-white p-8 rounded-lg shadow">
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-900">First Name</label>
              <input type="text" name="firstName" id="firstName" value={worker.firstName || ''} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white" />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-900">Last Name</label>
              <input type="text" name="lastName" id="lastName" value={worker.lastName || ''} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white" />
            </div>
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900">Email</label>
            <input type="email" name="email" id="email" value={worker.email || ''} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white" />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-900">Phone</label>
            <input type="tel" name="phone" id="phone" value={worker.phone || ''} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-900">Address</label>
              <input type="text" name="address" id="address" value={worker.address || ''} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white" />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-900">City</label>
              <input type="text" name="city" id="city" value={worker.city || ''} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white" />
            </div>
          </div>

          <div>
            <label htmlFor="skills" className="block text-sm font-medium text-gray-900">Skills (comma-separated)</label>
            <input type="text" name="skills" id="skills" value={Array.isArray(worker.skills) ? worker.skills.join(', ') : ''} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-white" />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-900">Status (not editable)</label>
            <select name="status" id="status" value={worker.status || ''} onChange={handleInputChange} disabled className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-gray-900 bg-gray-100">
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={() => router.back()} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 