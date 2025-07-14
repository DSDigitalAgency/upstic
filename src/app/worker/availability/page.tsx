'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getWorkerAvailability, updateAvailability } from '@/demo/func/worker';

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

// Common availability patterns
const availabilityPatterns = [
  { name: "Weekdays Only", pattern: [true, true, true, true, true, false, false] },
  { name: "Weekends Only", pattern: [false, false, false, false, false, true, true] },
  { name: "Full Week", pattern: [true, true, true, true, true, true, true] },
  { name: "Clear All", pattern: [false, false, false, false, false, false, false] }
];

// Shift patterns
const shiftPatterns = [
  { name: "Day Shifts", pattern: { morning: true, afternoon: true, evening: false, night: false } as DayAvailability['shifts'] },
  { name: "Night Shifts", pattern: { morning: false, afternoon: false, evening: true, night: true } as DayAvailability['shifts'] },
  { name: "All Shifts", pattern: { morning: true, afternoon: true, evening: true, night: true } as DayAvailability['shifts'] },
  { name: "No Shifts", pattern: { morning: false, afternoon: false, evening: false, night: false } as DayAvailability['shifts'] }
];

export default function AvailabilityPage() {
  const [, setAvailability] = useState<Availability | null>(null);
  const [availableDays, setAvailableDays] = useState<DayAvailability[]>(defaultAvailability);
  const [availableFromDate, setAvailableFromDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const { user } = useAuth();

  // Calculate availability summary
  const availableDaysCount = availableDays.filter(day => day.available).length;
  const totalShiftsAvailable = availableDays.reduce((total, day) => {
    if (day.available) {
      return total + Object.values(day.shifts).filter(Boolean).length;
    }
    return total;
  }, 0);

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

  const applyDayPattern = (pattern: boolean[]) => {
    setAvailableDays(days => {
      return days.map((day, index) => ({
        ...day,
        available: pattern[index],
        shifts: pattern[index] ? day.shifts : { morning: false, afternoon: false, evening: false, night: false }
      }));
    });
  };

  const applyShiftPattern = (pattern: DayAvailability['shifts'], dayIndex?: number) => {
    setAvailableDays(days => {
      if (dayIndex !== undefined) {
        // Apply to a specific day
        const newDays = [...days];
        if (newDays[dayIndex].available) {
          newDays[dayIndex] = {
            ...newDays[dayIndex],
            shifts: { ...pattern }
          };
        }
        return newDays;
      } else {
        // Apply to all available days
        return days.map(day => ({
          ...day,
          shifts: day.available ? { ...pattern } : day.shifts
        }));
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const confirmSubmit = async () => {
    if (!user?.id) return;
    
    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);
    setShowConfirmation(false);
    
    try {
      const availabilityData = {
        availableDays,
        availableFromDate,
        notes
      };
      
      const response = await updateAvailability(user.id, availabilityData);
      
      if (response.success && response.data) {
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
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-blue-100 rounded-lg mr-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Availability</h2>
            <p className="text-gray-600">Set your work availability to receive matching job opportunities</p>
          </div>
        </div>
      </div>

      {/* Availability Summary */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 shadow-sm">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-blue-100 rounded-lg mr-3">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900">Availability Summary</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Available Days</p>
                <p className="text-3xl font-bold text-gray-900">{availableDaysCount}/7</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Available Shifts</p>
                <p className="text-3xl font-bold text-gray-900">{totalShiftsAvailable}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Available From</p>
                <p className="text-lg font-semibold text-gray-900">
                  {availableFromDate ? new Date(availableFromDate).toLocaleDateString() : 'Not set'}
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
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

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-green-100 rounded-lg mr-3">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Start Date</h3>
          </div>
          <label htmlFor="availableFromDate" className="block text-sm font-medium text-gray-700 mb-2">
            Available From
          </label>
          <input
            type="date"
            id="availableFromDate"
            value={availableFromDate}
            onChange={(e) => setAvailableFromDate(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 bg-white text-gray-900 transition-colors"
          />
          <p className="mt-2 text-sm text-gray-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            When can you start working?
          </p>
        </div>

        {/* Quick Select Patterns */}
        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Quick Select</h3>
          </div>
          
          <div className="mb-6">
            <p className="text-sm font-medium text-gray-900 mb-3">Common Day Patterns:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {availabilityPatterns.map((pattern, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => applyDayPattern(pattern.pattern)}
                  className="px-4 py-3 text-sm font-medium bg-gray-50 hover:bg-blue-50 text-gray-900 border border-gray-200 rounded-lg transition-all duration-200 hover:shadow-sm"
                >
                  {pattern.name}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-gray-900 mb-3">Shift Patterns (applies to available days):</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {shiftPatterns.map((pattern, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => applyShiftPattern(pattern.pattern)}
                  className="px-4 py-3 text-sm font-medium bg-gray-50 hover:bg-blue-50 text-gray-900 border border-gray-200 rounded-lg transition-all duration-200 hover:shadow-sm"
                >
                  {pattern.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-purple-100 rounded-lg mr-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Weekly Availability</h3>
          </div>
          <div className="space-y-4">
            {availableDays.map((day, index) => (
              <div key={day.day} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`day-${day.day}`}
                      checked={day.available}
                      onChange={() => handleDayToggle(index)}
                      className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                    />
                    <label htmlFor={`day-${day.day}`} className="ml-3 block text-lg font-semibold text-gray-900">
                      {day.day}
                    </label>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    day.available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {day.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                
                {day.available && (
                  <>
                    <div className="ml-6 mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-3">Select Available Shifts:</p>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <input
                            type="checkbox"
                            id={`${day.day}-morning`}
                            checked={day.shifts.morning}
                            onChange={() => handleShiftToggle(index, 'morning')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`${day.day}-morning`} className="ml-3 block text-sm font-medium text-gray-900">
                            Morning (6am-12pm)
                          </label>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <input
                            type="checkbox"
                            id={`${day.day}-afternoon`}
                            checked={day.shifts.afternoon}
                            onChange={() => handleShiftToggle(index, 'afternoon')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`${day.day}-afternoon`} className="ml-3 block text-sm font-medium text-gray-900">
                            Afternoon (12pm-6pm)
                          </label>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <input
                            type="checkbox"
                            id={`${day.day}-evening`}
                            checked={day.shifts.evening}
                            onChange={() => handleShiftToggle(index, 'evening')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`${day.day}-evening`} className="ml-3 block text-sm font-medium text-gray-900">
                            Evening (6pm-12am)
                          </label>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <input
                            type="checkbox"
                            id={`${day.day}-night`}
                            checked={day.shifts.night}
                            onChange={() => handleShiftToggle(index, 'night')}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label htmlFor={`${day.day}-night`} className="ml-3 block text-sm font-medium text-gray-900">
                            Night (12am-6am)
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="ml-6">
                      <p className="text-sm font-medium text-gray-700 mb-2">Quick Shift Patterns:</p>
                      <div className="flex flex-wrap gap-2">
                        {shiftPatterns.map((pattern, patternIndex) => (
                          <button
                            key={patternIndex}
                            type="button"
                            onClick={() => applyShiftPattern(pattern.pattern, index)}
                            className="px-3 py-2 text-xs font-medium bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                          >
                            {pattern.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="p-2 bg-yellow-100 rounded-lg mr-3">
              <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900">Additional Notes</h3>
          </div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            Additional Information
          </label>
          <textarea
            id="notes"
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any additional information about your availability, preferences, or special requirements..."
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 bg-white text-gray-900 transition-colors resize-none"
          ></textarea>
          <p className="mt-2 text-sm text-gray-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Optional: Add notes about your preferences or special requirements
          </p>
        </div>

        <div className="flex justify-end pt-6 border-t border-gray-200">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {isSaving ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </div>
            ) : (
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Availability
              </div>
            )}
          </button>
        </div>
      </form>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-blue-100 rounded-full mr-3">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Confirm Availability Update</h3>
              </div>
              <p className="text-gray-600 mb-6">Are you sure you want to update your availability? This will affect which jobs are recommended to you.</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmSubmit}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg"
                >
                  Confirm Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 