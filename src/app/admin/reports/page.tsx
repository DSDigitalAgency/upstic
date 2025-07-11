'use client';

export default function ReportsPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Reports & Analytics</h2>
        <p className="text-gray-600">Generate insights and track platform performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Monthly Revenue</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">£284,250</p>
              <p className="text-sm text-green-600">+12.5% from last month</p>
            </div>
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Job Fill Rate</h3>
              <p className="text-3xl font-bold text-blue-600 mt-2">87.3%</p>
              <p className="text-sm text-blue-600">+3.2% from last month</p>
            </div>
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Avg. Rating</h3>
              <p className="text-3xl font-bold text-yellow-600 mt-2">4.8/5</p>
              <p className="text-sm text-yellow-600">+0.2 from last month</p>
            </div>
            <svg className="w-8 h-8 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Analytics Dashboard</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <h4 className="font-medium text-gray-900 mb-2">Financial Reports</h4>
              <p className="text-sm text-gray-600">Revenue, costs, and financial performance analytics</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <h4 className="font-medium text-gray-900 mb-2">Performance Analytics</h4>
              <p className="text-sm text-gray-600">Platform usage, job fill rates, and user engagement</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <h4 className="font-medium text-gray-900 mb-2">Compliance Reports</h4>
              <p className="text-sm text-gray-600">Regulatory compliance and audit trail reports</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 