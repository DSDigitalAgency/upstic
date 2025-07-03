'use client';

export default function ExpiryTrackingPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Expiry Tracking</h2>
        <p className="text-gray-600">Monitor document expiration dates and send automated alerts</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
          <h3 className="text-lg font-medium text-gray-900">Expired</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">8</p>
          <p className="text-sm text-red-600 mt-1">Immediate attention required</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-yellow-500">
          <h3 className="text-lg font-medium text-gray-900">Expiring Soon</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">23</p>
          <p className="text-sm text-yellow-600 mt-1">Within 30 days</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
          <h3 className="text-lg font-medium text-gray-900">Due for Renewal</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">156</p>
          <p className="text-sm text-blue-600 mt-1">Within 90 days</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
          <h3 className="text-lg font-medium text-gray-900">Up to Date</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">11,234</p>
          <p className="text-sm text-green-600 mt-1">Current and valid</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Expiry Management Dashboard</h3>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Document Expiry Tracking</h3>
            <p className="mt-2 text-gray-600">
              Automated monitoring system for all compliance documents with smart alerts and renewal reminders.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-500">
              <div>• Automated expiry alerts</div>
              <div>• Renewal reminders</div>
              <div>• Bulk status updates</div>
              <div>• Email notifications</div>
              <div>• Calendar integration</div>
              <div>• Compliance reporting</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 