'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getRecommendedJobs } from '@/lib/worker';
import { Job } from '@/lib/api';
import Link from 'next/link';

export default function RecommendedJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecommendedJobs = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const response = await getRecommendedJobs(user.id);
        if (response.success && response.data) {
          setJobs(response.data.items || []);
          setTotalPages(response.data.pages || 1);
        } else {
          setError(response.error || 'Failed to fetch recommended jobs');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendedJobs();
  }, [user, page]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  if (isLoading && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Recommended Jobs</h2>
        <p className="text-gray-700">Jobs that match your skills, experience, and preferences</p>
      </div>

      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <span className="text-sm font-medium text-gray-700">{jobs.length} recommended jobs found</span>
          {isLoading && <span className="ml-2 text-sm text-blue-600">Loading...</span>}
          {error && <span className="ml-2 text-sm text-red-600 font-medium">{error}</span>}
        </div>
        <div className="flex space-x-2 mt-2 md:mt-0">
          <Link href="/worker/jobs" className="px-4 py-3 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors">
            All Jobs
          </Link>
          <Link href="/worker/jobs/applications" className="px-4 py-3 bg-blue-50 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition-colors">
            My Applications
          </Link>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-100 shadow-sm">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No recommended jobs found</h3>
          <p className="mt-2 text-base text-gray-600">
            Update your skills and preferences to get better job recommendations.
          </p>
          <div className="mt-6">
            <Link href="/worker/settings/profile" className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Update Profile
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {jobs.map((job) => (
            <div key={job.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-blue-500 border border-gray-100">
              <div className="flex justify-between">
                <div>
                  <div className="flex items-center">
                    <h3 className="text-xl font-semibold text-gray-900">{job.title}</h3>
                    <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Recommended
                    </span>
                  </div>
                  <p className="text-gray-700 mt-1 font-medium">{job.company?.name || 'Healthcare Facility'}</p>
                </div>
                <div>
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    {job.status || 'Open'}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 flex flex-wrap items-center text-sm text-gray-600 gap-4">
                <div className="flex items-center">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {job.location}
                </div>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {job.experience}+ years experience
                </div>
                <div className="flex items-center">
                  <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  £{job.salaryMin} - £{job.salaryMax} per hour
                </div>
              </div>
              
              <div className="mt-4">
                <p className="text-gray-700 line-clamp-2">{job.description}</p>
              </div>
              
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Skills Match</h4>
                <div className="flex flex-wrap gap-2">
                  {job.skills && job.skills.length > 0 ? (
                    <>
                      {job.skills.slice(0, 4).map((skill, index) => (
                        <span key={index} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 4 && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{job.skills.length - 4} more
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-gray-500">No skills specified</span>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <Link
                  href={`/worker/jobs/${job.id}`}
                  className="px-5 py-2.5 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  View Details
                </Link>
                <Link
                  href={`/worker/jobs/${job.id}?apply=true`}
                  className={`px-5 py-2.5 rounded-lg font-medium ${
                    job.status === 'APPLIED'
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed pointer-events-none'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  } transition-colors`}
                >
                  {job.status === 'APPLIED' ? 'Applied' : 'Apply with Details'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => handlePageChange(pageNum)}
                className={`px-4 py-2 rounded-lg ${
                  pageNum === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            ))}
            
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}
    </div>
  );
} 