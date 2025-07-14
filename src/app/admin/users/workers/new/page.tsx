'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/demo/func/api';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/ui/loading-button';
import { EmailNotification } from '@/components/ui/email-notification';

export default function NewWorkerPage() {
  const router = useRouter();
  const [worker, setWorker] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    skills: '',
    experience: 0,
    preferredLocation: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showEmailNotification, setShowEmailNotification] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [workerEmail, setWorkerEmail] = useState('');

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!worker.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!worker.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    }

    if (!worker.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(worker.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!worker.phone?.trim()) {
      errors.phone = 'Phone number is required';
    }

    if (!worker.preferredLocation?.trim()) {
      errors.preferredLocation = 'Preferred location is required';
    }

    if (!worker.password?.trim()) {
      errors.password = 'Password is required';
    } else if (worker.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (name === 'skills') {
      setWorker(prev => ({ ...prev, [name]: value }));
    } else if (name === 'experience') {
      setWorker(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setWorker(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Create worker using the createWorker method
      const response = await apiClient.createWorker({
        email: worker.email,
        password: worker.password,
        username: `${worker.firstName.toLowerCase()}_${worker.lastName.toLowerCase()}`,
        firstName: worker.firstName,
        lastName: worker.lastName,
        phone: worker.phone,
        role: 'worker',
        skills: worker.skills.split(',').map(skill => skill.trim()).filter(Boolean),
        experience: worker.experience,
        preferredLocation: worker.preferredLocation
      });

      if (response.success) {
        // Show email notification with temporary password
        setTempPassword(worker.password);
        setWorkerEmail(worker.email);
        setShowEmailNotification(true);
      } else {
        setError(response.error || 'Failed to create worker.');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
        >
          ← Back to Workers
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Add New Worker</h2>
        <p className="text-gray-600 mt-1">Create a new worker account and configure their settings</p>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow">
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="First Name"
                name="firstName"
                value={worker.firstName}
                onChange={handleInputChange}
                error={formErrors.firstName}
                required
                placeholder="Enter first name"
              />
              <Input
                label="Last Name"
                name="lastName"
                value={worker.lastName}
                onChange={handleInputChange}
                error={formErrors.lastName}
                required
                placeholder="Enter last name"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={worker.email}
                onChange={handleInputChange}
                error={formErrors.email}
                required
                placeholder="Enter email address"
              />
              <Input
                label="Phone Number"
                name="phone"
                value={worker.phone}
                onChange={handleInputChange}
                error={formErrors.phone}
                required
                placeholder="Enter phone number"
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Professional Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700 mb-2">Skills (comma-separated)</label>
                <input
                  type="text"
                  name="skills"
                  id="skills"
                  value={worker.skills}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.skills ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="e.g., Nursing, First Aid, Elderly Care"
                />
                {formErrors.skills && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.skills}</p>
                )}
              </div>
              <div>
                <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">Years of Experience</label>
                <input
                  type="number"
                  name="experience"
                  id="experience"
                  value={worker.experience}
                  onChange={handleInputChange}
                  min="0"
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.experience ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="0"
                />
                {formErrors.experience && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.experience}</p>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <Input
                label="Preferred Location"
                name="preferredLocation"
                value={worker.preferredLocation}
                onChange={handleInputChange}
                error={formErrors.preferredLocation}
                required
                placeholder="e.g., London, Manchester"
              />
            </div>
          </div>

          {/* Account Information */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
            <div>
              <Input
                label="Temporary Password"
                type="password"
                name="password"
                value={worker.password}
                onChange={handleInputChange}
                error={formErrors.password}
                required
                placeholder="Enter temporary password"
                helperText="This will be the initial password for the worker. They should change it on first login."
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <LoadingButton
              type="submit"
              loading={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Worker
            </LoadingButton>
          </div>
        </form>
      </div>
      
      {/* Email Notification Modal */}
      <EmailNotification
        email={workerEmail}
        tempPassword={tempPassword}
        isVisible={showEmailNotification}
        onClose={() => {
          setShowEmailNotification(false);
          router.push('/admin/users/workers');
        }}
      />
    </div>
  );
} 