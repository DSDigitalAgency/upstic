'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient, Job } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { TextArea } from '@/components/ui/textarea';

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [job, setJob] = useState<Partial<Job> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchJob = async () => {
        setIsLoading(true);
        const response = await apiClient.getJobById(id);
        if (response.success && response.data) {
          setJob(response.data);
        } else {
          setError('Failed to fetch job data.');
        }
        setIsLoading(false);
      };
      fetchJob();
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'skills' || name === 'requirements' || name === 'responsibilities') {
      setJob(prev => prev ? { ...prev, [name]: value.split(',').map(s => s.trim()) } : null);
    } else {
      setJob(prev => prev ? { ...prev, [name]: value } : null);
    }
  };

  const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setJob(prev => prev ? { ...prev, [name === 'min' ? 'salaryMin' : 'salaryMax']: parseFloat(value) } : null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job) return;

    setIsSaving(true);
    setError(null);

    try {
      const response = await apiClient.updateJob();
      if (response.success) {
        router.push('/admin/jobs/active');
      } else {
        setError(response.error || 'Failed to update job.');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center mt-8">Loading job details...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">Error: {error}</div>;
  }

  if (!job) {
    return <div className="text-center mt-8">Job not found.</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Job: {job.title}</h2>
      <div className="bg-white p-8 rounded-lg shadow">
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Job Title"
              name="title"
              value={job.title || ''}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Location"
              name="location"
              value={job.location || ''}
              onChange={handleInputChange}
              required
            />
          </div>

          <TextArea
            label="Description"
            name="description"
            value={job.description || ''}
            onChange={handleInputChange}
            required
            rows={4}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TextArea
              label="Skills (comma-separated)"
              name="skills"
              value={Array.isArray(job.skills) ? job.skills.join(', ') : ''}
              onChange={handleInputChange}
              rows={3}
            />
            <TextArea
              label="Requirements (comma-separated)"
              name="requirements"
              value={Array.isArray(job.requirements) ? job.requirements.join(', ') : ''}
              onChange={handleInputChange}
              rows={3}
            />
            <TextArea
              label="Responsibilities (comma-separated)"
              name="responsibilities"
              value={Array.isArray(job.responsibilities) ? job.responsibilities.join(', ') : ''}
              onChange={handleInputChange}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Start Date"
              name="startDate"
              type="date"
              value={job.startDate?.split('T')[0] || ''}
              onChange={handleInputChange}
              required
            />
            <Input
              label="End Date"
              name="endDate"
              type="date"
              value={job.endDate?.split('T')[0] || ''}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Input
              label="Min Salary"
              name="min"
              type="number"
              value={job.salaryMin || 0}
              onChange={handleSalaryChange}
              required
            />
            <Input
              label="Max Salary"
              name="max"
              type="number"
              value={job.salaryMax || 0}
              onChange={handleSalaryChange}
              required
            />
            <Input
              label="Experience (Years)"
              name="experience"
              type="number"
              value={job.experience || 0}
              onChange={handleInputChange}
              required
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end space-x-4">
            <button type="button" onClick={() => router.back()} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 