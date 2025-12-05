import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { Ionicons } from "@expo/vector-icons";
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

interface Booking {
  bookingId: number;
  passengerId: string;
  passengerName: string;
  passengerPhone: string;
  seatsBooked: number;
  bookingStatus: "pending" | "confirmed" | "cancelled";
  bookedAt: string;
}

interface PostedRide {
  id: number;
  from: string;
  to: string;
  journeyDate: string;
  allDayAvailable: boolean;
  anywhereAvailable: boolean;
  vehicleType: string;
  totalSeats: number;
  availableSeats: number;
  womenBooking: boolean;
  status: string;
  createdAt: string;
  bookings: Booking[];
  bookingCount: number;
}

export default function PostedRidesScreen() {
  const { userData } = useAuth();
  const { refreshNotifications } = useNotifications();
  const [rides, setRides] = useState<PostedRide[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (userData?.userId) {
      fetchMyPostedRides();
      // Mark notifications as read when viewing this screen
      markNotificationsAsRead();
    }
  }, [userData?.userId]);

  const markNotificationsAsRead = async () => {
    try {
      await refreshNotifications();
      // Small delay to ensure notifications are loaded
      setTimeout(async () => {
        const response = await fetch(
          "https://domainapi.shop/g/backend/notification/mark-as-read.php",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId: userData?.userId,
            }),
          }
        );
        
        if (response.ok) {
          refreshNotifications();
        }
      }, 500);
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const fetchMyPostedRides = async () => {
    if (!userData?.userId) {
      Alert.alert("Error", "User not logged in");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://domainapi.shop/g/backend/ride/get-my-posted-rides.php?userId=${userData.userId}`
      );
      const data = await response.json();

      if (data.success) {
        setRides(data.rides);
      } else {
        Alert.alert("Error", data.message || "Failed to load rides");
      }
    } catch (error) {
      console.error("Error fetching rides:", error);
      Alert.alert("Error", "Failed to connect to server");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMyPostedRides();
  }, [userData?.userId]);

  const updateBookingStatus = async (bookingId: number, status: string) => {
    try {
      const response = await fetch(
        "https://domainapi.shop/g/backend/ride/update-booking-status.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            bookingId,
            status,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        Alert.alert("Success", data.message);
        // Refresh both rides and notifications
        fetchMyPostedRides();
        refreshNotifications();
      } else {
        Alert.alert("Error", data.message || "Failed to update booking");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      Alert.alert("Error", "Failed to connect to server");
    }
  };

  const confirmAcceptBooking = (bookingId: number, passengerName: string) => {
    Alert.alert(
      "Accept Booking",
      `Confirm booking for ${passengerName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Accept",
          onPress: () => updateBookingStatus(bookingId, "confirmed"),
        },
      ]
    );
  };

  const confirmDeleteRide = (rideId: number, from: string, to: string) => {
    Alert.alert(
      "Delete Ride",
      `Are you sure you want to delete your ride from ${from} to ${to}? This will also cancel all bookings.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteRide(rideId),
        },
      ]
    );
  };

  const deleteRide = async (rideId: number) => {
    try {
      const response = await fetch(
        "https://domainapi.shop/g/backend/ride/delete-ride.php",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            rideId,
            userId: userData?.userId,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        Alert.alert("Success", "Ride deleted successfully");
        // Refresh both rides and notifications
        fetchMyPostedRides();
        refreshNotifications();
      } else {
        Alert.alert("Error", data.message || "Failed to delete ride");
      }
    } catch (error) {
      console.error("Error deleting ride:", error);
      Alert.alert("Error", "Failed to connect to server");
    }
  };

  const confirmCancelBooking = (bookingId: number, passengerName: string) => {
    Alert.alert(
      "Cancel Booking",
      `Cancel booking for ${passengerName}?`,
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: () => updateBookingStatus(bookingId, "cancelled"),
        },
      ]
    );
  };

  const callPassenger = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const getVehicleIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "bike":
        return "bicycle";
      case "car":
        return "car";
      case "auto":
        return "business";
      case "suv":
        return "car-sport";
      case "van":
        return "bus";
      case "other":
        return "ellipsis-horizontal-circle";
      default:
        return "car";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "#4CAF50";
      case "pending":
        return "#FF9800";
      case "cancelled":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#667EEA" barStyle="light-content" />
        
        {/* Header */}
        <LinearGradient
          colors={['#667EEA', '#764BA2']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Posted Rides</Text>
          <Text style={styles.headerSubtitle}>Manage your ride offers</Text>
        </LinearGradient>

        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#667EEA" />
          <Text style={styles.loadingText}>Loading your rides...</Text>
        </View>
      </View>
    );
  }

  if (rides.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#667EEA" barStyle="light-content" />
        
        {/* Header */}
        <LinearGradient
          colors={['#667EEA', '#764BA2']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Posted Rides</Text>
          <Text style={styles.headerSubtitle}>Manage your ride offers</Text>
        </LinearGradient>

        <ScrollView
          contentContainerStyle={styles.emptyContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <LinearGradient
            colors={['#F3F0FF', '#E8E3FF']}
            style={styles.emptyGradient}
          >
            <Ionicons name="car-sport-outline" size={80} color="#667EEA" />
            <Text style={styles.emptyText}>No rides posted yet</Text>
            <Text style={styles.emptySubtext}>
              Start earning by offering rides to passengers
            </Text>
            
            {/* Post Ride Button */}
            <TouchableOpacity
              style={styles.postRideButton}
              onPress={() => router.push('/give-ride')}
            >
              <LinearGradient
                colors={['#667EEA', '#764BA2']}
                style={styles.postRideGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="add-circle" size={24} color="white" />
                <Text style={styles.postRideButtonText}>Post a Ride</Text>
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#667EEA" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667EEA', '#764BA2']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Posted Rides</Text>
        <Text style={styles.headerSubtitle}>{rides.length} ride{rides.length !== 1 ? 's' : ''} posted</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {rides.map((ride) => (
          <View key={ride.id} style={styles.card}>
            {/* Ride Header */}
            <View style={styles.rideHeader}>
              <Text style={styles.rideTitle}>
                {ride.from} → {ride.to}
              </Text>
              <View style={styles.headerRight}>
                <View style={styles.bookingBadge}>
                  <Ionicons name="people" size={16} color="#667EEA" />
                  <Text style={styles.bookingCount}>{ride.bookingCount}</Text>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => confirmDeleteRide(ride.id, ride.from, ride.to)}
                >
                  <Ionicons name="trash-outline" size={20} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Ride Info */}
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={18} color="#666" />
                <Text style={styles.infoText}>
                  {ride.allDayAvailable ? "All Day" : ride.journeyDate}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Ionicons
                  name={getVehicleIcon(ride.vehicleType) as any}
                  size={18}
                  color="#666"
                />
                <Text style={styles.infoText}>
                  {ride.vehicleType.charAt(0).toUpperCase() +
                    ride.vehicleType.slice(1)}
                </Text>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="people-outline" size={18} color="#666" />
                <Text style={styles.infoText}>
                  {ride.availableSeats}/{ride.totalSeats}
                </Text>
              </View>
            </View>

            {/* Bookings Section */}
            {ride.bookings.length > 0 ? (
              <View style={styles.bookingsSection}>
                <Text style={styles.bookingsTitle}>
                  Booking Requests ({ride.bookingCount})
                </Text>

                {ride.bookings.map((booking) => (
                  <View
                    key={booking.bookingId}
                    style={[
                      styles.bookingCard,
                      booking.bookingStatus === "cancelled" &&
                        styles.cancelledBooking,
                    ]}
                  >
                    {/* Passenger Info */}
                    <View style={styles.passengerRow}>
                      <View style={styles.passengerInfo}>
                        <LinearGradient
                          colors={['#4ECDC4', '#44A08D']}
                          style={styles.passengerAvatar}
                        >
                          <Text style={styles.passengerAvatarText}>
                            {booking.passengerName.charAt(0).toUpperCase()}
                          </Text>
                        </LinearGradient>
                        <View style={styles.passengerDetails}>
                          <Text style={styles.passengerName}>
                            {booking.passengerName}
                          </Text>
                          <Text style={styles.seatsText}>
                            {booking.seatsBooked} seat
                            {booking.seatsBooked > 1 ? "s" : ""}
                          </Text>
                        </View>
                      </View>

                      {/* Status Badge */}
                      <View
                        style={[
                          styles.miniStatusBadge,
                          {
                            backgroundColor: getStatusColor(
                              booking.bookingStatus
                            ),
                          },
                        ]}
                      >
                        <Text style={styles.miniStatusText}>
                          {booking.bookingStatus}
                        </Text>
                      </View>
                    </View>

                    {/* Action Buttons */}
                    {booking.bookingStatus === "pending" && (
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={styles.acceptButton}
                          onPress={() =>
                            confirmAcceptBooking(
                              booking.bookingId,
                              booking.passengerName
                            )
                          }
                        >
                          <Ionicons name="checkmark" size={20} color="white" />
                          <Text style={styles.buttonText}>Accept</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.rejectButton}
                          onPress={() =>
                            confirmCancelBooking(
                              booking.bookingId,
                              booking.passengerName
                            )
                          }
                        >
                          <Ionicons name="close" size={20} color="white" />
                          <Text style={styles.buttonText}>Reject</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {booking.bookingStatus === "confirmed" && (
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={styles.callButton}
                          onPress={() => callPassenger(booking.passengerPhone)}
                        >
                          <Ionicons name="call" size={20} color="white" />
                          <Text style={styles.buttonText}>Call Passenger</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={() =>
                            confirmCancelBooking(
                              booking.bookingId,
                              booking.passengerName
                            )
                          }
                        >
                          <Ionicons name="close" size={20} color="white" />
                          <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Booking Time */}
                    <Text style={styles.bookingTime}>
                      {new Date(booking.bookedAt).toLocaleString()}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.noBookings}>
                <Text style={styles.noBookingsText}>No bookings yet</Text>
              </View>
            )}
          </View>
        ))}
        
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyGradient: {
    padding: 40,
    borderRadius: 20,
    alignItems: "center",
    width: '100%',
  },
  postRideButton: {
    marginTop: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  postRideGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    gap: 8,
  },
  postRideButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#667EEA",
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9C27B0",
    marginTop: 8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  rideHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  rideTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    flex: 1,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bookingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F0FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  deleteButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFEBEE",
    justifyContent: "center",
    alignItems: "center",
  },
  bookingCount: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "600",
    color: "#667EEA",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    marginLeft: 6,
    fontSize: 14,
    color: "#666",
  },
  bookingsSection: {
    marginTop: 8,
  },
  bookingsTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  bookingCard: {
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  cancelledBooking: {
    opacity: 0.6,
  },
  passengerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  passengerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  passengerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  passengerAvatarText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  passengerDetails: {
    marginLeft: 12,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
  },
  seatsText: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  miniStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  miniStatusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  acceptButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  rejectButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F44336",
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  callButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#F44336",
    paddingVertical: 10,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  bookingTime: {
    fontSize: 11,
    color: "#999",
    marginTop: 8,
    textAlign: "right",
  },
  noBookings: {
    padding: 20,
    alignItems: "center",
  },
  noBookingsText: {
    fontSize: 14,
    color: "#999",
  },
});
