'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient, Client } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoadingButton } from '@/components/ui/loading-button';

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const id = typeof params?.id === 'string' ? params.id : Array.isArray(params?.id) ? params.id[0] : null;

  const [client, setClient] = useState<Partial<Client> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function fetchClient() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch all clients and find the one we need
        const response = await apiClient.getClients();
        if (response.success && response.data) {
          const foundClient = response.data.find(c => c.id === id);
          if (foundClient) {
            setClient(foundClient);
          } else {
            setError('Client not found');
          }
        } else {
          setError('Failed to load client data');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error('Client fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    if (id) {
      fetchClient();
    }
  }, [id]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!client?.companyName?.trim()) {
      errors.companyName = 'Company name is required';
    }

    if (!client?.email?.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(client.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!client?.phone?.trim()) {
      errors.phone = 'Phone number is required';
    }

    if (!client?.address?.trim()) {
      errors.address = 'Address is required';
    }

    if (!client?.industry) {
      errors.industry = 'Industry is required';
    }

    if (!client?.description?.trim()) {
      errors.description = 'Description is required';
    }

    if (client?.status === 'TRIAL') {
      if (!client.trialDetails?.startDate) {
        errors.startDate = 'Trial start date is required';
      }
      if (!client.trialDetails?.endDate) {
        errors.endDate = 'Trial end date is required';
      }
      if (client.trialDetails?.startDate && client.trialDetails?.endDate) {
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
      setClient(prev => prev ? { ...prev, [name]: value } : null);
    } else if (name === 'status') {
      setClient(prev => prev ? { 
        ...prev, 
        status: value as Client['status'],
        trialDetails: value.toUpperCase() !== 'TRIAL' ? { startDate: '', endDate: '', isConverted: false, conversionDate: '' } : prev.trialDetails,
      } : null);
    } else {
      setClient(prev => prev ? { ...prev, [name]: value } : null);
    }
  };

  const handleTrialDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    setClient(prev => {
        if (!prev) return null;
        const newTrialDetails = {
            ...(prev.trialDetails || { startDate: '', endDate: '', isConverted: false, conversionDate: '' }),
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
    if (!client || !id) return;

    if (!validateForm()) {
      return;
    }

    setIsSaving(true);
    setError(null);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { createdAt, updatedAt, ...payload } = client;

    // 1. Format trial details and handle dates
    const statusUpper = payload.status?.toUpperCase();
    if (statusUpper === 'TRIAL' && payload.trialDetails) {
      const { startDate, endDate, isConverted, conversionDate } = payload.trialDetails;
      if (!startDate || !endDate) {
        setError("Start Date and End Date are required when status is TRIAL.");
        setIsSaving(false);
        return;
      }
      payload.trialDetails = {
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        isConverted: isConverted || false,
        conversionDate: isConverted && conversionDate ? new Date(conversionDate).toISOString() : '',
      };
    } else {
      delete (payload as Partial<Client>).trialDetails;
    }

    // 2. Construct billing object
    const billingPlan = payload.subscriptionPlan;
    const planAmounts: { [key: string]: number } = {
        BASIC: 99,
        STANDARD: 199,
        PREMIUM: 299,
    };

    if (billingPlan && planAmounts[billingPlan.toUpperCase()]) {
        let currency = 'GBP';
        if (client && typeof client === 'object' && 'billing' in client && client.billing && typeof client.billing === 'object' && 'currency' in client.billing) {
          currency = (client.billing as { currency: string }).currency || 'GBP';
        }
        (payload as Partial<Client> & { billing?: unknown }).billing = {
            plan: billingPlan.toUpperCase(),
            amount: planAmounts[billingPlan.toUpperCase()],
            currency,
        };
    }
    delete (payload as Partial<Client>).subscriptionPlan;

    // 3. Capitalize status
    if (payload.status) {
      payload.status = payload.status.toUpperCase() as Client['status'];
    }

    try {
      const response = await apiClient.updateClient();
      if (response.success) {
        router.push('/admin/users/clients');
      } else {
        setError(response.error || 'Failed to update client.');
      }
    } catch (err) {
      console.error('Error updating client:', err);
      setError('An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500 mt-4">Loading client details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Client</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-500 text-6xl mb-4">❓</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Client Not Found</h2>
          <p className="text-gray-600 mb-4">The client you&apos;re looking for doesn&apos;t exist.</p>
          <button
            onClick={() => router.back()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
        >
          ← Back to Clients
        </button>
        <h2 className="text-2xl font-bold text-gray-900">Edit Client: {client.companyName}</h2>
        <p className="text-gray-600 mt-1">Update client information and settings</p>
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
                value={client.companyName || ''}
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
                  value={client.industry || ''} 
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
                value={client.description || ''}
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
                value={client.email || ''}
                onChange={handleInputChange}
                error={formErrors.email}
                required
                placeholder="contact@company.com"
              />
              <Input
                label="Phone Number"
                name="phone"
                type="tel"
                value={client.phone || ''}
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
                value={client.address || ''}
                onChange={handleInputChange}
                error={formErrors.address}
                required
                placeholder="Full business address"
              />
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
                  value={client.status || ''} 
                  onChange={handleInputChange} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ACTIVE">Active</option>
                  <option value="TRIAL">Trial</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div>
                <label htmlFor="subscriptionPlan" className="block text-sm font-medium text-gray-700 mb-2">Subscription Plan</label>
                <select 
                  name="subscriptionPlan" 
                  id="subscriptionPlan" 
                  value={client.subscriptionPlan || ''} 
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
                  value={client.trialDetails?.startDate || ''}
                  onChange={handleTrialDetailsChange}
                  error={formErrors.startDate}
                  required
                />
                <Input
                  label="Trial End Date"
                  name="endDate"
                  type="date"
                  value={client.trialDetails?.endDate || ''}
                  onChange={handleTrialDetailsChange}
                  error={formErrors.endDate}
                  required
                />
              </div>
              
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    name="isConverted" 
                    id="isConverted" 
                    checked={client.trialDetails?.isConverted || false} 
                    onChange={handleTrialDetailsChange} 
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                  />
                  <label htmlFor="isConverted" className="ml-2 block text-sm font-medium text-gray-700">
                    Converted to Customer
                  </label>
                </div>
                <Input
                  label="Conversion Date"
                  name="conversionDate"
                  type="date"
                  value={client.trialDetails?.conversionDate || ''}
                  onChange={handleTrialDetailsChange}
                  disabled={!client.trialDetails?.isConverted}
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
              loading={isSaving}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>
  );
} 