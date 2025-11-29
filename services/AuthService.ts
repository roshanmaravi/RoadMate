// services/AuthService.ts
import { ApiHelper, API_ENDPOINTS } from '@/utils/auth';
import * as Location from 'expo-location';

interface LoginPayload {
  mobile: string;
  password: string;
  latitude: number;
  longitude: number;
  location: string;
}

interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    userId: string;
    name: string;
    mobile: string;
    location: string;
  };
}

interface UserLocation {
  latitude: number;
  longitude: number;
  location: string;
}

export class AuthService {
  // Get user's current location
  static async getCurrentLocation(): Promise<UserLocation> {
    try {
      // Request location permission
      let { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        console.warn('Location permission denied, using default location');
        return {
          latitude: 22.935857249999998,
          longitude: 81.080426,
          location: 'Lat: 22.9359, Long: 81.0804'
        };
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = currentLocation.coords;
      
      return {
        latitude,
        longitude,
        location: `Lat: ${latitude.toFixed(4)}, Long: ${longitude.toFixed(4)}`
      };
    } catch (error) {
      console.error('Error getting location:', error);
      // Return default location on error
      return {
        latitude: 22.935857249999998,
        longitude: 81.080426,
        location: 'Lat: 22.9359, Long: 81.0804'
      };
    }
  }

  // Login API call
  static async login(mobile: string, password: string): Promise<LoginResponse> {
    try {
      // Get user location
      const locationData = await this.getCurrentLocation();
      
      // Prepare payload
      const payload: LoginPayload = {
        mobile,
        password,
        latitude: locationData.latitude,
        longitude: locationData.longitude,
        location: locationData.location
      };

      console.log('Login payload:', payload);

      // Make API call
      const response = await ApiHelper.post(API_ENDPOINTS.LOGIN, payload);
      
      console.log('Login response:', response);
      
      return response;
    } catch (error) {
      console.error('Login API error:', error);
      
      return {
        success: false,
        message: 'Network error. Please check your internet connection.',
      };
    }
  }

  // Validate mobile number (Indian format)
  static validateMobile(mobile: string): boolean {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
  }

  // Validate password
  static validatePassword(password: string): boolean {
    return password.length >= 6;
  }
}

export default AuthService;
