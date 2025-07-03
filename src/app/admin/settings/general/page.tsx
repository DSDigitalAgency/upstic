'use client';

export default function GeneralSettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">General Settings</h2>
        <p className="text-gray-600">Platform name, timezone, and basic configuration</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Platform Configuration</h3>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">General Platform Settings</h3>
            <p className="mt-2 text-gray-600">
              Configure basic platform settings including branding, timezone, regional settings, and core operational parameters.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-500">
              <div>• Platform name and branding</div>
              <div>• Timezone and regional settings</div>
              <div>• Currency and payment options</div>
              <div>• Default job parameters</div>
              <div>• Communication preferences</div>
              <div>• System maintenance windows</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 