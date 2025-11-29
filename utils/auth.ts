import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL
export const API_BASE_URL = 'https://domainapi.shop/g/backend';

// API Endpoints
export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/login.php`,
  REGISTER: `${API_BASE_URL}/register.php`,
  FORGOT_PASSWORD: `${API_BASE_URL}/forgot-password.php`,
  RESET_PASSWORD: `${API_BASE_URL}/reset-password.php`,
  UPDATE_PROFILE: `${API_BASE_URL}/update-profile.php`,
  LOGOUT: `${API_BASE_URL}/logout.php`,
};

// Storage Keys
export const STORAGE_KEYS = {
  USER_DATA: 'userData',
  USER_ID: 'userId',
  USER_NAME: 'userName',
  USER_MOBILE: 'userMobile',
  USER_LOCATION: 'userLocation',
  IS_LOGGED_IN: 'isLoggedIn',
  SAVED_MOBILE: 'savedMobile',
  SAVED_PASSWORD: 'savedPassword',
  REMEMBER_ME: 'rememberMe',
  AUTH_TOKEN: 'authToken',
};

// Auth Utility Functions
export const AuthUtils = {
  // Check if user is logged in
  isLoggedIn: async (): Promise<boolean> => {
    try {
      const isLoggedIn = await AsyncStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
      return isLoggedIn === 'true';
    } catch (error) {
      console.error('Error checking login status:', error);
      return false;
    }
  },

  // Get current user data
  getCurrentUser: async () => {
    try {
      const userDataStr = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      if (userDataStr) {
        return JSON.parse(userDataStr);
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  // Get user ID
  getUserId: async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  },

  // Save user data
  saveUserData: async (userData: any) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      await AsyncStorage.setItem(STORAGE_KEYS.USER_ID, userData.userId);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_NAME, userData.name);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_MOBILE, userData.mobile);
      await AsyncStorage.setItem(STORAGE_KEYS.USER_LOCATION, userData.location);
      await AsyncStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'true');
      return true;
    } catch (error) {
      console.error('Error saving user data:', error);
      return false;
    }
  },

  // Clear user data (logout)
  clearUserData: async () => {
    try {
      // Remove user data but keep saved credentials if remember me is enabled
      const rememberMe = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
      
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_ID);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_NAME);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_MOBILE);
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_LOCATION);
      await AsyncStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
      await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      
      // Clear saved credentials if remember me is not enabled
      if (rememberMe !== 'true') {
        await AsyncStorage.removeItem(STORAGE_KEYS.SAVED_MOBILE);
        await AsyncStorage.removeItem(STORAGE_KEYS.SAVED_PASSWORD);
      }
      
      return true;
    } catch (error) {
      console.error('Error clearing user data:', error);
      return false;
    }
  },

  // Save login credentials
  saveCredentials: async (mobile: string, password: string) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_MOBILE, mobile);
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_PASSWORD, password);
      await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'true');
      return true;
    } catch (error) {
      console.error('Error saving credentials:', error);
      return false;
    }
  },

  // Get saved credentials
  getSavedCredentials: async () => {
    try {
      const rememberMe = await AsyncStorage.getItem(STORAGE_KEYS.REMEMBER_ME);
      if (rememberMe === 'true') {
        const mobile = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_MOBILE);
        const password = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_PASSWORD);
        return { mobile, password };
      }
      return { mobile: null, password: null };
    } catch (error) {
      console.error('Error getting saved credentials:', error);
      return { mobile: null, password: null };
    }
  },

  // Clear saved credentials
  clearCredentials: async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SAVED_MOBILE);
      await AsyncStorage.removeItem(STORAGE_KEYS.SAVED_PASSWORD);
      await AsyncStorage.setItem(STORAGE_KEYS.REMEMBER_ME, 'false');
      return true;
    } catch (error) {
      console.error('Error clearing credentials:', error);
      return false;
    }
  },
};

// API Helper Functions
export const ApiHelper = {
  // Make POST request
  post: async (endpoint: string, data: any) => {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error('API POST error:', error);
      throw error;
    }
  },

  // Make GET request
  get: async (endpoint: string) => {
    try {
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error('API GET error:', error);
      throw error;
    }
  },

  // Make authenticated request
  authenticatedRequest: async (endpoint: string, method: string = 'GET', data?: any) => {
    try {
      const userId = await AsyncStorage.getItem(STORAGE_KEYS.USER_ID);
      const authToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);

      const headers: any = {
        'Accept': 'application/json',
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      if (method !== 'GET' && data) {
        headers['Content-Type'] = 'application/json';
      }

      const config: any = {
        method,
        headers,
      };

      if (method !== 'GET' && data) {
        // Add userId to the data if available
        if (userId) {
          data.userId = userId;
        }
        config.body = JSON.stringify(data);
      }

      const response = await fetch(endpoint, config);
      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error('Authenticated request error:', error);
      throw error;
    }
  },
};

// Validation utilities
export const ValidationUtils = {
  // Validate Indian mobile number
  isValidMobile: (mobile: string): boolean => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
  },

  // Validate email
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Validate password (minimum 6 characters)
  isValidPassword: (password: string): boolean => {
    return password.length >= 6;
  },

  // Validate name
  isValidName: (name: string): boolean => {
    return name.trim().length >= 2;
  },
};

// Default location (fallback when location permission is denied)
export const DEFAULT_LOCATION = {
  latitude: 22.5411,
  longitude: 88.3378,
  location: 'Lat: 22.5411, Long: 88.3378',
};
