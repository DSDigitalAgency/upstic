'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { LoadingButton } from '@/components/ui/loading-button';
import { useAuth } from '@/hooks/useAuth';

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
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  
  const { login, register, isLoading, user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Redirect authenticated users to their appropriate portal
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      const roleRoutes = {
        admin: '/admin',
        client: '/client',
        worker: '/worker'
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
        });
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
