'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/demo/func/api';
import type { Worker, Availability } from '@/demo/func/api';
import WorkerAvailabilityView from '@/components/WorkerAvailabilityView';

export default function AdminAvailabilityPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [availabilityData, setAvailabilityData] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'available' | 'unavailable'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch workers
        const workersResponse = await apiClient.getWorkers(1, 50);
        const workersData = workersResponse.success && workersResponse.data ? workersResponse.data.items : [];

        // Fetch availability data
        const availabilityResponse = await apiClient.getAvailability();
        const availabilityData = availabilityResponse.success && availabilityResponse.data ? [availabilityResponse.data] : [];

        setWorkers(workersData);
        setAvailabilityData(availabilityData);
      } catch (err) {
        setError('Failed to load availability data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = search === '' || 
      `${worker.firstName} ${worker.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      worker.email.toLowerCase().includes(search.toLowerCase());
    
    if (!matchesSearch) return false;
    
    if (filter === 'all') return true;
    
    const workerAvailability = availabilityData.find(a => a.workerId === worker.id);
    if (filter === 'available') {
      return workerAvailability && workerAvailability.availableDays.some(day => day.available);
    }
    if (filter === 'unavailable') {
      return !workerAvailability || !workerAvailability.availableDays.some(day => day.available);
    }
    
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Worker Availability</h2>
        <p className="text-gray-700">View and manage worker availability across the platform</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Workers
            </label>
            <input
              type="text"
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            />
          </div>
          <div>
            <label htmlFor="filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Status
            </label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value as 'all' | 'available' | 'unavailable')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            >
              <option value="all">All Workers</option>
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Total Workers</p>
          <p className="text-2xl font-bold text-gray-900">{workers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Available Workers</p>
          <p className="text-2xl font-bold text-green-600">
            {availabilityData.filter(a => a.availableDays.some(day => day.available)).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">No Availability Set</p>
          <p className="text-2xl font-bold text-gray-600">
            {workers.length - availabilityData.length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Filtered Results</p>
          <p className="text-2xl font-bold text-blue-600">{filteredWorkers.length}</p>
        </div>
      </div>

      {/* Worker Availability List */}
      <div className="space-y-6">
        {filteredWorkers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No workers found matching your criteria.</p>
          </div>
        ) : (
          filteredWorkers.map((worker) => {
            const workerAvailability = availabilityData.find(a => a.workerId === worker.id);
            const hasAvailability = workerAvailability && workerAvailability.availableDays.some(day => day.available);
            
            return (
              <div key={worker.id} className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {worker.firstName} {worker.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{worker.email}</p>
                      <p className="text-sm text-gray-600">
                        Skills: {worker.skills.join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        hasAvailability 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {hasAvailability ? 'Available' : 'No Availability Set'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  {workerAvailability ? (
                    <WorkerAvailabilityView 
                      workerId={worker.id} 
                      worker={worker}
                      showDetails={false}
                    />
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500">No availability data set</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
} 