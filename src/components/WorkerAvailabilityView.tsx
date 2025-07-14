'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/demo/func/api';
import type { Availability, Worker } from '@/demo/func/api';

interface WorkerAvailabilityViewProps {
  workerId: string;
  worker?: Worker;
  showDetails?: boolean;
}

export default function WorkerAvailabilityView({ workerId, worker, showDetails = true }: WorkerAvailabilityViewProps) {
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAvailability = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await apiClient.getAvailability(workerId);
        
        if (response.success && response.data) {
          setAvailability(response.data);
        } else {
          setError('No availability data found');
        }
      } catch (err) {
        setError('Failed to load availability data');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, [workerId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !availability) {
    return (
      <div className="text-sm text-gray-500 p-2">
        {error || 'No availability set'}
      </div>
    );
  }

  const availableDaysCount = availability.availableDays.filter(day => day.available).length;
  const totalShiftsAvailable = availability.availableDays.reduce((total, day) => {
    if (day.available) {
      return total + Object.values(day.shifts).filter(Boolean).length;
    }
    return total;
  }, 0);

  const getShiftLabel = (shift: string) => {
    switch (shift) {
      case 'morning': return 'Morning';
      case 'afternoon': return 'Afternoon';
      case 'evening': return 'Evening';
      case 'night': return 'Night';
      default: return shift;
    }
  };

  const getShiftTime = (shift: string) => {
    switch (shift) {
      case 'morning': return '6am-12pm';
      case 'afternoon': return '12pm-6pm';
      case 'evening': return '6pm-12am';
      case 'night': return '12am-6am';
      default: return '';
    }
  };

  return (
    <div className="bg-white rounded-lg border p-4">
      {showDetails && (
        <div className="mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {worker ? `${worker.firstName} ${worker.lastName}` : 'Worker'} Availability
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">Available Days</p>
              <p className="text-lg font-semibold text-gray-900">{availableDaysCount}/7</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">Available Shifts</p>
              <p className="text-lg font-semibold text-gray-900">{totalShiftsAvailable}</p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">Available From</p>
              <p className="text-lg font-semibold text-gray-900">
                {availability.availableFromDate ? new Date(availability.availableFromDate).toLocaleDateString() : 'Not set'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {availability.availableDays.map((day) => (
          <div key={day.day} className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-gray-900">{day.day}</span>
              <span className={`text-sm px-2 py-1 rounded-full ${
                day.available 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {day.available ? 'Available' : 'Unavailable'}
              </span>
            </div>
            
            {day.available && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Object.entries(day.shifts).map(([shift, available]) => (
                  <div key={shift} className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      available ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <span className="text-sm text-gray-700">
                      {getShiftLabel(shift)} ({getShiftTime(shift)})
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {showDetails && availability.notes && (
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">Notes:</span> {availability.notes}
          </p>
        </div>
      )}
    </div>
  );
} 