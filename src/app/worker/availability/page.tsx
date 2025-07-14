'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getWorkerAvailability, updateAvailability } from '@/lib/worker';

interface DayAvailability {
  day: string;
  available: boolean;
  shifts: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
  };
}

interface Availability {
  id: string;
  workerId: string;
  availableDays: DayAvailability[];
  availableFromDate: string;
  notes: string;
  updatedAt: string;
}

const defaultAvailability: DayAvailability[] = [
  { day: 'Monday', available: false, shifts: { morning: false, afternoon: false, evening: false, night: false } },
  { day: 'Tuesday', available: false, shifts: { morning: false, afternoon: false, evening: false, night: false } },
  { day: 'Wednesday', available: false, shifts: { morning: false, afternoon: false, evening: false, night: false } },
  { day: 'Thursday', available: false, shifts: { morning: false, afternoon: false, evening: false, night: false } },
  { day: 'Friday', available: false, shifts: { morning: false, afternoon: false, evening: false, night: false } },
  { day: 'Saturday', available: false, shifts: { morning: false, afternoon: false, evening: false, night: false } },
  { day: 'Sunday', available: false, shifts: { morning: false, afternoon: false, evening: false, night: false } }
];

export default function AvailabilityPage() {
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [availableDays, setAvailableDays] = useState<DayAvailability[]>(defaultAvailability);
  const [availableFromDate, setAvailableFromDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchAvailability = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const response = await getWorkerAvailability(user.id);
        if (response.success && response.data) {
          setAvailability(response.data);
          setAvailableDays(response.data.availableDays || defaultAvailability);
          setAvailableFromDate(response.data.availableFromDate || '');
          setNotes(response.data.notes || '');
        } else {
          // If no availability data exists yet, use defaults
          setAvailableDays(defaultAvailability);
        }
      } catch (err) {
        setError('An unexpected error occurred while fetching availability');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, [user]);

  const handleDayToggle = (index: number) => {
    setAvailableDays(days => {
      const newDays = [...days];
      newDays[index] = {
        ...newDays[index],
        available: !newDays[index].available,
        // If day is toggled off, also toggle off all shifts
        shifts: !newDays[index].available 
          ? newDays[index].shifts 
          : { morning: false, afternoon: false, evening: false, night: false }
      };
      return newDays;
    });
  };

  const handleShiftToggle = (dayIndex: number, shift: keyof DayAvailability['shifts']) => {
    setAvailableDays(days => {
      const newDays = [...days];
      newDays[dayIndex] = {
        ...newDays[dayIndex],
        shifts: {
          ...newDays[dayIndex].shifts,
          [shift]: !newDays[dayIndex].shifts[shift]
        }
      };
      return newDays;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) return;
    
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const availabilityData = {
        availableDays,
        availableFromDate,
        notes
      };
      
      const response = await updateAvailability(user.id, availabilityData);
      
      if (response.success) {
        setSuccessMessage('Availability updated successfully');
        setAvailability(response.data);
      } else {
        setError(response.error || 'Failed to update availability');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Availability</h2>
        <p className="text-gray-600">Set your work availability to receive matching job opportunities</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>{error}</p>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          <p>{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label htmlFor="availableFromDate" className="block text-sm font-medium text-gray-700 mb-1">
            Available From
          </label>
          <input
            type="date"
            id="availableFromDate"
            value={availableFromDate}
            onChange={(e) => setAvailableFromDate(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">When can you start working?</p>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Availability</h3>
          <div className="space-y-4">
            {availableDays.map((day, index) => (
              <div key={day.day} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`day-${day.day}`}
                      checked={day.available}
                      onChange={() => handleDayToggle(index)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor={`day-${day.day}`} className="ml-2 block text-sm font-medium text-gray-700">
                      {day.day}
                    </label>
                  </div>
                  <span className={`text-sm ${day.available ? 'text-green-600' : 'text-gray-400'}`}>
                    {day.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                
                {day.available && (
                  <div className="ml-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`${day.day}-morning`}
                        checked={day.shifts.morning}
                        onChange={() => handleShiftToggle(index, 'morning')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`${day.day}-morning`} className="ml-2 block text-sm text-gray-700">
                        Morning (6am-12pm)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`${day.day}-afternoon`}
                        checked={day.shifts.afternoon}
                        onChange={() => handleShiftToggle(index, 'afternoon')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`${day.day}-afternoon`} className="ml-2 block text-sm text-gray-700">
                        Afternoon (12pm-6pm)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`${day.day}-evening`}
                        checked={day.shifts.evening}
                        onChange={() => handleShiftToggle(index, 'evening')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`${day.day}-evening`} className="ml-2 block text-sm text-gray-700">
                        Evening (6pm-12am)
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`${day.day}-night`}
                        checked={day.shifts.night}
                        onChange={() => handleShiftToggle(index, 'night')}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={`${day.day}-night`} className="ml-2 block text-sm text-gray-700">
                        Night (12am-6am)
                      </label>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Additional Notes
          </label>
          <textarea
            id="notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional information about your availability..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          ></textarea>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-300"
          >
            {isSaving ? 'Saving...' : 'Save Availability'}
          </button>
        </div>
      </form>
    </div>
  );
} 