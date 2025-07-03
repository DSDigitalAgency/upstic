'use client';

export default function AdminUsersPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Users</h2>
        <p className="text-gray-600">Manage platform administrators and permissions</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">All Admin Users (12)</h3>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              Add New Admin
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Admin Users Management</h3>
            <p className="mt-2 text-gray-600">
              This page will contain a comprehensive list of all admin users with role-based access control.
              Features will include user permissions, activity monitoring, and security management.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-500">
              <div>• Admin user profiles</div>
              <div>• Role and permission management</div>
              <div>• Activity and audit logs</div>
              <div>• Two-factor authentication</div>
              <div>• Session management</div>
              <div>• Security settings</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 