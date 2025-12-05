import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

interface Ride {
  id: number;
  userId: string;
  driverName: string;
  driverPhone: string;
  from: string;
  to: string;
  journeyDate: string;
  allDayAvailable: boolean;
  anywhereAvailable: boolean;
  vehicleType: string;
  totalSeats: number;
  availableSeats: number;
  womenBooking: boolean;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  rides: Ride[];
  count: number;
  message?: string;
}

export default function GetRideScreen() {
  const router = useRouter();
  const { userData } = useAuth();

  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [allRides, setAllRides] = useState<Ride[]>([]);
  const [filteredRides, setFilteredRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAllRides();
  }, []);

  // Filter rides whenever search text changes
  useEffect(() => {
    filterRides();
  }, [searchFrom, searchTo, allRides]);

  const fetchAllRides = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch(
        'https://domainapi.shop/g/backend/ride/get-rides.php',
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        }
      );

      const data: ApiResponse = await response.json();
      console.log('API Response:', data);

      if (data.success) {
        setAllRides(data.rides || []);
        setFilteredRides(data.rides || []);
      } else {
        Alert.alert('Error', data.message || 'Failed to load rides');
      }
    } catch (error) {
      console.error('Error fetching rides:', error);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAllRides();
  }, []);

  const filterRides = () => {
    let filtered = [...allRides];

    // Filter by "from" location
    if (searchFrom.trim()) {
      filtered = filtered.filter(ride => {
        const fromMatch = ride.from.toLowerCase().includes(searchFrom.toLowerCase());
        return fromMatch || ride.anywhereAvailable;
      });
    }

    // Filter by "to" location
    if (searchTo.trim()) {
      filtered = filtered.filter(ride => {
        const toMatch = ride.to.toLowerCase().includes(searchTo.toLowerCase());
        return toMatch || ride.anywhereAvailable;
      });
    }

    setFilteredRides(filtered);
  };

  const getVehicleIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bike':
        return 'bicycle';
      case 'car':
        return 'car';
      case 'auto':
        return 'business';
      case 'suv':
        return 'car-sport';
      case 'van':
        return 'bus';
      case 'other':
        return 'ellipsis-horizontal-circle';
      default:
        return 'car';
    }
  };

  const handleBookRide = (ride: Ride) => {
    Alert.alert(
      'Book Ride',
      `Do you want to book a ride with ${ride.driverName}?\n\nFrom: ${ride.from}\nTo: ${ride.to}\nPrice: ₹${ride.availableSeats * 50}/seat`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Book',
          onPress: async () => {
            try {
              // TODO: Implement booking API call
              Alert.alert('Success', 'Ride booked successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to book ride');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Get Ride</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Compact Search Section */}
      <View style={styles.searchSection}>
        <Text style={styles.searchTitle}>Where do you want to go?</Text>
        
        <View style={styles.compactInputRow}>
          {/* From Input */}
          <View style={styles.compactInputWrapper}>
            <Ionicons name="location" size={16} color="#4ECDC4" style={styles.compactIcon} />
            <TextInput
              style={styles.compactInput}
              placeholder="From"
              value={searchFrom}
              onChangeText={setSearchFrom}
              placeholderTextColor="#999"
            />
            {searchFrom ? (
              <TouchableOpacity onPress={() => setSearchFrom('')}>
                <Ionicons name="close-circle" size={16} color="#999" />
              </TouchableOpacity>
            ) : null}
          </View>

          <Ionicons name="arrow-forward" size={16} color="#999" style={styles.arrowIcon} />

          {/* To Input */}
          <View style={styles.compactInputWrapper}>
            <Ionicons name="location-sharp" size={16} color="#4ECDC4" style={styles.compactIcon} />
            <TextInput
              style={styles.compactInput}
              placeholder="To"
              value={searchTo}
              onChangeText={setSearchTo}
              placeholderTextColor="#999"
            />
            {searchTo ? (
              <TouchableOpacity onPress={() => setSearchTo('')}>
                <Ionicons name="close-circle" size={16} color="#999" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Results Count */}
        {!isLoading && (
          <Text style={styles.resultsCount}>
            {filteredRides.length} ride{filteredRides.length !== 1 ? 's' : ''} available
          </Text>
        )}
      </View>

      {/* Results Section */}
      <ScrollView 
        style={styles.resultsSection} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4ECDC4" />
            <Text style={styles.loadingText}>Loading rides...</Text>
          </View>
        ) : filteredRides.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="car-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyStateText}>
              {searchFrom || searchTo ? 'No rides found' : 'No rides available'}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {searchFrom || searchTo 
                ? 'Try different locations or check back later' 
                : 'Rides will appear here when posted'
              }
            </Text>
          </View>
        ) : (
          <>
            {filteredRides.map((ride) => (
              <View key={ride.id} style={styles.rideCard}>
                {/* Ride Header */}
                <View style={styles.rideHeader}>
                  <View style={styles.driverInfo}>
                    <View style={styles.avatarContainer}>
                      <LinearGradient
                        colors={['#4ECDC4', '#44A08D']}
                        style={styles.avatar}
                      >
                        <Text style={styles.avatarText}>
                          {ride.driverName ? ride.driverName.charAt(0).toUpperCase() : 'D'}
                        </Text>
                      </LinearGradient>
                    </View>
                    <View>
                      <Text style={styles.driverName}>{ride.driverName || 'Driver'}</Text>
                      <View style={styles.badgesRow}>
                        {ride.allDayAvailable && (
                          <View style={[styles.badge, { backgroundColor: '#E3F2FD' }]}>
                            <Text style={[styles.badgeText, { color: '#2196F3' }]}>All Day</Text>
                          </View>
                        )}
                        {ride.anywhereAvailable && (
                          <View style={[styles.badge, { backgroundColor: '#F3E5F5' }]}>
                            <Text style={[styles.badgeText, { color: '#9C27B0' }]}>Anywhere</Text>
                          </View>
                        )}
                        {ride.womenBooking && (
                          <View style={[styles.badge, { backgroundColor: '#FFE5E5' }]}>
                            <Text style={[styles.badgeText, { color: '#FF6B6B' }]}>Women Only</Text>
                          </View>
                        )}
                      </View>
                    </View>
                  </View>
                  <View style={styles.vehicleBadge}>
                    <Ionicons 
                      name={getVehicleIcon(ride.vehicleType) as any} 
                      size={20} 
                      color="#4ECDC4" 
                    />
                  </View>
                </View>

                {/* Route Container */}
                <View style={styles.routeContainer}>
                  <View style={styles.routeRow}>
                    <Ionicons name="location" size={18} color="#4ECDC4" />
                    <Text style={styles.routeText}>{ride.from}</Text>
                  </View>
                  <View style={styles.routeDivider}>
                    <View style={styles.routeLine} />
                    <Ionicons name="arrow-down" size={16} color="#999" />
                  </View>
                  <View style={styles.routeRow}>
                    <Ionicons name="location-sharp" size={18} color="#4ECDC4" />
                    <Text style={styles.routeText}>{ride.to}</Text>
                  </View>
                </View>

                {/* Ride Details */}
                <View style={styles.rideDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {ride.allDayAvailable ? 'All Day' : ride.journeyDate}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="people-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {ride.availableSeats}/{ride.totalSeats} seats
                    </Text>
                  </View>
                </View>

                {/* Ride Footer */}
                <View style={styles.rideFooter}>
                  <View>
                    <Text style={styles.priceLabel}>Available Seats</Text>
                    <Text style={styles.priceValue}>{ride.availableSeats} seats</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => handleBookRide(ride)}
                  >
                    <Text style={styles.bookButtonText}>Book Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}
        
        {/* Bottom Padding for Mobile Navigation Buttons */}
        <View style={{ height: 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  searchSection: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E7EB',
  },
  searchTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  compactInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4E7EB',
    paddingHorizontal: 10,
    height: 40,
  },
  compactIcon: {
    marginRight: 6,
  },
  compactInput: {
    flex: 1,
    fontSize: 14,
    color: '#1A1A1A',
    padding: 0,
  },
  arrowIcon: {
    marginHorizontal: 4,
  },
  resultsCount: {
    fontSize: 13,
    color: '#666',
    marginTop: 10,
    fontWeight: '500',
  },
  resultsSection: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  rideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    flex: 1,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  vehicleBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E0F7F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeContainer: {
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  routeText: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
    flex: 1,
  },
  routeDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 9,
    marginVertical: 4,
  },
  routeLine: {
    width: 1,
    height: 16,
    backgroundColor: '#D1D5DB',
    marginRight: 8,
  },
  rideDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
  },
  rideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4ECDC4',
  },
  bookButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
