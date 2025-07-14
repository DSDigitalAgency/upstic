'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface ClientSettings {
  profile: {
    companyName: string;
    email: string;
    phone: string;
    address: string;
    industry: string;
    description: string;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
    timesheetApprovals: boolean;
    newAssignments: boolean;
    billingUpdates: boolean;
  };
  preferences: {
    timezone: string;
    language: string;
    currency: string;
    dateFormat: string;
  };
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<ClientSettings>({
    profile: {
      companyName: '',
      email: '',
      phone: '',
      address: '',
      industry: '',
      description: '',
    },
    notifications: {
      email: true,
      sms: false,
      push: true,
      timesheetApprovals: true,
      newAssignments: true,
      billingUpdates: true,
    },
    preferences: {
      timezone: 'Europe/London',
      language: 'en',
      currency: 'GBP',
      dateFormat: 'DD/MM/YYYY',
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'preferences'>('profile');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Mock settings data - in a real app, this would come from an API
        const mockSettings: ClientSettings = {
          profile: {
            companyName: 'St. Mary\'s Hospital',
            email: user?.email || '',
            phone: '+44 20 7123 4567',
            address: '123 Hospital Street, London, UK',
            industry: 'HOSPITAL',
            description: 'Leading healthcare facility providing comprehensive medical services.',
          },
          notifications: {
            email: true,
            sms: false,
            push: true,
            timesheetApprovals: true,
            newAssignments: true,
            billingUpdates: true,
          },
          preferences: {
            timezone: 'Europe/London',
            language: 'en',
            currency: 'GBP',
            dateFormat: 'DD/MM/YYYY',
          },
        };

        setSettings(mockSettings);
      } catch (err) {
        setError('Failed to load settings');
        console.error('Settings fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [user]);

  const handleSaveSettings = async () => {
    try {
      setError(null);
      setSuccess(null);

      // Mock API call to save settings
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Settings saved successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save settings');
      console.error('Settings save error:', err);
    }
  };

  const handleResetSettings = () => {
    // Reset to default values
    setSettings({
      profile: {
        companyName: 'St. Mary\'s Hospital',
        email: user?.email || '',
        phone: '+44 20 7123 4567',
        address: '123 Hospital Street, London, UK',
        industry: 'HOSPITAL',
        description: 'Leading healthcare facility providing comprehensive medical services.',
      },
      notifications: {
        email: true,
        sms: false,
        push: true,
        timesheetApprovals: true,
        newAssignments: true,
        billingUpdates: true,
      },
      preferences: {
        timezone: 'Europe/London',
        language: 'en',
        currency: 'GBP',
        dateFormat: 'DD/MM/YYYY',
      },
    });
    setSuccess('Settings reset to defaults!');
    setTimeout(() => setSuccess(null), 3000);
  };

  const updateProfile = (field: keyof ClientSettings['profile'], value: string) => {
    setSettings(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value,
      },
    }));
  };

  const updateNotification = (field: keyof ClientSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value,
      },
    }));
  };

  const updatePreference = (field: keyof ClientSettings['preferences'], value: string) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [field]: value,
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Manage your account settings and preferences</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">Success</h3>
              <p className="text-sm text-green-700 mt-1">{success}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Settings Container */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {[
              { id: 'profile', label: 'Profile' },
              { id: 'notifications', label: 'Notifications' },
              { id: 'preferences', label: 'Preferences' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'profile' | 'notifications' | 'preferences')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-900 mb-2">
                      Company Name *
                    </label>
                    <input
                      id="companyName"
                      type="text"
                      value={settings.profile.companyName}
                      onChange={(e) => updateProfile('companyName', e.target.value)}
                      placeholder="Enter your healthcare facility name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                      Contact Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={settings.profile.email}
                      onChange={(e) => updateProfile('email', e.target.value)}
                      placeholder="Enter your primary contact email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">
                      Contact Phone *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={settings.profile.phone}
                      onChange={(e) => updateProfile('phone', e.target.value)}
                      placeholder="Enter your contact phone number"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="industry" className="block text-sm font-medium text-gray-900 mb-2">
                      Healthcare Industry *
                    </label>
                    <select
                      id="industry"
                      value={settings.profile.industry}
                      onChange={(e) => updateProfile('industry', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="HOSPITAL">Hospital</option>
                      <option value="CLINIC">Clinic</option>
                      <option value="CARE_HOME">Care Home</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-900 mb-2">
                      Facility Address *
                    </label>
                    <input
                      id="address"
                      type="text"
                      value={settings.profile.address}
                      onChange={(e) => updateProfile('address', e.target.value)}
                      placeholder="Enter your healthcare facility address"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
                      Facility Description
                    </label>
                    <textarea
                      id="description"
                      value={settings.profile.description}
                      onChange={(e) => updateProfile('description', e.target.value)}
                      rows={3}
                      placeholder="Describe your healthcare facility and services"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <button
                      onClick={() => updateNotification('email', !settings.notifications.email)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications.email ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications.email ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">SMS Notifications</h4>
                      <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                    </div>
                    <button
                      onClick={() => updateNotification('sms', !settings.notifications.sms)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications.sms ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications.sms ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Push Notifications</h4>
                      <p className="text-sm text-gray-500">Receive push notifications in browser</p>
                    </div>
                    <button
                      onClick={() => updateNotification('push', !settings.notifications.push)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        settings.notifications.push ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        settings.notifications.push ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Specific Notifications</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Timesheet Approvals</span>
                        <button
                          onClick={() => updateNotification('timesheetApprovals', !settings.notifications.timesheetApprovals)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.notifications.timesheetApprovals ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.notifications.timesheetApprovals ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">New Assignments</span>
                        <button
                          onClick={() => updateNotification('newAssignments', !settings.notifications.newAssignments)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.notifications.newAssignments ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.notifications.newAssignments ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Billing Updates</span>
                        <button
                          onClick={() => updateNotification('billingUpdates', !settings.notifications.billingUpdates)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.notifications.billingUpdates ? 'bg-blue-600' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings.notifications.billingUpdates ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">General Preferences</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="timezone" className="block text-sm font-medium text-gray-900 mb-2">
                      Timezone *
                    </label>
                    <select
                      id="timezone"
                      value={settings.preferences.timezone}
                      onChange={(e) => updatePreference('timezone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="Europe/London">Europe/London</option>
                      <option value="Europe/Paris">Europe/Paris</option>
                      <option value="America/New_York">America/New_York</option>
                      <option value="Asia/Tokyo">Asia/Tokyo</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="language" className="block text-sm font-medium text-gray-900 mb-2">
                      Language *
                    </label>
                    <select
                      id="language"
                      value={settings.preferences.language}
                      onChange={(e) => updatePreference('language', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-gray-900 mb-2">
                      Currency *
                    </label>
                    <select
                      id="currency"
                      value={settings.preferences.currency}
                      onChange={(e) => updatePreference('currency', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="GBP">GBP (£)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="JPY">JPY (¥)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label htmlFor="dateFormat" className="block text-sm font-medium text-gray-900 mb-2">
                      Date Format *
                    </label>
                    <select
                      id="dateFormat"
                      value={settings.preferences.dateFormat}
                      onChange={(e) => updatePreference('dateFormat', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              onClick={handleResetSettings}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              Reset to Defaults
            </button>
            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 