'use client';

export default function AuditLogsPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Audit Logs</h2>
        <p className="text-gray-600">Track all compliance-related activities and changes</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Compliance Audit Trail</h3>
            <div className="flex space-x-2">
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                Export Logs
              </button>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                Filter
              </button>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Compliance Audit System</h3>
            <p className="mt-2 text-gray-600">
              Comprehensive audit trail for all compliance activities. Track document changes, verification status, and user actions.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-500">
              <div>• Document upload/update logs</div>
              <div>• Verification status changes</div>
              <div>• User access records</div>
              <div>• System-generated events</div>
              <div>• Admin actions log</div>
              <div>• Compliance violations</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 