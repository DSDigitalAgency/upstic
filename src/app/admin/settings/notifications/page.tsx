'use client';

export default function NotificationSettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Notification Settings</h2>
        <p className="text-gray-600">Email templates, alerts, and communication configuration</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Communication Management</h3>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4 17h5l-5 5v-5zM12 12l8-8m0 0h-5.5M20 4v5.5" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Notification Configuration</h3>
            <p className="mt-2 text-gray-600">
              Configure email templates, notification triggers, alert settings, and communication preferences for all platform users.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-500">
              <div>• Email template management</div>
              <div>• Notification trigger settings</div>
              <div>• SMS and push notifications</div>
              <div>• Alert frequency and timing</div>
              <div>• Emergency communication protocols</div>
              <div>• User preference management</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 