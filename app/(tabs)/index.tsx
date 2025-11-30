import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
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
  additionalDetails?: string;
  createdAt: string;
}

interface ApiResponse {
  success: boolean;
  rides: Ride[];
  count: number;
  message?: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { userData } = useAuth();

  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');
  const [allRides, setAllRides] = useState<Ride[]>([]);
  const [filteredRides, setFilteredRides] = useState<Ride[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Booking modal state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedRide, setSelectedRide] = useState<Ride | null>(null);
  const [seatsToBook, setSeatsToBook] = useState('1');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    fetchAllRides();
  }, []);

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

      if (data.success) {
        setAllRides(data.rides || []);
        setFilteredRides(data.rides || []);
      }
    } catch (error) {
      console.error('Error fetching rides:', error);
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

    if (searchFrom.trim()) {
      filtered = filtered.filter(ride => {
        const fromMatch = ride.from.toLowerCase().includes(searchFrom.toLowerCase());
        return fromMatch;
      });
    }

    if (searchTo.trim()) {
      filtered = filtered.filter(ride => {
        const toMatch = ride.to.toLowerCase().includes(searchTo.toLowerCase());
        return toMatch;
      });
    }

    setFilteredRides(filtered);
  };

  const getVehicleIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'bike': return 'bicycle';
      case 'car': return 'car';
      case 'auto': return 'business';
      case 'suv': return 'car-sport';
      case 'van': return 'bus';
      case 'other': return 'ellipsis-horizontal-circle';
      default: return 'car';
    }
  };

  const handleBookRideClick = (ride: Ride) => {
    setSelectedRide(ride);
    setSeatsToBook('1');
    setPhoneNumber(userData?.phone || '');
    setShowBookingModal(true);
  };

  const handleConfirmBooking = async () => {
    if (!selectedRide || !userData) return;

    if (!phoneNumber || phoneNumber.trim() === '') {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    if (phoneNumber.length < 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    const seats = parseInt(seatsToBook);
    if (isNaN(seats) || seats <= 0) {
      Alert.alert('Error', 'Please enter valid number of seats');
      return;
    }

    if (seats > selectedRide.availableSeats) {
      Alert.alert('Error', `Only ${selectedRide.availableSeats} seat(s) available`);
      return;
    }

    setIsBooking(true);

    try {
      const payload = {
        rideId: selectedRide.id,
        userId: userData.userId,
        passengerName: userData.name || 'User',
        passengerPhone: phoneNumber.trim(),
        seatsBooked: seats,
      };

      const response = await fetch(
        'https://domainapi.shop/g/backend/ride/book-ride.php',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (data.success) {
        setShowBookingModal(false);
        Alert.alert(
          'Success!',
          `Your ride has been booked!\n\nBooking ID: ${data.bookingId}\nSeats: ${seats}\n\nThe driver will contact you soon.`,
          [
            {
              text: 'OK',
              onPress: () => {
                fetchAllRides();
              },
            },
          ]
        );
      } else {
        Alert.alert('Booking Failed', data.message || 'Unable to book ride');
      }
    } catch (error) {
      console.error('Booking error:', error);
      Alert.alert('Error', 'Failed to connect to server');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#667EEA" barStyle="light-content" />
      
      <LinearGradient
        colors={['#667EEA', '#764BA2']}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('@/assets/images/icon.png')} 
              style={styles.logoImage}
              resizeMode="contain"
            />
            {/* <Text style={styles.logoText}>RoadMate</Text> */}
          </View>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => router.push('/profile')}
          >
            <LinearGradient
              colors={['#FFFFFF', '#F0F0F0']}
              style={styles.profileGradient}
            >
              <Text style={styles.profileText}>
                {userData?.name ? userData.name.charAt(0).toUpperCase() : 'R'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.giveRideButton}
          onPress={() => router.push('/give-ride')}
        >
          <Ionicons name="add-circle" size={20} color="#FFFFFF" />
          <Text style={styles.giveRideText}>Give Ride</Text>
        </TouchableOpacity>

        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="location" size={18} color="#667EEA" />
            <TextInput
              style={styles.searchInput}
              placeholder="From"
              value={searchFrom}
              onChangeText={setSearchFrom}
              placeholderTextColor="#999"
            />
            {searchFrom ? (
              <TouchableOpacity onPress={() => setSearchFrom('')}>
                <Ionicons name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            ) : null}
          </View>

          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" style={styles.searchArrow} />

          <View style={styles.searchInputWrapper}>
            <Ionicons name="location-sharp" size={18} color="#667EEA" />
            <TextInput
              style={styles.searchInput}
              placeholder="To"
              value={searchTo}
              onChangeText={setSearchTo}
              placeholderTextColor="#999"
            />
            {searchTo ? (
              <TouchableOpacity onPress={() => setSearchTo('')}>
                <Ionicons name="close-circle" size={18} color="#999" />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.ridesHeader}>
          <Text style={styles.ridesTitle}>
            {searchFrom || searchTo ? 'Search Results' : 'Available Rides'}
          </Text>
          <Text style={styles.ridesCount}>
            {filteredRides.length} ride{filteredRides.length !== 1 ? 's' : ''}
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667EEA" />
            <Text style={styles.loadingText}>Finding rides...</Text>
          </View>
        ) : filteredRides.length === 0 ? (
          <View style={styles.emptyState}>
            <LinearGradient
              colors={['#F3F0FF', '#E8E3FF']}
              style={styles.emptyGradient}
            >
              <Ionicons name="car-outline" size={64} color="#667EEA" />
              <Text style={styles.emptyStateText}>
                {searchFrom || searchTo ? 'No rides found' : 'No rides available'}
              </Text>
              <Text style={styles.emptyStateSubtext}>
                {searchFrom || searchTo 
                  ? 'No rides match your search criteria' 
                  : 'Be the first to post a ride!'
                }
              </Text>
              {(searchFrom || searchTo) ? (
                <TouchableOpacity 
                  style={styles.clearSearchButton}
                  onPress={() => {
                    setSearchFrom('');
                    setSearchTo('');
                  }}
                >
                  <Ionicons name="close-circle-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.clearSearchButtonText}>Clear Search</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity 
                  style={styles.postRideButton}
                  onPress={() => router.push('/give-ride')}
                >
                  <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
                  <Text style={styles.postRideButtonText}>Post a Ride</Text>
                </TouchableOpacity>
              )}
            </LinearGradient>
          </View>
        ) : (
          <>
            {filteredRides.map((ride) => (
              <View key={ride.id} style={styles.rideCard}>
                <View style={styles.rideHeader}>
                  <View style={styles.driverInfo}>
                    <LinearGradient
                      colors={['#4ECDC4', '#44A08D']}
                      style={styles.avatar}
                    >
                      <Text style={styles.avatarText}>
                        {ride.driverName ? ride.driverName.charAt(0).toUpperCase() : 'D'}
                      </Text>
                    </LinearGradient>
                    <View style={styles.driverDetails}>
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
                      size={24} 
                      color="#667EEA" 
                    />
                  </View>
                </View>

                <View style={styles.routeContainer}>
                  <View style={styles.routePoint}>
                    <View style={styles.routeDot} />
                    <Text style={styles.routeText}>{ride.from}</Text>
                  </View>
                  <View style={styles.routeLine} />
                  <View style={styles.routePoint}>
                    <View style={[styles.routeDot, styles.routeDotEnd]} />
                    <Text style={styles.routeText}>{ride.to}</Text>
                  </View>
                </View>

                <View style={styles.detailsRow}>
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={16} color="#667EEA" />
                    <Text style={styles.detailText}>
                      {ride.allDayAvailable ? 'All Day' : ride.journeyDate}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="people-outline" size={16} color="#667EEA" />
                    <Text style={styles.detailText}>
                      {ride.availableSeats}/{ride.totalSeats} seats
                    </Text>
                  </View>
                </View>

                <View style={styles.rideFooter}>
                  <View>
                    <Text style={styles.priceLabel}>Available</Text>
                    <Text style={styles.priceValue}>{ride.availableSeats} seats</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.bookButton}
                    onPress={() => handleBookRideClick(ride)}
                  >
                    <Text style={styles.bookButtonText}>Book Now</Text>
                    <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      <Modal
        visible={showBookingModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView 
            style={styles.modalScrollView}
            contentContainerStyle={styles.modalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Book Ride</Text>
                <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                  <Ionicons name="close" size={28} color="#666" />
                </TouchableOpacity>
              </View>

              {selectedRide && (
                <>
                  <View style={styles.modalRideInfo}>
                    <View style={styles.modalRoute}>
                      <Ionicons name="location" size={20} color="#4ECDC4" />
                      <Text style={styles.modalRouteText}>{selectedRide.from}</Text>
                    </View>
                    <Ionicons name="arrow-down" size={20} color="#999" style={{ marginVertical: 8 }} />
                    <View style={styles.modalRoute}>
                      <Ionicons name="location-sharp" size={20} color="#667EEA" />
                      <Text style={styles.modalRouteText}>{selectedRide.to}</Text>
                    </View>
                  </View>

                  <View style={styles.modalInfo}>
                    <Ionicons name="person" size={20} color="#667EEA" />
                    <Text style={styles.modalInfoText}>Driver: {selectedRide.driverName}</Text>
                  </View>

                  <View style={styles.modalInfo}>
                    <Ionicons name="car" size={20} color="#667EEA" />
                    <Text style={styles.modalInfoText}>
                      Vehicle: {selectedRide.vehicleType.toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.modalInfo}>
                    <Ionicons name="people" size={20} color="#667EEA" />
                    <Text style={styles.modalInfoText}>
                      Available: {selectedRide.availableSeats} seats
                    </Text>
                  </View>

                  {/* Additional Details */}
                  {(selectedRide.allDayAvailable || selectedRide.anywhereAvailable || selectedRide.womenBooking || selectedRide.additionalDetails) && (
                    <View style={styles.additionalDetailsContainer}>
                      <Text style={styles.additionalDetailsTitle}>Additional Details</Text>
                      
                      {/* Badges */}
                      {(selectedRide.allDayAvailable || selectedRide.anywhereAvailable || selectedRide.womenBooking) && (
                        <View style={styles.modalBadgesRow}>
                          {selectedRide.allDayAvailable && (
                            <View style={[styles.modalBadge, { backgroundColor: '#E3F2FD' }]}>
                              <Ionicons name="time" size={16} color="#2196F3" />
                              <Text style={[styles.modalBadgeText, { color: '#2196F3' }]}>All Day Available</Text>
                            </View>
                          )}
                          {selectedRide.anywhereAvailable && (
                            <View style={[styles.modalBadge, { backgroundColor: '#F3E5F5' }]}>
                              <Ionicons name="navigate" size={16} color="#9C27B0" />
                              <Text style={[styles.modalBadgeText, { color: '#9C27B0' }]}>Anywhere Available</Text>
                            </View>
                          )}
                          {selectedRide.womenBooking && (
                            <View style={[styles.modalBadge, { backgroundColor: '#FFE5E5' }]}>
                              <Ionicons name="female" size={16} color="#FF6B6B" />
                              <Text style={[styles.modalBadgeText, { color: '#FF6B6B' }]}>Women Only</Text>
                            </View>
                          )}
                        </View>
                      )}

                      {/* Custom Additional Details Text */}
                      {selectedRide.additionalDetails && (
                        <View style={styles.customDetailsContainer}>
                          <View style={styles.customDetailsHeader}>
                            <Ionicons name="information-circle" size={18} color="#667EEA" />
                            <Text style={styles.customDetailsLabel}>Driver's Note:</Text>
                          </View>
                          <Text style={styles.customDetailsText}>{selectedRide.additionalDetails}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  <View style={styles.phoneInputContainer}>
                    <Text style={styles.phoneLabel}>Your Phone Number *</Text>
                    <View style={styles.phoneInputWrapper}>
                      <Ionicons name="call" size={20} color="#667EEA" />
                      <TextInput
                        style={styles.phoneInput}
                        placeholder="Enter 10-digit mobile number"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="phone-pad"
                        maxLength={10}
                        placeholderTextColor="#999"
                      />
                    </View>
                  </View>

                  <View style={styles.seatsInputContainer}>
                    <Text style={styles.seatsLabel}>Number of Seats</Text>
                    <View style={styles.seatsInputWrapper}>
                      <TouchableOpacity
                        style={styles.seatsButton}
                        onPress={() => {
                          const current = parseInt(seatsToBook) || 1;
                          if (current > 1) setSeatsToBook(String(current - 1));
                        }}
                      >
                        <Ionicons name="remove" size={20} color="#667EEA" />
                      </TouchableOpacity>
                      <TextInput
                        style={styles.seatsInput}
                        value={seatsToBook}
                        onChangeText={setSeatsToBook}
                        keyboardType="numeric"
                        maxLength={2}
                      />
                      <TouchableOpacity
                        style={styles.seatsButton}
                        onPress={() => {
                          const current = parseInt(seatsToBook) || 1;
                          if (current < selectedRide.availableSeats) {
                            setSeatsToBook(String(current + 1));
                          }
                        }}
                      >
                        <Ionicons name="add" size={20} color="#667EEA" />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.confirmButton, isBooking && styles.confirmButtonDisabled]}
                    onPress={handleConfirmBooking}
                    disabled={isBooking}
                  >
                    {isBooking ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <>
                        <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
                        <Text style={styles.confirmButtonText}>Confirm Booking</Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <View style={{ height: 120 }} />
                </>
              )}
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: 24,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoImage: {
    width: 80,
    height: 80,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  profileButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  profileGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#667EEA',
  },
  giveRideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 16,
    gap: 8,
  },
  giveRideText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
  },
  searchArrow: {
    marginHorizontal: 4,
  },
  content: {
    flex: 1,
    marginTop: -10,
  },
  ridesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  ridesTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  ridesCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667EEA',
    backgroundColor: '#F3F0FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  loadingContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#667EEA',
    fontWeight: '500',
  },
  emptyState: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  emptyGradient: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#667EEA',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9C27B0',
    marginTop: 8,
    textAlign: 'center',
  },
  postRideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667EEA',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
    gap: 8,
  },
  postRideButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  clearSearchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
    gap: 8,
  },
  clearSearchButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rideCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 20,
    padding: 16,
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
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  driverDetails: {
    flex: 1,
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
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeContainer: {
    marginBottom: 16,
    paddingLeft: 8,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4ECDC4',
  },
  routeDotEnd: {
    backgroundColor: '#667EEA',
  },
  routeText: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E4E7EB',
    marginLeft: 12,
    marginVertical: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
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
    color: '#667EEA',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#667EEA',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 6,
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalScrollView: {
    maxHeight: '85%',
  },
  modalScrollContent: {
    flexGrow: 1,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalRideInfo: {
    backgroundColor: '#F5F7FA',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  modalRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalRouteText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  modalInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  modalInfoText: {
    fontSize: 15,
    color: '#666',
  },
  phoneInputContainer: {
    marginBottom: 20,
  },
  phoneLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#667EEA',
    paddingHorizontal: 16,
    height: 52,
    gap: 12,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '600',
  },
  seatsInputContainer: {
    marginBottom: 24,
  },
  seatsLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  seatsInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  seatsButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F0FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatsInput: {
    width: 80,
    height: 48,
    borderWidth: 2,
    borderColor: '#667EEA',
    borderRadius: 12,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667EEA',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  additionalDetailsContainer: {
    marginBottom: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  additionalDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  modalBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  modalBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  customDetailsContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginTop: 12,
  },
  customDetailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  customDetailsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667EEA',
  },
  customDetailsText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});
