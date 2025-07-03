'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { apiClient, Client } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { TextArea } from '@/components/ui/textarea';

type ClientStatus = 'trial' | 'active' | 'suspended';

export default function EditClientPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [client, setClient] = useState<Partial<Client> | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchClient = async () => {
        setIsLoading(true);
        const response = await apiClient.getClientById(id as string);
        if (response.success && response.data) {
          const fetchedData = response.data;
          
          if (!fetchedData.trialDetails) {
            fetchedData.trialDetails = { startDate: '', endDate: '', isConverted: false, conversionDate: '' };
          } else {
            fetchedData.trialDetails.startDate = fetchedData.trialDetails.startDate?.split('T')[0] || '';
            fetchedData.trialDetails.endDate = fetchedData.trialDetails.endDate?.split('T')[0] || '';
            fetchedData.trialDetails.conversionDate = fetchedData.trialDetails.conversionDate?.split('T')[0] || '';
          }

          setClient(fetchedData);
        } else {
          setError('Failed to fetch client data.');
        }
        setIsLoading(false);
      };
      fetchClient();
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'status') {
        setClient(prev => prev ? { 
            ...prev, 
            status: value.toLowerCase() as ClientStatus,
            trialDetails: value.toLowerCase() !== 'trial' ? { startDate: '', endDate: '', isConverted: false, conversionDate: '' } : prev.trialDetails,
        } : null);
    } else {
        setClient(prev => prev ? { ...prev, [name]: value } : null);
    }
  };

  const handleTrialDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
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
    if (!client) return;

    setIsSaving(true);
    setError(null);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdAt, updatedAt, ...payload } = client;

    if (payload.status === 'trial') {
      if (!payload.trialDetails?.startDate || !payload.trialDetails?.endDate) {
        setError("Start Date and End Date are required when status is TRIAL.");
        setIsSaving(false);
        return;
      }
      payload.trialDetails = {
        isConverted: payload.trialDetails.isConverted,
        startDate: new Date(payload.trialDetails.startDate).toISOString(),
        endDate: new Date(payload.trialDetails.endDate).toISOString(),
      };
      if (payload.trialDetails.isConverted && payload.trialDetails.conversionDate) {
        payload.trialDetails.conversionDate = new Date(payload.trialDetails.conversionDate).toISOString();
      }
    }

    try {
      const response = await apiClient.updateClient(id as string, payload);
      if (response.success) {
        router.push('/admin/users/clients');
      } else {
        setError(response.error || 'Failed to update client.');
      }
    } catch {
      setError('An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center mt-8">Loading client details...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">Error: {error}</div>;
  }

  if (!client) {
    return <div className="text-center mt-8">Client not found.</div>;
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Client: {client.companyName}</h2>
      
      <div className="bg-white p-8 rounded-lg shadow">
        <form onSubmit={handleFormSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
                label="Company Name"
                name="companyName"
                value={client.companyName || ''}
                onChange={handleInputChange}
                required
            />
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700">Industry</label>
              <select name="industry" id="industry" value={client.industry || ''} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black">
                <option value="">Select an industry</option>
                <option>Hospital</option>
                <option>Clinic</option>
                <option>Care Home</option>
                <option>Other</option>
              </select>
            </div>
          </div>
          <TextArea
            label="Description"
            name="description"
            value={client.description || ''}
            onChange={handleInputChange}
            required
            rows={4}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select name="status" id="status" value={client.status || ''} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black">
                <option value="trial">trial</option>
                <option value="active">active</option>
                <option value="suspended">suspended</option>
              </select>
            </div>
            <div>
              <label htmlFor="subscriptionPlan" className="block text-sm font-medium text-gray-700">Subscription Plan</label>
              <select name="subscriptionPlan" id="subscriptionPlan" value={client.subscriptionPlan || ''} onChange={handleInputChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black">
                <option>BASIC</option>
                <option>STANDARD</option>
                <option>PREMIUM</option>
              </select>
            </div>
          </div>

          {client.status === 'trial' && (
            <fieldset className="border-t border-gray-200 pt-6">
              <legend className="text-lg font-medium text-gray-900">Trial Details</legend>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                    label="Start Date"
                    name="startDate"
                    type="date"
                    value={client.trialDetails?.startDate || ''}
                    onChange={handleTrialDetailsChange}
                    required
                />
                <Input
                    label="End Date"
                    name="endDate"
                    type="date"
                    value={client.trialDetails?.endDate || ''}
                    onChange={handleTrialDetailsChange}
                    required
                />
                <div className="flex items-center">
                  <input type="checkbox" name="isConverted" id="isConverted" checked={client.trialDetails?.isConverted || false} onChange={handleTrialDetailsChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                  <label htmlFor="isConverted" className="ml-2 block text-sm font-medium text-gray-700">Converted to Customer</label>
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
            </fieldset>
          )}

          {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
          
          <div className="flex justify-end space-x-4 border-t border-gray-200 pt-6">
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