'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, Job, Client } from '@/demo/func/api';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function NewJobPage() {
  const router = useRouter();
  const [job, setJob] = useState<Partial<Job>>({
    title: '',
    description: '',
    location: '',
    department: '',
    shift: '',
    duration: '',
    rate: 0,
    requirements: [],
    startDate: '',
    endDate: '',
    status: 'active',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');

  useEffect(() => {
    async function fetchClients() {
      const res = await apiClient.getClients();
      if (res.success && res.data) setClients(res.data);
    }
    fetchClients();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'skills' || name === 'requirements' || name === 'responsibilities') {
      setJob(prev => ({ ...prev, [name]: value.split(',').map(s => s.trim()) }));
    } else {
      setJob(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setJob(prev => ({
      ...prev,
      rate: parseFloat(value) || 0,
    }));
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClientId(e.target.value);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.createJob();
      if (response.success) {
        router.push('/admin/jobs/active');
      } else {
        setError('Failed to create job.');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Job</h2>
      <div className="bg-white p-8 rounded-lg shadow">
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Job Title" name="title" onChange={handleInputChange} required />
            <Input label="Location" name="location" onChange={handleInputChange} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Department" name="department" onChange={handleInputChange} required />
            <Input label="Shift" name="shift" onChange={handleInputChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Client</label>
            <select value={selectedClientId} onChange={handleClientChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="">Select a client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.companyName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">Status</label>
            <select
              name="status"
              value={job.status || 'active'}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <Textarea label="Description" name="description" onChange={handleInputChange} required rows={4} />
          <div>
            <Textarea label="Requirements (comma-separated)" name="requirements" onChange={handleInputChange} rows={3} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Start Date" name="startDate" type="date" onChange={handleInputChange} required />
            <Input label="End Date" name="endDate" type="date" onChange={handleInputChange} required />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input label="Duration" name="duration" onChange={handleInputChange} required />
            <Input label="Rate (£/hr)" name="rate" type="number" onChange={handleRateChange} required />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end space-x-4">
            <button type="button" onClick={() => router.back()} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">Cancel</button>
            <button type="submit" disabled={isLoading} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">{isLoading ? 'Creating...' : 'Create Job'}</button>
          </div>
        </form>
      </div>
    </div>
  );
} 