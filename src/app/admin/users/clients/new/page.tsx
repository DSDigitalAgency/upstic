'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, Client } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoadingButton } from '@/components/ui/loading-button';
import { EmailNotification } from '@/components/ui/email-notification';

export default function NewClientPage() {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [client, setClient] = useState({
    companyName: '',
    description: '',
    industry: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    status: 'TRIAL',
    subscriptionPlan: 'BASIC',
    trialDetails: {
      startDate: '',
      endDate: '',
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showEmailNotification, setShowEmailNotification] = useState(false);
  const [tempPassword, setTempPassword] = useState('');
  const [clientEmail, setClientEmail] = useState('');

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!client.companyName?.trim()) {
      errors.companyName = 'Company name is required';
    }

    if (!client.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(client.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!client.phone?.trim()) {
      errors.phone = 'Phone number is required';
    }

    if (!client.address?.trim()) {
      errors.address = 'Address is required';
    }

    if (!client.industry) {
      errors.industry = 'Industry is required';
    }

    if (!client.description?.trim()) {
      errors.description = 'Description is required';
    }

    if (!client.password?.trim()) {
      errors.password = 'Password is required';
    } else if (client.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    if (client.status === 'TRIAL') {
      if (!client.trialDetails.startDate) {
        errors.startDate = 'Trial start date is required';
      }
      if (!client.trialDetails.endDate) {
        errors.endDate = 'Trial end date is required';
      }
      if (client.trialDetails.startDate && client.trialDetails.endDate) {
        const startDate = new Date(client.trialDetails.startDate);
        const endDate = new Date(client.trialDetails.endDate);
        if (startDate >= endDate) {
          errors.endDate = 'End date must be after start date';
        }
      }
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
    
    if (name === 'status' || name === 'industry') {
      setClient(prev => ({ ...prev, [name]: value.toUpperCase() }));
    } else if (name === 'status' && value !== 'TRIAL') {
      setClient(prev => ({ 
        ...prev, 
        status: value.toUpperCase(),
        trialDetails: {
          startDate: '',
          endDate: '',
          isConverted: false,
          conversionDate: '',
        },
      }));
    } else {
      setClient(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleTrialDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    setClient(prev => ({
      ...prev,
      trialDetails: {
        ...prev.trialDetails,
        [name]: value,
      },
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setError(null);

    const { trialDetails, ...restOfClient } = client;
    const payload = {
      ...restOfClient,
      status: restOfClient.status.toUpperCase() as 'TRIAL' | 'ACTIVE' | 'INACTIVE' | 'SUSPENDED',
      industry: restOfClient.industry.toUpperCase() as 'HOSPITAL' | 'CLINIC' | 'CARE_HOME' | 'OTHER',
    } as Partial<Client> & { billing?: { plan: string; amount: number; currency: string } };

    // Add billing
    const planAmounts: { [key: string]: number } = {
      BASIC: 99,
      STANDARD: 199,
      PREMIUM: 299,
    };
    payload.billing = {
      plan: client.subscriptionPlan.toUpperCase(),
      amount: planAmounts[client.subscriptionPlan.toUpperCase()] || 0,
      currency: 'GBP',
    };

    if (payload.status === 'TRIAL') {
      if (!trialDetails.startDate || !trialDetails.endDate) {
        setError("Start Date and End Date are required when status is TRIAL.");
        setIsLoading(false);
        return;
      }
      payload.trialDetails = {
        startDate: new Date(trialDetails.startDate).toISOString(),
        endDate: new Date(trialDetails.endDate).toISOString(),
        isConverted: false,
        conversionDate: '',
      };
    }

    try {
      const response = await apiClient.post();
      if (response.success) {
        // Show email notification with temporary password
        const clientData = response.data as Client & { tempPassword?: string };
        setTempPassword(clientData.tempPassword || 'GeneratedPassword123');
        setClientEmail(client.email);
        setShowEmailNotification(true);
      } else {
        setError(response.error || 'Failed to create client.');
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
          ← Back to Clients
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Add New Client</h2>
        <p className="text-gray-600 mt-1">Create a new client account and configure their settings</p>
      </div>
      
      <div className="bg-white p-8 rounded-lg shadow">
        <form onSubmit={handleFormSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Company Name"
                name="companyName"
                value={client.companyName}
                onChange={handleInputChange}
                error={formErrors.companyName}
                required
                placeholder="Enter company name"
              />
              <div>
                <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                <select 
                  name="industry" 
                  id="industry" 
                  value={client.industry} 
                  onChange={handleInputChange} 
                  required 
                  className={`w-full px-3 py-2 border rounded-lg shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${formErrors.industry ? 'border-red-500' : 'border-gray-300'}`}
                >
                  <option value="">Select an industry</option>
                  <option value="HOSPITAL">Hospital</option>
                  <option value="CLINIC">Clinic</option>
                  <option value="CARE_HOME">Care Home</option>
                  <option value="OTHER">Other</option>
                </select>
                {formErrors.industry && (
                  <p className="text-sm text-red-600 mt-1">{formErrors.industry}</p>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <Textarea
                label="Description"
                name="description"
                value={client.description}
                onChange={handleInputChange}
                error={formErrors.description}
                required
                rows={4}
                placeholder="Describe the client's business and services"
              />
            </div>
          </div>

          {/* Contact Information */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Email Address"
                name="email"
                type="email"
                value={client.email}
                onChange={handleInputChange}
                error={formErrors.email}
                required
                placeholder="contact@company.com"
              />
              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                value={client.phone}
                onChange={handleInputChange}
                error={formErrors.phone}
                required
                placeholder="+44 123 456 7890"
              />
            </div>
            
            <div className="mt-6">
              <Input
                label="Address"
                name="address"
                value={client.address}
                onChange={handleInputChange}
                error={formErrors.address}
                required
                placeholder="Full business address"
              />
            </div>
          </div>

          {/* Account Information */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Input
                    type={isPasswordVisible ? 'text' : 'password'}
                    name="password"
                    id="password"
                    value={client.password}
                    onChange={handleInputChange}
                    error={formErrors.password}
                    required
                    placeholder="Enter password"
                    className="pr-10"
                  />
                  <button 
                    type="button" 
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)} 
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-sm leading-5 text-gray-500 hover:text-gray-700"
                  >
                    {isPasswordVisible ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Subscription & Status */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Subscription & Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select 
                  name="status" 
                  id="status" 
                  value={client.status} 
                  onChange={handleInputChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="TRIAL">Trial</option>
                  <option value="ACTIVE">Active</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div>
                <label htmlFor="subscriptionPlan" className="block text-sm font-medium text-gray-700 mb-2">Subscription Plan</label>
                <select 
                  name="subscriptionPlan" 
                  id="subscriptionPlan" 
                  value={client.subscriptionPlan} 
                  onChange={handleInputChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="BASIC">Basic (£99/month)</option>
                  <option value="STANDARD">Standard (£199/month)</option>
                  <option value="PREMIUM">Premium (£299/month)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Trial Details */}
          {client.status === 'TRIAL' && (
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Trial Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Trial Start Date"
                  name="startDate"
                  type="date"
                  value={client.trialDetails.startDate}
                  onChange={handleTrialDetailsChange}
                  error={formErrors.startDate}
                  required
                />
                <Input
                  label="Trial End Date"
                  name="endDate"
                  type="date"
                  value={client.trialDetails.endDate}
                  onChange={handleTrialDetailsChange}
                  error={formErrors.endDate}
                  required
                />
              </div>
              

            </div>
          )}
          
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600 flex items-center gap-2">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            </div>
          )}
          
          {/* Form Actions */}
          <div className="flex justify-end space-x-4 border-t border-gray-200 pt-6">
            <button 
              type="button" 
              onClick={() => router.back()} 
              className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <LoadingButton
              type="submit"
              loading={isLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isLoading ? 'Creating...' : 'Create Client'}
            </LoadingButton>
          </div>
        </form>
      </div>
      
      {/* Email Notification Modal */}
      <EmailNotification
        email={clientEmail}
        tempPassword={tempPassword}
        isVisible={showEmailNotification}
        onClose={() => {
          setShowEmailNotification(false);
          router.push('/admin/users/clients');
        }}
      />
    </div>
  );
} 