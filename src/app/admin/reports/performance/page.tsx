'use client';

import { useEffect, useState } from 'react';
import { 
  getJobAnalytics, 
  getWorkerAnalytics, 
  getApplicationAnalytics, 
  getPlacementAnalytics,
  JobAnalytics,
  WorkerAnalytics,
  ApplicationAnalytics,
  PlacementAnalytics
} from '@/lib/reports';

export default function PerformanceAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jobStats, setJobStats] = useState<JobAnalytics | null>(null);
  const [workerStats, setWorkerStats] = useState<WorkerAnalytics | null>(null);
  const [applicationStats, setApplicationStats] = useState<ApplicationAnalytics | null>(null);
  const [placementStats, setPlacementStats] = useState<PlacementAnalytics | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);

      // Get date range for analytics (last 30 days)
      const endDate = new Date().toISOString();
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const dateParams = { startDate, endDate };

      try {
        const [jobRes, workerRes, appRes, placementRes] = await Promise.all([
          getJobAnalytics(dateParams),
          getWorkerAnalytics(dateParams),
          getApplicationAnalytics(dateParams),
          getPlacementAnalytics(dateParams)
        ]);

        if (jobRes.success && jobRes.data) setJobStats(jobRes.data);
        if (workerRes.success && workerRes.data) setWorkerStats(workerRes.data);
        if (appRes.success && appRes.data) setApplicationStats(appRes.data);
        if (placementRes.success && placementRes.data) setPlacementStats(placementRes.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700 mx-auto mb-4"></div>
          <div className="text-lg font-medium text-gray-800">Loading analytics...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-red-50 p-6 rounded-lg shadow-md max-w-md">
          <div className="text-red-700 text-lg font-medium mb-2">Error Loading Data</div>
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  // Check if we have any data at all
  if (!jobStats && !workerStats && !applicationStats && !placementStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center bg-gray-50 p-6 rounded-lg shadow-md max-w-md">
          <div className="text-gray-800 text-lg font-medium mb-2">No Data Available</div>
          <div className="text-gray-700">No analytics data is currently available for display.</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Performance Analytics</h2>
        <p className="text-gray-700 font-medium">Platform usage, job fill rates, and user engagement metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Only show metrics cards that have data */}
        {jobStats && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800">Job Statistics</h3>
            <p className="text-4xl font-bold text-green-700 mt-2">
              {jobStats.totalJobs}
            </p>
            <p className="text-sm font-medium text-green-700 mt-1">Total jobs</p>
          </div>
        )}

        {jobStats?.trend && jobStats.trend.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
            <p className="text-4xl font-bold text-blue-700 mt-2">
              {jobStats.trend[jobStats.trend.length - 1].posted}
            </p>
            <p className="text-sm font-medium text-blue-700 mt-1">Jobs posted recently</p>
          </div>
        )}

        {workerStats?.averageRating != null && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800">Worker Rating</h3>
            <p className="text-4xl font-bold text-yellow-700 mt-2">
              {`${workerStats.averageRating.toFixed(1)}/5`}
            </p>
            <p className="text-sm font-medium text-yellow-700 mt-1">Average rating</p>
          </div>
        )}

        {placementStats?.satisfactionScore != null && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-800">Placement Success</h3>
            <p className="text-4xl font-bold text-purple-700 mt-2">
              {`${placementStats.satisfactionScore.toFixed(1)}%`}
            </p>
            <p className="text-sm font-medium text-purple-700 mt-1">Satisfaction score</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Statistics - Always show if we have any job data */}
        {jobStats && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Job Statistics</h3>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 gap-4">
                <div className="flex justify-between">
                  <dt className="text-gray-700 font-medium">Total Jobs</dt>
                  <dd className="font-semibold text-gray-900">{jobStats.totalJobs}</dd>
                </div>
                {jobStats.jobsByStatus && (
                  <>
                    <div className="flex justify-between">
                      <dt className="text-gray-700 font-medium">Open Jobs</dt>
                      <dd className="font-semibold text-gray-900">{jobStats.jobsByStatus.open}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-700 font-medium">In Progress</dt>
                      <dd className="font-semibold text-gray-900">{jobStats.jobsByStatus.in_progress}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-700 font-medium">Completed</dt>
                      <dd className="font-semibold text-gray-900">{jobStats.jobsByStatus.completed}</dd>
                    </div>
                  </>
                )}
              </dl>
            </div>
          </div>
        )}

        {/* Top Skills - Show if available */}
        {jobStats?.topSkills && jobStats.topSkills.length > 0 && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Top Required Skills</h3>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 gap-4">
                {jobStats.topSkills.map((skill) => (
                  <div key={skill.skill} className="flex justify-between">
                    <dt className="text-gray-700 font-medium">{skill.skill}</dt>
                    <dd className="font-semibold text-gray-900">{skill.count} jobs</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        )}

        {/* Worker Statistics - Only show if we have worker data */}
        {workerStats && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Worker Performance</h3>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 gap-4">
                <div className="flex justify-between">
                  <dt className="text-gray-700 font-medium">Total Workers</dt>
                  <dd className="font-semibold text-gray-900">{workerStats.totalWorkers || 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-700 font-medium">Active Workers</dt>
                  <dd className="font-semibold text-gray-900">{workerStats.activeWorkers || 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-700 font-medium">On-Time Arrival Rate</dt>
                  <dd className="font-semibold text-gray-900">
                    {workerStats.performanceMetrics?.onTimeArrival != null
                      ? `${workerStats.performanceMetrics.onTimeArrival.toFixed(1)}%`
                      : 'N/A'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* Application Statistics - Only show if we have application data */}
        {applicationStats && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Application Metrics</h3>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 gap-4">
                <div className="flex justify-between">
                  <dt className="text-gray-700 font-medium">Total Applications</dt>
                  <dd className="font-semibold text-gray-900">{applicationStats.totalApplications || 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-700 font-medium">Pending Review</dt>
                  <dd className="font-semibold text-gray-900">{applicationStats.pendingReview || 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-700 font-medium">Conversion Rate</dt>
                  <dd className="font-semibold text-gray-900">
                    {applicationStats.conversionRate != null
                      ? `${applicationStats.conversionRate.toFixed(1)}%`
                      : 'N/A'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* Placement Statistics - Only show if we have placement data */}
        {placementStats && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Placement Analytics</h3>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 gap-4">
                <div className="flex justify-between">
                  <dt className="text-gray-700 font-medium">Total Placements</dt>
                  <dd className="font-semibold text-gray-900">{placementStats.totalPlacements || 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-700 font-medium">Active Placements</dt>
                  <dd className="font-semibold text-gray-900">{placementStats.activePlacements || 0}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-700 font-medium">Average Duration</dt>
                  <dd className="font-semibold text-gray-900">
                    {placementStats.averageDuration != null
                      ? `${placementStats.averageDuration} days`
                      : 'N/A'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* Show message if no detailed stats are available */}
        {!workerStats && !applicationStats && !placementStats && (
          <div className="col-span-2 bg-white rounded-lg shadow p-6">
            <div className="text-center text-gray-500">
              <p>Additional analytics data is not available at this time.</p>
              <p className="text-sm mt-2">Please check back later for worker, application, and placement statistics.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 