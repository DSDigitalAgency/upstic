'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getWorkHistory, addWorkHistoryEntry } from '@/lib/worker';

interface WorkHistoryEntry {
  id: string;
  workerId: string;
  employer: string;
  position: string;
  location: string;
  startDate: string;
  endDate?: string;
  description: string;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function WorkHistoryPage() {
  const [workHistory, setWorkHistory] = useState<WorkHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingEntry, setIsAddingEntry] = useState<boolean>(false);
  const { user } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    employer: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
    isCurrent: false
  });

  useEffect(() => {
    const fetchWorkHistory = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const response = await getWorkHistory(user.id);
        if (response.success && response.data) {
          setWorkHistory(response.data.items || []);
        } else {
          setError(response.error || 'Failed to fetch work history');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkHistory();
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) return;
    
    try {
      const entryData = {
        ...formData,
        endDate: formData.isCurrent ? undefined : formData.endDate
      };
      
      const response = await addWorkHistoryEntry(user.id, entryData);
      
      if (response.success && response.data) {
        // Add the new entry to the list
        setWorkHistory(prev => [response.data, ...prev]);
        
        // Reset form
        setFormData({
          employer: '',
          position: '',
          location: '',
          startDate: '',
          endDate: '',
          description: '',
          isCurrent: false
        });
        
        // Close the form
        setIsAddingEntry(false);
      } else {
        setError(response.error || 'Failed to add work history entry');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Present';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      month: 'short',
      year: 'numeric'
    });
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Work History</h2>
        <p className="text-gray-600">Manage your professional experience and employment history</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          <p>Error: {error}</p>
          <p className="text-sm mt-1">Please try again or contact support if the problem persists.</p>
        </div>
      )}

      <div className="mb-6">
        <button
          onClick={() => setIsAddingEntry(!isAddingEntry)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {isAddingEntry ? 'Cancel' : 'Add Work Experience'}
        </button>
      </div>

      {isAddingEntry && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Add Work Experience</h3>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="employer" className="block text-sm font-medium text-gray-700">Employer</label>
                <input
                  type="text"
                  name="employer"
                  id="employer"
                  required
                  value={formData.employer}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="position" className="block text-sm font-medium text-gray-700">Position</label>
                <input
                  type="text"
                  name="position"
                  id="position"
                  required
                  value={formData.position}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  name="location"
                  id="location"
                  required
                  value={formData.location}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  id="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  id="endDate"
                  required={!formData.isCurrent}
                  disabled={formData.isCurrent}
                  value={formData.endDate}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                />
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isCurrent"
                    id="isCurrent"
                    checked={formData.isCurrent}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isCurrent" className="ml-2 block text-sm text-gray-700">
                    I currently work here
                  </label>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setIsAddingEntry(false)}
                className="mr-3 px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {workHistory.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No work history</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add your work experience to improve your profile and job matches.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {workHistory.map((entry) => (
            <div key={entry.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{entry.position}</h3>
                  <p className="text-gray-600">{entry.employer}</p>
                </div>
                <div className="text-sm text-gray-500">
                  {formatDate(entry.startDate)} - {formatDate(entry.endDate)}
                </div>
              </div>
              <div className="mt-2 flex items-center text-sm text-gray-500">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {entry.location}
              </div>
              {entry.description && (
                <div className="mt-4">
                  <p className="text-gray-600">{entry.description}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 