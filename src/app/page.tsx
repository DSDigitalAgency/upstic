'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { LoadingButton } from '@/components/ui/loading-button';
import { useAuth } from '@/hooks/useAuth';
import { useResume } from '@/contexts/ResumeContext';

export default function Home() {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'worker' as const,
    resume: null as File | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  
  const { login, register, isLoading, user, isAuthenticated } = useAuth();
  const { setResumeData } = useResume();
  const router = useRouter();

  // Redirect authenticated users to their appropriate portal
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const roleRoutes = {
        admin: '/admin',
        client: '/client',
        worker: '/worker/onboarding' // Redirect workers to onboarding first
      };
      const redirectPath = roleRoutes[user.role as keyof typeof roleRoutes] || '/';
      router.push(redirectPath);
    }
  }, [isLoading, isAuthenticated, user, router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (isSignup && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    // Signup-specific validations
    if (isSignup) {
      if (!formData.username) {
        newErrors.username = 'Username is required';
      }
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }
      if (!formData.phone) {
        newErrors.phone = 'Phone number is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear submit error
    if (submitError) {
      setSubmitError('');
    }
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PDF, DOC, or DOCX file');
        return;
      }
      
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      
      setFormData(prev => ({ ...prev, resume: file }));
      
      // Clear submit error
      if (submitError) {
        setSubmitError('');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      let result;
      
      if (isSignup) {
        result = await register({
          email: formData.email,
          password: formData.password,
          username: formData.username,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          role: formData.role,
          resume: formData.resume,
        });
        
        // Store parsed resume data if available
        if (result.success && result.resumeData) {
          setResumeData(result.resumeData);
        }
      } else {
        result = await login({
          email: formData.email,
          password: formData.password,
        });
      }

      if (!result.success) {
        setSubmitError(result.error || 'An error occurred');
      }
      // On success, useAuth will handle the state update and redirect
    } catch {
      setSubmitError('An unexpected error occurred');
    }
  };

  const toggleMode = () => {
    setIsSignup(!isSignup);
    setErrors({});
    setSubmitError('');
    // Keep email and password, clear signup-specific fields
    setFormData(prev => ({
      email: prev.email,
      password: prev.password,
      username: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'worker' as const,
      resume: null,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upstic Healthcare
          </h1>
          <p className="text-gray-600">
            {isSignup ? 'Create your healthcare professional account' : 'Welcome back to your healthcare platform'}
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Login/Signup Toggle */}
          <div className="flex">
            <button
              type="button"
              onClick={() => !isLoading && isSignup && toggleMode()}
              disabled={isLoading}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-200 ${
                !isSignup
                  ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-b-2 border-transparent'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => !isLoading && !isSignup && toggleMode()}
              disabled={isLoading}
              className={`flex-1 py-4 px-6 text-sm font-medium transition-all duration-200 ${
                isSignup
                  ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border-b-2 border-transparent'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              Create Account
            </button>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
                {isSignup ? 'Create Account' : 'Sign In'}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {isSignup 
                  ? 'Fill in your details to get started' 
                  : 'Enter your credentials to access your account'
                }
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                error={errors.email}
                required
                disabled={isLoading}
                placeholder="Enter your email"
              />

              {/* Password Field */}
              <PasswordInput
                label="Password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
                required
                disabled={isLoading}
                placeholder="Enter your password"
                helperText={isSignup ? "Must be at least 8 characters long" : undefined}
              />

              {/* Signup-specific fields */}
              {isSignup && (
                <>
                  <Input
                    label="Username"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    error={errors.username}
                    required
                    disabled={isLoading}
                    placeholder="Choose a username"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="First Name"
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      error={errors.firstName}
                      required
                      disabled={isLoading}
                      placeholder="First name"
                    />

                    <Input
                      label="Last Name"
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      error={errors.lastName}
                      required
                      disabled={isLoading}
                      placeholder="Last name"
                    />
                  </div>

                  <Input
                    label="Phone Number"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    error={errors.phone}
                    required
                    disabled={isLoading}
                    placeholder="Phone number"
                  />

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-900 mb-2">
                      Account Type
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      disabled={isLoading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                    >
                      <option value="worker">Healthcare Professional</option>
                      <option value="client">Healthcare Facility</option>
                    </select>
                  </div>

                  {/* Resume Upload for Workers */}
                  {formData.role === 'worker' && (
                    <div>
                      <label htmlFor="resume" className="block text-sm font-medium text-gray-900 mb-2">
                        Resume/CV (Optional)
                      </label>
                      <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400 transition-colors">
                        <div className="space-y-1 text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <div className="flex text-sm text-gray-600">
                            <label htmlFor="resume-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                              <span>Upload a file</span>
                              <input
                                id="resume-upload"
                                name="resume"
                                type="file"
                                className="sr-only"
                                accept=".pdf,.doc,.docx"
                                onChange={handleResumeUpload}
                              />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                          </div>
                          <p className="text-xs text-gray-500">PDF, DOC, DOCX up to 10MB</p>
                        </div>
                      </div>
                      {formData.resume && (
                        <div className="mt-2 flex items-center space-x-2">
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-600">{formData.resume.name}</span>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, resume: null }))}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* Submit Error */}
              {submitError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {submitError}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <LoadingButton
                type="submit"
                loading={isLoading}
                className="w-full mt-6"
              >
                {isSignup ? 'Create Account' : 'Sign In'}
              </LoadingButton>
            </form>

            {/* Additional Info */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                By {isSignup ? 'creating an account' : 'signing in'}, you agree to our{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-blue-600 hover:text-blue-500">Privacy Policy</a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Secure healthcare workforce management platform
          </p>
        </div>
      </div>
    </div>
  );
}
