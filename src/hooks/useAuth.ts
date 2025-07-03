'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient, AuthResponse, LoginRequest, RegisterRequest } from '@/lib/api';

interface AuthState {
  user: AuthResponse['user'] | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthActions {
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  register: (userData: RegisterRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  /**
   * Check authentication status on mount and token change
   */
  const checkAuth = useCallback(async () => {
    console.log('🔍 Checking authentication status...');
    
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      // Check if token exists
      const hasToken = apiClient.isAuthenticated();
      console.log('🎫 Token exists:', hasToken);
      
      if (!hasToken) {
        console.log('❌ No token found, setting unauthenticated state');
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
        return;
      }

      // Get stored user data first for immediate feedback
      const storedUser = apiClient.getUserData();
      console.log('👤 Stored user data:', storedUser);
      
      if (storedUser) {
        console.log('✅ Using stored user data for immediate auth');
        setState({
          user: storedUser,
          isLoading: false,
          isAuthenticated: true,
        });
      }

      // Try to verify token with server, but don't fail if API is unavailable
      console.log('🌐 Verifying token with server...');
      try {
        const response = await apiClient.getCurrentUser();
        console.log('📡 Server verification response:', {
          success: response.success,
          hasData: !!response.data,
          error: response.error
        });
        
        if (response.success && response.data) {
          console.log('✅ Server verification successful');
          console.log('🔍 Server user data:', JSON.stringify(response.data, null, 2));
          console.log('🔍 Stored user data for comparison:', JSON.stringify(storedUser, null, 2));
          
          // Server response should now be properly unwrapped by API client
          if (response.data.role && response.data.firstName) {
            console.log('✅ Server data has complete user info, using it');
            setState({
              user: response.data,
              isLoading: false,
              isAuthenticated: true,
            });
          } else {
            console.log('⚠️ Server data incomplete, keeping stored user data');
            setState({
              user: storedUser,
              isLoading: false,
              isAuthenticated: true,
            });
          }
        } else {
          console.log('⚠️ Server verification failed, keeping stored data if available');
          // If we have stored user data, keep using it
          // Only clear auth if we have no stored data
          if (!storedUser) {
            console.log('❌ No stored data, clearing auth');
            apiClient.clearAuth();
            setState({
              user: null,
              isLoading: false,
              isAuthenticated: false,
            });
          }
        }
      } catch (apiError) {
        // API call failed, but if we have stored user data, keep the user logged in
        console.warn('🔥 API verification failed, using stored user data:', apiError);
        if (storedUser) {
          console.log('✅ Keeping user logged in with stored data');
          setState({
            user: storedUser,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          console.log('❌ No stored data available, setting unauthenticated');
          setState({
            user: null,
            isLoading: false,
            isAuthenticated: false,
          });
        }
      }
    } catch (error) {
      console.error('💥 Auth check failed:', error);
      // Don't clear auth immediately, use stored data if available
      const storedUser = apiClient.getUserData();
      if (storedUser && apiClient.isAuthenticated()) {
        console.log('✅ Error occurred but keeping stored auth data');
        setState({
          user: storedUser,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        console.log('❌ Error occurred and no stored data, clearing auth');
        apiClient.clearAuth();
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
        });
      }
    }
  }, []);

  /**
   * Login function
   */
  const login = useCallback(async (credentials: LoginRequest) => {
    console.log('🚀 useAuth login starting...');
    
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await apiClient.login(credentials);
      
      console.log('📥 useAuth received login response:', {
        success: response.success,
        hasData: !!response.data,
        userRole: response.data?.user?.role,
        error: response.error
      });
      
      if (response.success && response.data) {
        console.log('✅ Setting authenticated state in useAuth');
        setState({
          user: response.data.user,
          isLoading: false,
          isAuthenticated: true,
        });
        
        // Redirect to appropriate portal based on role
        const roleRoutes = {
          admin: '/admin',
          client: '/client',
          worker: '/worker'
        };
        const redirectPath = roleRoutes[response.data.user.role as keyof typeof roleRoutes] || '/';
        console.log(`🎯 Redirecting to: ${redirectPath} (role: ${response.data.user.role})`);
        
        if (typeof window !== 'undefined') {
          // Add a small delay to ensure state is set
          setTimeout(() => {
            console.log('🔄 Executing redirect...');
            window.location.href = redirectPath;
          }, 100);
        }
        
        return { success: true };
      } else {
        console.log('❌ Login failed in useAuth:', response.error);
        setState(prev => ({ ...prev, isLoading: false }));
        return { 
          success: false, 
          error: response.error || 'Login failed' 
        };
      }
    } catch (error) {
      console.error('💥 Login error in useAuth:', error);
      setState(prev => ({ ...prev, isLoading: false }));
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  }, []);

  /**
   * Register function
   */
  const register = useCallback(async (userData: RegisterRequest) => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      
      const response = await apiClient.register(userData);
      
      if (response.success && response.data) {
        setState({
          user: response.data.user,
          isLoading: false,
          isAuthenticated: true,
        });
        
        // Redirect to appropriate portal based on role
        const roleRoutes = {
          admin: '/admin',
          client: '/client',
          worker: '/worker'
        };
        const redirectPath = roleRoutes[response.data.user.role as keyof typeof roleRoutes] || '/';
        if (typeof window !== 'undefined') {
          window.location.href = redirectPath;
        }
        
        return { success: true };
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
        return { 
          success: false, 
          error: response.error || 'Registration failed' 
        };
      }
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    }
  }, []);

  /**
   * Logout function
   */
  const logout = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  }, []);

  /**
   * Check auth status on mount
   */
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    ...state,
    login,
    register,
    logout,
    checkAuth,
  };
} 