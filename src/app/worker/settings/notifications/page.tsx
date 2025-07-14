'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getWorkerPreferences, updatePreferences } from '@/lib/worker';

interface NotificationSettings {
  email: {
    jobAlerts: boolean;
    assignmentUpdates: boolean;
    timesheetReminders: boolean;
    paymentNotifications: boolean;
    complianceAlerts: boolean;
    systemUpdates: boolean;
  };
  sms: {
    urgentAssignments: boolean;
    criticalAlerts: boolean;
    paymentConfirmations: boolean;
  };
  push: {
    newJobs: boolean;
    assignmentChanges: boolean;
    timesheetApprovals: boolean;
    paymentUpdates: boolean;
    documentExpiry: boolean;
  };
}

interface PrivacySettings {
  profileVisibility: 'PUBLIC' | 'PRIVATE' | 'CONNECTIONS_ONLY';
  showContactInfo: boolean;
  showAvailability: boolean;
  showRating: boolean;
  showCompletedJobs: boolean;
}

export default function NotificationSettings() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: {
      jobAlerts: true,
      assignmentUpdates: true,
      timesheetReminders: true,
      paymentNotifications: true,
      complianceAlerts: true,
      systemUpdates: false
    },
    sms: {
      urgentAssignments: true,
      criticalAlerts: true,
      paymentConfirmations: false
    },
    push: {
      newJobs: true,
      assignmentChanges: true,
      timesheetApprovals: true,
      paymentUpdates: true,
      documentExpiry: true
    }
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    profileVisibility: 'PUBLIC',
    showContactInfo: true,
    showAvailability: true,
    showRating: true,
    showCompletedJobs: true
  });

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await getWorkerPreferences(user.id);
        if (response.success && response.data) {
          // Map API data to our local state structure
          const apiData = response.data;
          
          // Update notification settings
          if (apiData.notifications) {
            setNotificationSettings({
              email: {
                jobAlerts: true,
                assignmentUpdates: true,
                timesheetReminders: true,
                paymentNotifications: true,
                complianceAlerts: true,
                systemUpdates: false
              },
              sms: {
                urgentAssignments: true,
                criticalAlerts: true,
                paymentConfirmations: false
              },
              push: {
                newJobs: true,
                assignmentChanges: true,
                timesheetApprovals: true,
                paymentUpdates: true,
                documentExpiry: true
              }
            });
          }
          
          // Update privacy settings
          if (apiData.privacy) {
            setPrivacySettings({
              profileVisibility: apiData.privacy.profileVisibility || 'PUBLIC',
              showContactInfo: apiData.privacy.showContactInfo || true,
              showAvailability: true,
              showRating: true,
              showCompletedJobs: true
            });
          }
        } else {
          setError('Failed to load notification preferences');
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

  const handleNotificationToggle = (category: keyof NotificationSettings, setting: string) => {
    setNotificationSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting as keyof typeof prev[typeof category]]
      }
    }));
  };

  const handlePrivacyToggle = (setting: keyof PrivacySettings, value?: PrivacySettings[keyof PrivacySettings]) => {
    setPrivacySettings(prev => ({
      ...prev,
      [setting]: value !== undefined ? value : !prev[setting]
    }));
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const preferencesData = {
        notifications: {
          email: notificationSettings.email.jobAlerts || notificationSettings.email.assignmentUpdates,
          sms: notificationSettings.sms.urgentAssignments || notificationSettings.sms.criticalAlerts,
          push: notificationSettings.push.newJobs || notificationSettings.push.assignmentChanges
        },
        privacy: {
          profileVisibility: privacySettings.profileVisibility,
          showContactInfo: privacySettings.showContactInfo
        },
        preferences: {
          preferredShiftType: ['Day', 'Night'],
          maxTravelDistance: 30,
          minimumHourlyRate: 20
        }
      };
      
      const response = await updatePreferences(user.id, preferencesData);
      
      if (response.success) {
        setSuccessMessage('Notification settings updated successfully');
      } else {
        setError('Failed to update notification settings');
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
          <h1 className="text-2xl font-semibold text-gray-900">Notification Settings</h1>
          <p className="text-gray-600">Manage your notification preferences and privacy settings</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
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

      {/* Email Notifications */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
          <p className="text-sm text-gray-600">Receive important updates via email</p>
        </div>
        <div className="p-6 space-y-4">
          {Object.entries(notificationSettings.email).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h4>
                <p className="text-sm text-gray-500">
                  {key === 'jobAlerts' && 'Get notified about new job opportunities'}
                  {key === 'assignmentUpdates' && 'Receive updates about your assignments'}
                  {key === 'timesheetReminders' && 'Get reminders to submit timesheets'}
                  {key === 'paymentNotifications' && 'Receive payment confirmations and updates'}
                  {key === 'complianceAlerts' && 'Get alerts about expiring documents'}
                  {key === 'systemUpdates' && 'Receive platform updates and announcements'}
                </p>
              </div>
              <button
                onClick={() => handleNotificationToggle('email', key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* SMS Notifications */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">SMS Notifications</h3>
          <p className="text-sm text-gray-600">Receive urgent notifications via SMS</p>
        </div>
        <div className="p-6 space-y-4">
          {Object.entries(notificationSettings.sms).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h4>
                <p className="text-sm text-gray-500">
                  {key === 'urgentAssignments' && 'Get SMS for urgent assignment requests'}
                  {key === 'criticalAlerts' && 'Receive critical system alerts via SMS'}
                  {key === 'paymentConfirmations' && 'Get SMS confirmations for payments'}
                </p>
              </div>
              <button
                onClick={() => handleNotificationToggle('sms', key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Push Notifications */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Push Notifications</h3>
          <p className="text-sm text-gray-600">Receive real-time notifications in your browser</p>
        </div>
        <div className="p-6 space-y-4">
          {Object.entries(notificationSettings.push).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </h4>
                <p className="text-sm text-gray-500">
                  {key === 'newJobs' && 'Get notified about new job opportunities'}
                  {key === 'assignmentChanges' && 'Receive updates about assignment changes'}
                  {key === 'timesheetApprovals' && 'Get notified when timesheets are approved'}
                  {key === 'paymentUpdates' && 'Receive payment status updates'}
                  {key === 'documentExpiry' && 'Get alerts about expiring documents'}
                </p>
              </div>
              <button
                onClick={() => handleNotificationToggle('push', key)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  value ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    value ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Privacy Settings</h3>
          <p className="text-sm text-gray-600">Control who can see your profile information</p>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Profile Visibility
            </label>
            <select
              value={privacySettings.profileVisibility}
              onChange={(e) => handlePrivacyToggle('profileVisibility', e.target.value as 'PUBLIC' | 'PRIVATE' | 'CONNECTIONS_ONLY')}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="PUBLIC">Public - Anyone can view</option>
              <option value="CONNECTIONS_ONLY">Connections Only - Only connected clients</option>
              <option value="PRIVATE">Private - Only you can view</option>
            </select>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Show Contact Information</h4>
                <p className="text-sm text-gray-500">Display your phone number and email to clients</p>
              </div>
              <button
                onClick={() => handlePrivacyToggle('showContactInfo')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  privacySettings.showContactInfo ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacySettings.showContactInfo ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Show Availability</h4>
                <p className="text-sm text-gray-500">Display your current availability status</p>
              </div>
              <button
                onClick={() => handlePrivacyToggle('showAvailability')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  privacySettings.showAvailability ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacySettings.showAvailability ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Show Rating</h4>
                <p className="text-sm text-gray-500">Display your average rating to clients</p>
              </div>
              <button
                onClick={() => handlePrivacyToggle('showRating')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  privacySettings.showRating ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacySettings.showRating ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Show Completed Jobs</h4>
                <p className="text-sm text-gray-500">Display your total completed jobs count</p>
              </div>
              <button
                onClick={() => handlePrivacyToggle('showCompletedJobs')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  privacySettings.showCompletedJobs ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    privacySettings.showCompletedJobs ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Notification Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-900">Email:</span>
            <span className="text-blue-700 ml-2">
              {Object.values(notificationSettings.email).filter(Boolean).length} active
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-900">SMS:</span>
            <span className="text-blue-700 ml-2">
              {Object.values(notificationSettings.sms).filter(Boolean).length} active
            </span>
          </div>
          <div>
            <span className="font-medium text-blue-900">Push:</span>
            <span className="text-blue-700 ml-2">
              {Object.values(notificationSettings.push).filter(Boolean).length} active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 