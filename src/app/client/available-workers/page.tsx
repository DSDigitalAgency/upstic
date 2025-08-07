'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/demo/func/api';
import type { Worker, Availability } from '@/demo/func/api';
import WorkerAvailabilityView from '@/components/WorkerAvailabilityView';

export default function AvailableWorkersPage() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [availabilityData, setAvailabilityData] = useState<Availability[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('');
  const [shiftFilter, setShiftFilter] = useState<'all' | 'morning' | 'afternoon' | 'evening' | 'night'>('all');

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
        setError('Failed to load available workers');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const availableWorkers = workers.filter(worker => {
    const workerAvailability = availabilityData.find(a => a.workerId === worker.id);
    return workerAvailability && workerAvailability.availableDays.some(day => day.available);
  });

  const filteredWorkers = availableWorkers.filter(worker => {
    const matchesSearch = search === '' || 
      `${worker.firstName} ${worker.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      worker.email.toLowerCase().includes(search.toLowerCase());
    
    const matchesSkill = skillFilter === '' || 
      worker.skills.some(skill => skill.toLowerCase().includes(skillFilter.toLowerCase()));
    
    if (!matchesSearch || !matchesSkill) return false;
    
    if (shiftFilter === 'all') return true;
    
    const workerAvailability = availabilityData.find(a => a.workerId === worker.id);
    if (workerAvailability) {
      return workerAvailability.availableDays.some(day => 
        day.available && day.shifts[shiftFilter as keyof typeof day.shifts]
      );
    }
    
    return false;
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Workers</h2>
        <p className="text-gray-700">Browse and contact available healthcare workers for your staffing needs</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow-sm p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
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
            <label htmlFor="skillFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Skill
            </label>
            <input
              type="text"
              id="skillFilter"
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              placeholder="e.g., nursing, care..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            />
          </div>
          <div>
            <label htmlFor="shiftFilter" className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Shift
            </label>
            <select
              id="shiftFilter"
              value={shiftFilter}
              onChange={(e) => setShiftFilter(e.target.value as 'all' | 'morning' | 'afternoon' | 'evening' | 'night')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-900"
            >
              <option value="all">All Shifts</option>
              <option value="morning">Morning (6am-12pm)</option>
              <option value="afternoon">Afternoon (12pm-6pm)</option>
              <option value="evening">Evening (6pm-12am)</option>
              <option value="night">Night (12am-6am)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Total Available Workers</p>
          <p className="text-2xl font-bold text-green-600">{availableWorkers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Filtered Results</p>
          <p className="text-2xl font-bold text-blue-600">{filteredWorkers.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600">Average Experience</p>
          <p className="text-2xl font-bold text-gray-900">
            {availableWorkers.length > 0 
              ? Math.round(availableWorkers.length * 5) // Average experience placeholder
              : 0} years
          </p>
        </div>
      </div>

      {/* Available Workers List */}
      <div className="space-y-6">
        {filteredWorkers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No available workers found matching your criteria.</p>
          </div>
        ) : (
          filteredWorkers.map((worker) => {
            const workerAvailability = availabilityData.find(a => a.workerId === worker.id);
            
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
                        Experience: Details available in profile | Rating: {worker.rating}/5
                      </p>
                      <p className="text-sm text-gray-600">
                        Skills: {worker.skills.join(', ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        Contact Worker
                      </button>
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
                      <p className="text-gray-500">No availability data available</p>
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