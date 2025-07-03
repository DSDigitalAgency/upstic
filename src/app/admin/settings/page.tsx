'use client';

export default function SettingsPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Platform Settings</h2>
        <p className="text-gray-600">Configure platform settings and preferences</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">System Configuration</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <h4 className="font-medium text-gray-900 mb-2">General Settings</h4>
              <p className="text-sm text-gray-600">Platform name, timezone, and basic configuration</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <h4 className="font-medium text-gray-900 mb-2">User Management</h4>
              <p className="text-sm text-gray-600">User roles, permissions, and access control</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <h4 className="font-medium text-gray-900 mb-2">Notifications</h4>
              <p className="text-sm text-gray-600">Email templates, alerts, and communication settings</p>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Quick Settings</h3>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Platform Settings Management</h3>
            <p className="mt-2 text-gray-600">
              This page will provide comprehensive configuration options for the healthcare platform.
              Manage system-wide settings, user permissions, and operational parameters.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-500">
              <div>• Platform branding and appearance</div>
              <div>• User registration and verification</div>
              <div>• User roles and permissions</div>
              <div>• System configuration</div>
              <div>• Email and notification settings</div>
              <div>• API and integration settings</div>
              <div>• Security and compliance options</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 