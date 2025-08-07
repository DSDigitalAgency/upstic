'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient, Worker, Job } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoadingButton } from '@/components/ui/loading-button';

interface AssignmentFormData {
  workerId: string;
  startDate: string;
  endDate: string;
  shiftType: 'DAY' | 'NIGHT' | 'EVENING' | 'WEEKEND';
  hourlyRate: number;
  notes: string;
  contactPerson: {
    name: string;
    phone: string;
    email: string;
    role: string;
  };
}

export default function AssignJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params?.id as string;
  
  const [job, setJob] = useState<Job | null>(null);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<AssignmentFormData>({
    workerId: '',
    startDate: '',
    endDate: '',
    shiftType: 'DAY',
    hourlyRate: 0,
    notes: '',
    contactPerson: {
      name: '',
      phone: '',
      email: '',
      role: ''
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch job details
        const jobResponse = await apiClient.getJobById(jobId);
        if (!jobResponse.success || !jobResponse.data) {
          throw new Error('Failed to load job details');
        }
        setJob(jobResponse.data);

        // Fetch available workers
        const workersResponse = await apiClient.getWorkers(1, 100);
        if (workersResponse.success && workersResponse.data) {
          setWorkers(workersResponse.data.items || []);
        }

        // Pre-fill form with job data
        if (jobResponse.data) {
          setFormData(prev => ({
            ...prev,
            startDate: jobResponse.data!.startDate,
            endDate: jobResponse.data!.endDate,
            hourlyRate: jobResponse.data!.rate || 0
          }));
        }
      } catch (err) {
        setError('Failed to load data');
        console.error('Data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (jobId) {
      fetchData();
    }
  }, [jobId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('contactPerson.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        contactPerson: {
          ...prev.contactPerson,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: name === 'hourlyRate' ? parseFloat(value) || 0 : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!job || !formData.workerId) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await apiClient.post();
      
      if (response.success) {
        router.push('/admin/jobs/assignments');
      } else {
        setError(response.error || 'Failed to create assignment');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Assignment creation error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-red-800">Error</h3>
          <p className="text-sm text-red-700 mt-1">Job not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Assign Worker to Job</h1>
        <p className="text-gray-600">Create an assignment for: {job.title}</p>
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

      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-3">Job Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Job Title</label>
                <p className="text-sm text-gray-900 mt-1">{job.title}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Client</label>
                <p className="text-sm text-gray-900 mt-1">{job.company?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Location</label>
                <p className="text-sm text-gray-900 mt-1">{job.location}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Salary Range</label>
                <p className="text-sm text-gray-900 mt-1">
                  £{job.rate} - £{job.rate}
                </p>
              </div>
            </div>
          </div>

          {/* Assignment Details */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900">Assignment Details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Worker *
                </label>
                <select
                  name="workerId"
                  value={formData.workerId}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Choose a worker</option>
                  {workers.map((worker) => (
                    <option key={worker.id} value={worker.id}>
                      {worker.firstName} {worker.lastName} - {worker.skills?.join(', ')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shift Type *
                </label>
                <select
                  name="shiftType"
                  value={formData.shiftType}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="DAY">Day Shift</option>
                  <option value="NIGHT">Night Shift</option>
                  <option value="EVENING">Evening Shift</option>
                  <option value="WEEKEND">Weekend Shift</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hourly Rate (£) *
                </label>
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Contact Person */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Contact Person</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Name"
                  name="contactPerson.name"
                  value={formData.contactPerson.name}
                  onChange={handleInputChange}
                  required
                  className="text-black"
                />
                <Input
                  label="Phone"
                  name="contactPerson.phone"
                  value={formData.contactPerson.phone}
                  onChange={handleInputChange}
                  required
                  className="text-black"
                />
                <Input
                  label="Email"
                  name="contactPerson.email"
                  value={formData.contactPerson.email}
                  onChange={handleInputChange}
                  required
                  className="text-black"
                />
                <Input
                  label="Role"
                  name="contactPerson.role"
                  value={formData.contactPerson.role}
                  onChange={handleInputChange}
                  required
                  className="text-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <Textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="text-black"
                placeholder="Additional notes about this assignment..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <LoadingButton
              type="submit"
              loading={isSubmitting}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Assignment
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
} 