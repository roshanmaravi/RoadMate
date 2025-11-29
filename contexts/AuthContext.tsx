import { AuthUtils } from '@/utils/auth';
import { router } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// User data type
interface UserData {
  userId: string;
  name: string;
  mobile: string;
  location: string;
  city?: string;
}

// Context type
interface AuthContextType {
  isLoggedIn: boolean;
  userData: UserData | null;
  loading: boolean;
  login: (userData: UserData) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  updateUserData: (userData: UserData) => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  // Check if user is logged in
  const checkAuthStatus = async () => {
    try {
      setLoading(true);
      const loggedIn = await AuthUtils.isLoggedIn();
      
      if (loggedIn) {
        const user = await AuthUtils.getCurrentUser();
        if (user) {
          setUserData(user);
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  };

  // Login function
  const login = async (userData: UserData) => {
    try {
      await AuthUtils.saveUserData(userData);
      setUserData(userData);
      setIsLoggedIn(true);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await AuthUtils.clearUserData();
      setUserData(null);
      setIsLoggedIn(false);
      // Navigate to login screen
      router.replace('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  };

  // Update user data
  const updateUserData = async (newUserData: UserData) => {
    try {
      await AuthUtils.saveUserData(newUserData);
      setUserData(newUserData);
      console.log('✅ User data updated successfully:', newUserData);
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  };

  const value = {
    isLoggedIn,
    userData,
    loading,
    login,
    logout,
    checkAuthStatus,
    updateUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// HOC for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function AuthenticatedComponent(props: P) {
    const { isLoggedIn, loading } = useAuth();

    useEffect(() => {
      if (!loading && !isLoggedIn) {
        router.replace('/login');
      }
    }, [isLoggedIn, loading]);

    if (loading) {
      return null;
    }

    if (!isLoggedIn) {
      return null;
    }

    return <Component {...props} />;
  };
}
