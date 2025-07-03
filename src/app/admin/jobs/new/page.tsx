'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, Job } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { TextArea } from '@/components/ui/textarea';

export default function NewJobPage() {
  const router = useRouter();
  const [job, setJob] = useState<Partial<Job>>({
    title: '',
    description: '',
    skills: [],
    requirements: [],
    responsibilities: [],
    location: '',
    experience: 0,
    salary: { min: 0, max: 0, currency: 'USD' },
    startDate: '',
    endDate: '',
    status: 'PENDING',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'skills' || name === 'requirements' || name === 'responsibilities') {
      setJob(prev => ({ ...prev, [name]: value.split(',').map(s => s.trim()) }));
    } else {
      setJob(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setJob(prev => ({
      ...prev,
      salary: { ...prev.salary, [name]: parseFloat(value) } as Job['salary'],
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.createJob(job);
      if (response.success) {
        router.push('/admin/jobs/pending');
      } else {
        setError(response.error || 'Failed to create job.');
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
            <Input
                label="Job Title"
                name="title"
                onChange={handleInputChange}
                required
            />
            <Input
                label="Location"
                name="location"
                onChange={handleInputChange}
                required
            />
          </div>

          <TextArea
            label="Description"
            name="description"
            onChange={handleInputChange}
            required
            rows={4}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TextArea
                label="Skills (comma-separated)"
                name="skills"
                onChange={handleInputChange}
                rows={3}
            />
            <TextArea
                label="Requirements (comma-separated)"
                name="requirements"
                onChange={handleInputChange}
                rows={3}
            />
            <TextArea
                label="Responsibilities (comma-separated)"
                name="responsibilities"
                onChange={handleInputChange}
                rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
                label="Start Date"
                name="startDate"
                type="date"
                onChange={handleInputChange}
                required
            />
            <Input
                label="End Date"
                name="endDate"
                type="date"
                onChange={handleInputChange}
                required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
                label="Min Salary"
                name="min"
                type="number"
                onChange={handleSalaryChange}
                required
            />
            <Input
                label="Max Salary"
                name="max"
                type="number"
                onChange={handleSalaryChange}
                required
            />
            <Input
                label="Experience (Years)"
                name="experience"
                type="number"
                onChange={handleInputChange}
                required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end space-x-4">
            <button type="button" onClick={() => router.back()} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {isLoading ? 'Creating...' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 