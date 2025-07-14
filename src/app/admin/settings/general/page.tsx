'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { apiClient } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

interface SiteSettings {
  agencyName: string;
  primaryColor: string;
  secondaryColor: string;
  logoUrl: string;
  subscriptionPlan: string;
}

export default function GeneralSettingsPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [settings, setSettings] = useState<SiteSettings>({
    agencyName: '',
    primaryColor: '#059669',
    secondaryColor: '#047857',
    logoUrl: '',
    subscriptionPlan: 'basic'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<SiteSettings>();
        if (response.success && response.data) {
          setSettings(response.data);
        } else {
          setError('Failed to load settings');
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const response = await apiClient.put<{ success: boolean }>();
      if (response.success) {
        setSaveSuccess(true);
        setIsEditMode(false);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setSaveError('Failed to save settings');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setSaveError('An unexpected error occurred');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-800">Loading settings...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-red-50 p-6 rounded-lg shadow-md max-w-md">
          <div className="text-red-700 text-lg font-medium mb-2">Error Loading Settings</div>
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  const DetailsView = () => (
    <div className="space-y-6 bg-white rounded-lg shadow-md">
      {/* Basic Details */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Basic Details</h3>
          <button
            onClick={() => setIsEditMode(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Edit Settings
          </button>
        </div>
        <dl className="grid grid-cols-1 gap-4">
          <div className="flex justify-between py-3 border-b border-gray-100">
            <dt className="text-gray-600">Name</dt>
            <dd className="text-gray-900 font-medium">{user?.firstName} {user?.lastName}</dd>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <dt className="text-gray-600">Email</dt>
            <dd className="text-gray-900 font-medium">{user?.email}</dd>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <dt className="text-gray-600">Username</dt>
            <dd className="text-gray-900 font-medium">{user?.username}</dd>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <dt className="text-gray-600">Role</dt>
            <dd className="text-gray-900 font-medium capitalize">{user?.role}</dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-gray-600">Subscription Plan</dt>
            <dd className="text-gray-900 font-medium capitalize">{settings.subscriptionPlan}</dd>
          </div>
        </dl>
      </div>

      {/* Site Settings */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Site Settings</h3>
        <dl className="grid grid-cols-1 gap-4">
          <div className="flex justify-between py-3 border-b border-gray-100">
            <dt className="text-gray-600">Agency Name</dt>
            <dd className="text-gray-900 font-medium">{settings.agencyName || 'Not set'}</dd>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <dt className="text-gray-600">Logo</dt>
            <dd className="text-gray-900 font-medium">
              {settings.logoUrl ? (
                <Image
                  src={settings.logoUrl}
                  alt="Agency Logo"
                  width={100}
                  height={50}
                  className="h-8 w-auto"
                />
              ) : (
                'No logo uploaded'
              )}
            </dd>
          </div>
          <div className="flex justify-between py-3 border-b border-gray-100">
            <dt className="text-gray-600">Primary Color</dt>
            <dd className="flex items-center space-x-2">
              <div 
                className="w-6 h-6 rounded border border-gray-300"
                style={{ backgroundColor: settings.primaryColor || '#3B82F6' }}
              />
              <span className="text-gray-900 font-medium">{settings.primaryColor || '#3B82F6'}</span>
            </dd>
          </div>
          <div className="flex justify-between py-3">
            <dt className="text-gray-600">Secondary Color</dt>
            <dd className="flex items-center space-x-2">
              <div 
                className="w-6 h-6 rounded border border-gray-300"
                style={{ backgroundColor: settings.secondaryColor || '#6B7280' }}
              />
              <span className="text-gray-900 font-medium">{settings.secondaryColor || '#6B7280'}</span>
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );

  const EditForm = () => (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow-md p-6">
      {/* Site Settings */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b pb-2">
          <h3 className="text-lg font-semibold text-gray-800">Site Settings</h3>
          <button
            type="button"
            onClick={() => setIsEditMode(false)}
            className="text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label htmlFor="agencyName" className="block text-sm font-medium text-gray-700 mb-1">
              Agency Name
            </label>
            <input
              type="text"
              id="agencyName"
              name="agencyName"
              value={settings.agencyName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Logo URL
            </label>
            <input
              type="url"
              id="logoUrl"
              name="logoUrl"
              value={settings.logoUrl}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700 mb-1">
              Primary Color
            </label>
            <div className="flex space-x-2">
              <input
                type="color"
                id="primaryColor"
                name="primaryColor"
                value={settings.primaryColor}
                onChange={handleChange}
                className="h-10 w-20"
              />
              <input
                type="text"
                value={settings.primaryColor}
                onChange={handleChange}
                name="primaryColor"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label htmlFor="secondaryColor" className="block text-sm font-medium text-gray-700 mb-1">
              Secondary Color
            </label>
            <div className="flex space-x-2">
              <input
                type="color"
                id="secondaryColor"
                name="secondaryColor"
                value={settings.secondaryColor}
                onChange={handleChange}
                className="h-10 w-20"
              />
              <input
                type="text"
                value={settings.secondaryColor}
                onChange={handleChange}
                name="secondaryColor"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t">
        <button
          type="button"
          onClick={() => setIsEditMode(false)}
          className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {saveError && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
          {saveError}
        </div>
      )}

      {saveSuccess && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
          Settings updated successfully!
        </div>
      )}
    </form>
  );

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">General Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account and site settings
        </p>
      </div>
      {isEditMode ? <EditForm /> : <DetailsView />}
    </div>
  );
} 