'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getWorkerPreferences, updatePreferences } from '@/lib/worker';

interface WorkPreferences {
  preferredShiftType: string[];
  maxTravelDistance: number;
  minimumHourlyRate: number;
  preferredLocations: string[];
  availableForWork: boolean;
  autoAcceptJobs: boolean;
  requireApprovalForOvertime: boolean;
  preferredJobTypes: string[];
  maxHoursPerWeek: number;
  preferredStartTime: string;
  preferredEndTime: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface ApplicationSettings {
  language: string;
  timezone: string;
  dateFormat: string;
  currency: string;
  theme: 'light' | 'dark' | 'auto';
  autoLogout: number;
  showTutorials: boolean;
}

export default function UserPreferences() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [workPreferences, setWorkPreferences] = useState<WorkPreferences>({
    preferredShiftType: ['Day'],
    maxTravelDistance: 30,
    minimumHourlyRate: 20,
    preferredLocations: ['London'],
    availableForWork: true,
    autoAcceptJobs: false,
    requireApprovalForOvertime: true,
    preferredJobTypes: ['Nursing', 'Elderly Care'],
    maxHoursPerWeek: 40,
    preferredStartTime: '08:00',
    preferredEndTime: '18:00',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    }
  });

  const [applicationSettings, setApplicationSettings] = useState<ApplicationSettings>({
    language: 'en',
    timezone: 'Europe/London',
    dateFormat: 'DD/MM/YYYY',
    currency: 'GBP',
    theme: 'light',
    autoLogout: 30,
    showTutorials: true
  });

  const [newLocation, setNewLocation] = useState('');
  const [newJobType, setNewJobType] = useState('');

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await getWorkerPreferences(user.id);
        if (response.success && response.data) {
          const apiData = response.data;
          
          // Update work preferences
          if (apiData.preferences) {
            setWorkPreferences(prev => ({
              ...prev,
              preferredShiftType: apiData.preferences.preferredShiftType || ['Day'],
              maxTravelDistance: apiData.preferences.maxTravelDistance || 30,
              minimumHourlyRate: apiData.preferences.minimumHourlyRate || 20
            }));
          }
        } else {
          setError('Failed to load preferences');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPreferences();
  }, [user]);

  const handleWorkPreferenceChange = (field: keyof WorkPreferences, value: WorkPreferences[keyof WorkPreferences]) => {
    setWorkPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApplicationSettingChange = (field: keyof ApplicationSettings, value: ApplicationSettings[keyof ApplicationSettings]) => {
    setApplicationSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEmergencyContactChange = (field: keyof WorkPreferences['emergencyContact'], value: string) => {
    setWorkPreferences(prev => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value
      }
    }));
  };

  const handleAddLocation = () => {
    if (newLocation.trim() && !workPreferences.preferredLocations.includes(newLocation.trim())) {
      const updatedLocations = [...workPreferences.preferredLocations, newLocation.trim()];
      handleWorkPreferenceChange('preferredLocations', updatedLocations);
      setNewLocation('');
    }
  };

  const handleRemoveLocation = (locationToRemove: string) => {
    const updatedLocations = workPreferences.preferredLocations.filter(location => location !== locationToRemove);
    handleWorkPreferenceChange('preferredLocations', updatedLocations);
  };

  const handleAddJobType = () => {
    if (newJobType.trim() && !workPreferences.preferredJobTypes.includes(newJobType.trim())) {
      const updatedJobTypes = [...workPreferences.preferredJobTypes, newJobType.trim()];
      handleWorkPreferenceChange('preferredJobTypes', updatedJobTypes);
      setNewJobType('');
    }
  };

  const handleRemoveJobType = (jobTypeToRemove: string) => {
    const updatedJobTypes = workPreferences.preferredJobTypes.filter(jobType => jobType !== jobTypeToRemove);
    handleWorkPreferenceChange('preferredJobTypes', updatedJobTypes);
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const preferencesData = {
        notifications: {
          email: true,
          sms: false,
          push: true
        },
        privacy: {
          profileVisibility: 'PUBLIC' as 'PUBLIC' | 'PRIVATE' | 'CONNECTIONS_ONLY',
          showContactInfo: true
        },
        preferences: {
          preferredShiftType: workPreferences.preferredShiftType,
          maxTravelDistance: workPreferences.maxTravelDistance,
          minimumHourlyRate: workPreferences.minimumHourlyRate
        }
      };
      
      const response = await updatePreferences(user.id, preferencesData);
      
      if (response.success) {
        setSuccessMessage('Work preferences updated successfully');
      } else {
        setError('Failed to update preferences');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Work Preferences</h1>
          <p className="text-gray-600">Customize your work preferences and application settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? 'Saving...' : 'Save Preferences'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Work Preferences */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Work Preferences</h3>
          <p className="text-sm text-gray-600">Configure your work-related preferences</p>
        </div>
        <div className="p-6 space-y-6">
          {/* Availability */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Available for Work</h4>
              <p className="text-sm text-gray-500">Show as available for new assignments</p>
            </div>
            <button
              onClick={() => handleWorkPreferenceChange('availableForWork', !workPreferences.availableForWork)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                workPreferences.availableForWork ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  workPreferences.availableForWork ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Auto Accept Jobs */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Auto-accept Jobs</h4>
              <p className="text-sm text-gray-500">Automatically accept job offers that match your preferences</p>
            </div>
            <button
              onClick={() => handleWorkPreferenceChange('autoAcceptJobs', !workPreferences.autoAcceptJobs)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                workPreferences.autoAcceptJobs ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  workPreferences.autoAcceptJobs ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Overtime Approval */}
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Require Approval for Overtime</h4>
              <p className="text-sm text-gray-500">Get approval before accepting overtime assignments</p>
            </div>
            <button
              onClick={() => handleWorkPreferenceChange('requireApprovalForOvertime', !workPreferences.requireApprovalForOvertime)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                workPreferences.requireApprovalForOvertime ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  workPreferences.requireApprovalForOvertime ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Shift Types */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Preferred Shift Types
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {['Day', 'Evening', 'Night', 'Weekend'].map((shiftType) => (
                <label key={shiftType} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={workPreferences.preferredShiftType.includes(shiftType)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        handleWorkPreferenceChange('preferredShiftType', [...workPreferences.preferredShiftType, shiftType]);
                      } else {
                        handleWorkPreferenceChange('preferredShiftType', workPreferences.preferredShiftType.filter(st => st !== shiftType));
                      }
                    }}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-900">{shiftType}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Travel Distance */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Maximum Travel Distance (miles)
            </label>
            <input
              type="number"
              min="5"
              max="100"
              value={workPreferences.maxTravelDistance}
              onChange={(e) => handleWorkPreferenceChange('maxTravelDistance', parseInt(e.target.value) || 30)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Minimum Hourly Rate */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Minimum Hourly Rate (£)
            </label>
            <input
              type="number"
              min="10"
              max="100"
              step="0.50"
              value={workPreferences.minimumHourlyRate}
              onChange={(e) => handleWorkPreferenceChange('minimumHourlyRate', parseFloat(e.target.value) || 20)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Max Hours Per Week */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Maximum Hours Per Week
            </label>
            <input
              type="number"
              min="10"
              max="80"
              value={workPreferences.maxHoursPerWeek}
              onChange={(e) => handleWorkPreferenceChange('maxHoursPerWeek', parseInt(e.target.value) || 40)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Preferred Locations */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Preferred Locations
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="Add a location"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleAddLocation()}
              />
              <button
                onClick={handleAddLocation}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {workPreferences.preferredLocations.map((location, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                >
                  {location}
                  <button
                    onClick={() => handleRemoveLocation(location)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Preferred Job Types */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Preferred Job Types
            </label>
            <div className="flex space-x-2 mb-3">
              <input
                type="text"
                value={newJobType}
                onChange={(e) => setNewJobType(e.target.value)}
                placeholder="Add a job type"
                className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleAddJobType()}
              />
              <button
                onClick={handleAddJobType}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {workPreferences.preferredJobTypes.map((jobType, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                >
                  {jobType}
                  <button
                    onClick={() => handleRemoveJobType(jobType)}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Preferred Working Hours */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Preferred Start Time
              </label>
              <input
                type="time"
                value={workPreferences.preferredStartTime}
                onChange={(e) => handleWorkPreferenceChange('preferredStartTime', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Preferred End Time
              </label>
              <input
                type="time"
                value={workPreferences.preferredEndTime}
                onChange={(e) => handleWorkPreferenceChange('preferredEndTime', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Emergency Contact</h3>
          <p className="text-sm text-gray-600">Provide emergency contact information</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Contact Name
              </label>
              <input
                type="text"
                value={workPreferences.emergencyContact.name}
                onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={workPreferences.emergencyContact.phone}
                onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Relationship
            </label>
            <input
              type="text"
              value={workPreferences.emergencyContact.relationship}
              onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
              placeholder="e.g., Spouse, Parent, Friend"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Application Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Application Settings</h3>
          <p className="text-sm text-gray-600">Customize your application experience</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Language
              </label>
              <select
                value={applicationSettings.language}
                onChange={(e) => handleApplicationSettingChange('language', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Timezone
              </label>
              <select
                value={applicationSettings.timezone}
                onChange={(e) => handleApplicationSettingChange('timezone', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Europe/London">Europe/London</option>
                <option value="Europe/Paris">Europe/Paris</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Currency
              </label>
              <select
                value={applicationSettings.currency}
                onChange={(e) => handleApplicationSettingChange('currency', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="GBP">GBP (£)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
                <option value="JPY">JPY (¥)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Theme
              </label>
              <select
                value={applicationSettings.theme}
                onChange={(e) => handleApplicationSettingChange('theme', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Show Tutorials</h4>
              <p className="text-sm text-gray-500">Display helpful tutorials and tips</p>
            </div>
            <button
              onClick={() => handleApplicationSettingChange('showTutorials', !applicationSettings.showTutorials)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                applicationSettings.showTutorials ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  applicationSettings.showTutorials ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Preferences Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Preferences Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-900">Shift Types:</span>
            <span className="text-blue-700 ml-2">
              {workPreferences.preferredShiftType.length} selected
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-900">Travel Distance:</span>
            <span className="text-blue-700 ml-2">
              {workPreferences.maxTravelDistance} miles
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-900">Min Rate:</span>
            <span className="text-blue-700 ml-2">
              £{workPreferences.minimumHourlyRate}/hr
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 