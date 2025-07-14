'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/api';
import { Worker, Assignment } from '@/demo/func/api';

interface TimesheetDay {
  date: string;
  hours: number;
  startTime: string;
  endTime: string;
  breakMinutes: number;
  notes?: string;
}

interface TimesheetFormData {
  weekStarting: string;
  weekEnding: string;
  days: TimesheetDay[];
  totalHours: number;
  notes?: string;
}

export default function SubmitTimesheet() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const { user } = useAuth();

  const [formData, setFormData] = useState<TimesheetFormData>({
    weekStarting: '',
    weekEnding: '',
    days: [],
    totalHours: 0,
    notes: ''
  });

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        // Fetch all workers and assignments
        const [workersResponse, assignmentsResponse] = await Promise.all([
          apiClient.getWorkers(),
          apiClient.getAssignments()
        ]);
        const workers = workersResponse.data?.items || [];
        const allAssignments = assignmentsResponse.success && assignmentsResponse.data ? assignmentsResponse.data : [];
        // Find the workerId for the current user
        const currentWorker = workers.find((w: Worker) => w.userId === user.id);
        const workerId = currentWorker?.id;
        if (!workerId) {
          setAssignments([]);
          setIsLoading(false);
          return;
        }
        // Filter assignments for this worker
        const workerAssignments = allAssignments.filter(
          (assignment: Assignment) => assignment.workerId === workerId && assignment.status === 'active'
        );
        setAssignments(workerAssignments);
      } catch (err) {
        setError('Failed to load assignments');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssignments();
  }, [user]);

  useEffect(() => {
    if (formData.weekStarting) {
      const startDate = new Date(formData.weekStarting);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      
      const days: TimesheetDay[] = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        days.push({
          date: date.toISOString().split('T')[0],
          hours: 0,
          startTime: '09:00',
          endTime: '17:00',
          breakMinutes: 60,
          notes: ''
        });
      }
      
      setFormData(prev => ({
        ...prev,
        weekEnding: endDate.toISOString().split('T')[0],
        days
      }));
    }
  }, [formData.weekStarting]);

  useEffect(() => {
    const totalHours = formData.days.reduce((sum, day) => sum + day.hours, 0);
    setFormData(prev => ({ ...prev, totalHours }));
  }, [formData.days]);

  const handleWeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, weekStarting: e.target.value }));
  };

  const handleDayChange = (index: number, field: keyof TimesheetDay, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.map((day, i) => 
        i === index ? { ...day, [field]: value } : day
      )
    }));
  };

  const calculateHours = (startTime: string, endTime: string, breakMinutes: number) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end.getTime() - start.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return Math.max(0, diffHours - (breakMinutes / 60));
  };

  const handleTimeChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const updatedDays = formData.days.map((day, i) => {
      if (i === index) {
        const newDay = { ...day, [field]: value };
        newDay.hours = calculateHours(newDay.startTime, newDay.endTime, newDay.breakMinutes);
        return newDay;
      }
      return day;
    });
    
    setFormData(prev => ({ ...prev, days: updatedDays }));
  };

  const handleBreakChange = (index: number, value: number) => {
    const updatedDays = formData.days.map((day, i) => {
      if (i === index) {
        const newDay = { ...day, breakMinutes: value };
        newDay.hours = calculateHours(newDay.startTime, newDay.endTime, newDay.breakMinutes);
        return newDay;
      }
      return day;
    });
    
    setFormData(prev => ({ ...prev, days: updatedDays }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || assignments.length === 0) {
      setError('No active assignments found');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    
    try {
      const assignment = assignments[0]; // Use first active assignment
      const timesheetData = {
        workerId: user.id,
        jobId: assignment.jobId,
        clientId: assignment.clientId,
        weekStarting: formData.weekStarting,
        weekEnding: formData.weekEnding,
        totalHours: formData.totalHours,
        rate: assignment.rate || 25,
        totalPay: formData.totalHours * (assignment.rate || 25),
        days: formData.days,
        notes: formData.notes,
        status: 'pending' as const
      };
      
      const response = await apiClient.post('/timesheets', timesheetData);
      
      if (response.success) {
        setSuccessMessage('Timesheet submitted successfully!');
        // Reset form
        setFormData({
          weekStarting: '',
          weekEnding: '',
          days: [],
          totalHours: 0,
          notes: ''
        });
      } else {
        setError(response.error || 'Failed to submit timesheet');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(amount);
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Submit Timesheet</h2>
        <p className="text-gray-600">Record and submit your work hours for the week</p>
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

      {assignments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No Active Assignments</h3>
            <p className="mt-1 text-sm text-gray-500">You need an active assignment to submit a timesheet.</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Week Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Week Selection</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="weekStarting" className="block text-sm font-medium text-gray-700 mb-1">
                  Week Starting
                </label>
                <input
                  type="date"
                  id="weekStarting"
                  value={formData.weekStarting}
                  onChange={handleWeekChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label htmlFor="weekEnding" className="block text-sm font-medium text-gray-700 mb-1">
                  Week Ending
                </label>
                <input
                  type="date"
                  id="weekEnding"
                  value={formData.weekEnding}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white bg-gray-50"
                />
              </div>
            </div>
          </div>

          {/* Daily Hours */}
          {formData.days.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Daily Hours</h3>
              <div className="space-y-4">
                {formData.days.map((day, index) => (
                  <div key={day.date} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900">
                        {new Date(day.date).toLocaleDateString('en-GB', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">Hours:</span>
                        <span className="font-medium text-gray-900">{day.hours.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                        <input
                          type="time"
                          value={day.startTime}
                          onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                        <input
                          type="time"
                          value={day.endTime}
                          onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Break (minutes)</label>
                        <input
                          type="number"
                          min="0"
                          max="480"
                          value={day.breakMinutes}
                          onChange={(e) => handleBreakChange(index, parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <input
                          type="text"
                          value={day.notes || ''}
                          onChange={(e) => handleDayChange(index, 'notes', e.target.value)}
                          placeholder="Optional notes"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-blue-900">Total Hours</p>
                    <p className="text-2xl font-semibold text-blue-900">{formData.totalHours.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-green-900">Hourly Rate</p>
                    <p className="text-2xl font-semibold text-green-900">
                      {formatCurrency(assignments[0]?.rate || 25)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-purple-900">Total Pay</p>
                    <p className="text-2xl font-semibold text-purple-900">
                      {formatCurrency(formData.totalHours * (assignments[0]?.rate || 25))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h3>
            <textarea
              rows={4}
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any additional notes about your work this week..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting || formData.totalHours === 0}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Timesheet'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
} 