'use client';

export default function ComplianceReportsPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Compliance Reports</h2>
        <p className="text-gray-600">Regulatory compliance and audit trail reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Compliance Rate</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">98.7%</p>
          <p className="text-sm text-green-600 mt-1">Platform wide</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Active Violations</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">3</p>
          <p className="text-sm text-red-600 mt-1">Requiring attention</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Audits Completed</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">156</p>
          <p className="text-sm text-blue-600 mt-1">This quarter</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Risk Score</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">Low</p>
          <p className="text-sm text-yellow-600 mt-1">Overall platform risk</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Compliance Analytics</h3>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Regulatory Compliance Dashboard</h3>
            <p className="mt-2 text-gray-600">
              Comprehensive compliance reporting for healthcare regulations, data protection, and industry standards.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-500">
              <div>• GDPR compliance reports</div>
              <div>• Healthcare regulation audits</div>
              <div>• Data protection assessments</div>
              <div>• Staff certification tracking</div>
              <div>• Facility accreditation status</div>
              <div>• Regulatory filing reports</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 