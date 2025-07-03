'use client';

export default function PerformanceAnalyticsPage() {
  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Performance Analytics</h2>
        <p className="text-gray-600">Platform usage, job fill rates, and user engagement metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Job Fill Rate</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">87.3%</p>
          <p className="text-sm text-green-600 mt-1">+3.2% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Avg Response Time</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">2.4h</p>
          <p className="text-sm text-blue-600 mt-1">Job acceptance time</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">User Satisfaction</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">4.8/5</p>
          <p className="text-sm text-yellow-600 mt-1">Average rating</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Platform Uptime</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">99.9%</p>
          <p className="text-sm text-purple-600 mt-1">System availability</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Performance Dashboard</h3>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">Platform Performance Analytics</h3>
            <p className="mt-2 text-gray-600">
              Detailed insights into platform performance including user engagement, system metrics, and operational efficiency.
            </p>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-gray-500">
              <div>• Job posting and fill analytics</div>
              <div>• User engagement metrics</div>
              <div>• Response time analysis</div>
              <div>• System performance monitoring</div>
              <div>• Quality and satisfaction scores</div>
              <div>• Operational efficiency reports</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 