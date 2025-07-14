"use client";
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { saveJob } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Client } from '@/lib/api';
import { apiClient } from '@/lib/api';

export default function NewStaffingRequestPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [clientProfile, setClientProfile] = useState<Client | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    skills: '',
    requirements: '',
    responsibilities: '',
    experience: 0,
    min: 0,
    max: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [clientLoading, setClientLoading] = useState(true);
  const router = useRouter();

  const fetchClientProfile = useCallback(async () => {
    try {
      setClientLoading(true);
      console.log('📡 Fetching client profile...');
      console.log('🔍 Current user:', user);
      console.log('🔍 User ID:', user?.id);
      
      // Test authentication status
      console.log('🔐 Mock API authentication status:', apiClient.isAuthenticated());
      console.log(' Mock API user data:', apiClient.getUserData());
      
      const clientRes = await apiClient.getClients();
      console.log('📥 Client response:', clientRes);
      console.log('📥 Client response success:', clientRes.success);
      console.log('📥 Client response data:', clientRes.data);
      
      // Test direct API access
      try {
        const directClientsResponse = await apiClient.getClients();
        console.log('📁 Direct API clients:', directClientsResponse.data);
      } catch (apiError) {
        console.error('💥 API error:', apiError);
      }
      
      const clients = clientRes.data || [];
      console.log('👥 Available clients:', clients);
      console.log('👥 Number of clients:', clients.length);
      
      // Log each client for debugging
      clients.forEach((client, index) => {
        console.log(`👤 Client ${index + 1}:`, {
          id: client.id,
          userId: client.userId,
          companyName: client.companyName,
          email: client.email
        });
      });
      
      const client = clients.find(c => c.userId === user?.id);
      console.log('🎯 Found client profile:', client);
      console.log('🎯 User ID we are looking for:', user?.id);
      console.log('🎯 Available userIds:', clients.map(c => c.userId));
      
      setClientProfile(client || null);
      
      if (!client) {
        console.log('⚠️ No client profile found for user ID:', user?.id);
        console.log('⚠️ This might be because:');
        console.log('⚠️ - User ID mismatch');
        console.log('⚠️ - Client data not loaded properly');
        console.log('⚠️ - Authentication issue');
        setError('No client profile found. Please contact support.');
      } else {
        console.log('✅ Client profile found successfully!');
      }
    } catch (error) {
      console.error('💥 Error fetching client profile:', error);
      setError('Failed to load client profile. Please try again.');
    } finally {
      setClientLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) {
      console.log('🔄 Authentication is still loading...');
      return;
    }
    
    if (!user) {
      console.log('❌ No user found, authentication may have failed');
      return;
    }
    
    console.log('✅ User authenticated:', user);
    console.log('🔍 User ID:', user.id);
    console.log('🔍 User email:', user.email);
    console.log('🔍 User role:', user.role);
    console.log('🔍 Full user object:', JSON.stringify(user, null, 2));
    
    fetchClientProfile();
  }, [user, authLoading, fetchClientProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Form submission started');
    console.log('📊 Form state:', { authLoading, user: !!user, clientProfile: !!clientProfile });
    
    if (authLoading) {
      console.log('⏳ Authentication is still loading...');
      setError('Please wait for authentication to complete');
      return;
    }
    
    if (!user) {
      console.log('❌ No user found');
      setError('Please log in to create a staffing request');
      return;
    }
    
    if (!clientProfile) {
      console.log('❌ No client profile found');
      setError('Client profile not found. Please contact support.');
      return;
    }
    
    console.log('✅ All checks passed, proceeding with job creation');
    
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log('Submitting job request:', {
        title: form.title,
        description: form.description,
        location: form.location,
        startDate: form.startDate,
        endDate: form.endDate,
        clientId: clientProfile.id,
        status: 'PENDING',
      });
      
      const result = await saveJob({
        title: form.title,
        description: form.description,
        location: form.location,
        startDate: form.startDate,
        endDate: form.endDate,
        skills: form.skills ? form.skills.split(',').map(s => s.trim()).filter(s => s) : [],
        requirements: form.requirements ? form.requirements.split(',').map(s => s.trim()).filter(s => s) : [],
        responsibilities: form.responsibilities ? form.responsibilities.split(',').map(s => s.trim()).filter(s => s).join(', ') : '',
        experience: Number(form.experience) || 0,
        salary: { 
          currency: 'GBP' 
        },
        salaryMin: Number(form.min) || 0,
        salaryMax: Number(form.max) || 0,
        clientId: clientProfile.id,
        status: 'pending',
      });
      
      console.log('Job creation result:', result);
      
      if (result.success) {
        setSuccess('Staffing request created successfully!');
        setTimeout(() => {
      router.push('/client/staffing/requests');
        }, 1500);
      } else {
        setError('Failed to create request');
      }
    } catch (err) {
      console.error('Error creating job:', err);
      setError('Failed to create request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while authentication is in progress
  if (authLoading) {
    return (
      <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // Show error if no user is authenticated
  if (!user) {
    return (
      <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-4">Please log in to create a staffing request.</p>
          <button 
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while fetching client profile
  if (clientLoading) {
    return (
      <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading client profile...</span>
        </div>
      </div>
    );
  }

  // Show error if no client profile is found
  if (!clientProfile) {
    return (
      <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Client Profile Not Found</h1>
          <p className="text-gray-600 mb-4">
            We couldn&apos;t find your client profile. This might be because:
          </p>
          <ul className="text-left text-gray-600 mb-4 list-disc list-inside">
            <li>Your account hasn&apos;t been properly linked to a client profile</li>
            <li>There was an issue loading your profile data</li>
            <li>You may need to contact support to set up your client account</li>
          </ul>
          <p className="text-gray-600 mb-4">
            User ID: {user.id} | Email: {user.email}
          </p>
          <div className="space-y-2">
            <button 
              onClick={() => {
                console.log('🔄 Manually triggering client profile fetch...');
                fetchClientProfile();
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mr-2"
            >
              Retry Client Profile Fetch
            </button>
            <button 
              onClick={() => router.push('/client')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">New Staffing Request</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-900 mb-1">
            Job Title *
          </label>
          <input 
            id="title"
            name="title" 
            value={form.title} 
            onChange={handleChange} 
            required 
            placeholder="e.g., Registered Nurse, Care Assistant" 
            className="w-full border border-gray-300 px-3 py-2 rounded text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-1">
            Job Description *
          </label>
          <textarea 
            id="description"
            name="description" 
            value={form.description} 
            onChange={handleChange} 
            required 
            placeholder="Describe the role, duties, and expectations" 
            className="w-full border border-gray-300 px-3 py-2 rounded text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>
        
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-900 mb-1">
            Work Location *
          </label>
          <input 
            id="location"
            name="location" 
            value={form.location} 
            onChange={handleChange} 
            required 
            placeholder="e.g., London, Manchester, Birmingham" 
            className="w-full border border-gray-300 px-3 py-2 rounded text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>
        
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-gray-900 mb-1">
            Start Date *
          </label>
          <input 
            id="startDate"
            name="startDate" 
            type="date" 
            value={form.startDate} 
            onChange={handleChange} 
            required 
            className="w-full border border-gray-300 px-3 py-2 rounded text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>
        
        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-900 mb-1">
            End Date *
          </label>
          <input 
            id="endDate"
            name="endDate" 
            type="date" 
            value={form.endDate} 
            onChange={handleChange} 
            required 
            className="w-full border border-gray-300 px-3 py-2 rounded text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>
        
        <div>
          <label htmlFor="skills" className="block text-sm font-medium text-gray-900 mb-1">
            Required Skills
          </label>
          <input 
            id="skills"
            name="skills" 
            value={form.skills} 
            onChange={handleChange} 
            placeholder="e.g., Nursing, Patient Care, Communication (comma separated)" 
            className="w-full border border-gray-300 px-3 py-2 rounded text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>
        
        <div>
          <label htmlFor="requirements" className="block text-sm font-medium text-gray-900 mb-1">
            Job Requirements
          </label>
          <input 
            id="requirements"
            name="requirements" 
            value={form.requirements} 
            onChange={handleChange} 
            placeholder="e.g., NMC Registration, DBS Check, Experience (comma separated)" 
            className="w-full border border-gray-300 px-3 py-2 rounded text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>
        
        <div>
          <label htmlFor="responsibilities" className="block text-sm font-medium text-gray-900 mb-1">
            Key Responsibilities
          </label>
          <input 
            id="responsibilities"
            name="responsibilities" 
            value={form.responsibilities} 
            onChange={handleChange} 
            placeholder="e.g., Patient Care, Medication Administration, Documentation (comma separated)" 
            className="w-full border border-gray-300 px-3 py-2 rounded text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>
        
        <div>
          <label htmlFor="experience" className="block text-sm font-medium text-gray-900 mb-1">
            Minimum Experience (Years)
          </label>
          <input 
            id="experience"
            name="experience" 
            type="number" 
            value={form.experience} 
            onChange={handleChange} 
            placeholder="e.g., 2" 
            className="w-full border border-gray-300 px-3 py-2 rounded text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-1">
            Salary Range (GBP)
          </label>
        <div className="flex gap-2">
            <div className="flex-1">
              <label htmlFor="min" className="block text-xs text-gray-600 mb-1">
                Minimum
              </label>
              <input 
                id="min"
                name="min" 
                type="number" 
                value={form.min} 
                onChange={handleChange} 
                placeholder="e.g., 25000" 
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            <div className="flex-1">
              <label htmlFor="max" className="block text-xs text-gray-600 mb-1">
                Maximum
              </label>
              <input 
                id="max"
                name="max" 
                type="number" 
                value={form.max} 
                onChange={handleChange} 
                placeholder="e.g., 35000" 
                className="w-full border border-gray-300 px-3 py-2 rounded text-gray-900 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
          </div>
        </div>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Creating...' : 'Create Request'}
        </button>
      </form>
    </div>
  );
} 