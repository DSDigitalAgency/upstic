'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient, Client } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { TextArea } from '@/components/ui/textarea';

export default function NewClientPage() {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [client, setClient] = useState({
    companyName: '',
    description: '',
    industry: '',
    email: '',
    password: '',
    status: 'TRIAL',
    subscriptionPlan: 'BASIC',
    trialDetails: {
      startDate: '',
      endDate: '',
      isConverted: false,
      conversionDate: '',
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
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
    const { name, value, type, checked } = e.target;
    setClient(prev => {
      const newTrialDetails = {
        ...prev.trialDetails,
        [name]: type === 'checkbox' ? checked : value,
      };
      if (name === 'isConverted' && !checked) {
        newTrialDetails.conversionDate = '';
      }
      return { ...prev, trialDetails: newTrialDetails };
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        isConverted: trialDetails.isConverted,
        startDate: new Date(trialDetails.startDate).toISOString(),
        endDate: new Date(trialDetails.endDate).toISOString(),
      };
      if (trialDetails.isConverted && trialDetails.conversionDate) {
        payload.trialDetails.conversionDate = new Date(trialDetails.conversionDate).toISOString();
      }
    }

    try {
      const response = await apiClient.createClient(payload);
      if (response.success) {
        router.push('/admin/users/clients');
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
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Client</h2>
      
      <div className="bg-white p-8 rounded-lg shadow">
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Company Name"
              name="companyName"
              value={client.companyName}
              onChange={handleInputChange}
              required
            />
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700">Industry</label>
              <select name="industry" id="industry" value={client.industry} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black">
                <option value="">Select an industry</option>
                <option value="HOSPITAL">Hospital</option>
                <option value="CLINIC">Clinic</option>
                <option value="CARE_HOME">Care Home</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
          </div>
          <TextArea
            label="Description"
            name="description"
            value={client.description}
            onChange={handleInputChange}
            required
            rows={4}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Email"
              name="email"
              type="email"
              value={client.email}
              onChange={handleInputChange}
              required
            />
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <div className="relative">
                <Input
                  type={isPasswordVisible ? 'text' : 'password'}
                  name="password"
                  id="password"
                  value={client.password}
                  onChange={handleInputChange}
                  required
                  className="pr-10"
                />
                <button type="button" onClick={() => setIsPasswordVisible(!isPasswordVisible)} className="absolute inset-y-0 right-0 px-3 flex items-center text-sm leading-5 text-gray-500">
                  {isPasswordVisible ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select name="status" id="status" value={client.status} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black">
                <option value="TRIAL">Trial</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
            <div>
              <label htmlFor="subscriptionPlan" className="block text-sm font-medium text-gray-700">Subscription Plan</label>
              <select name="subscriptionPlan" id="subscriptionPlan" value={client.subscriptionPlan} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black">
                <option>BASIC</option>
                <option>STANDARD</option>
                <option>PREMIUM</option>
              </select>
            </div>
          </div>

          {client.status === 'TRIAL' && (
            <fieldset className="border-t border-gray-200 pt-6">
              <legend className="text-lg font-medium text-gray-900">Trial Details</legend>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Start Date"
                  name="startDate"
                  type="date"
                  value={client.trialDetails.startDate}
                  onChange={handleTrialDetailsChange}
                  required
                />
                <Input
                  label="End Date"
                  name="endDate"
                  type="date"
                  value={client.trialDetails.endDate}
                  onChange={handleTrialDetailsChange}
                  required
                />
                <div className="flex items-center">
                  <input type="checkbox" name="isConverted" id="isConverted" checked={client.trialDetails.isConverted} onChange={handleTrialDetailsChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                  <label htmlFor="isConverted" className="ml-2 block text-sm font-medium text-gray-700">Converted to Customer</label>
                </div>
                <Input
                  label="Conversion Date"
                  name="conversionDate"
                  type="date"
                  value={client.trialDetails.conversionDate}
                  onChange={handleTrialDetailsChange}
                  disabled={!client.trialDetails.isConverted}
                />
              </div>
            </fieldset>
          )}
          
          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          
          <div className="flex justify-end space-x-4 border-t border-gray-200 pt-6">
            <button type="button" onClick={() => router.back()} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {isLoading ? 'Creating...' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 