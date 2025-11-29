import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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
  vehicleType: "bike" | "car" | "auto";
  totalSeats: number;
  availableSeats: number;
  womenBooking: boolean;
  status: string;
  createdAt: string;
  bookings: Booking[];
  bookingCount: number;
}

export default function GivenRides() {
  const { userData } = useAuth();
  const [rides, setRides] = useState<PostedRide[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (userData?.userId) {
      fetchMyPostedRides();
    }
  }, [userData?.userId]);

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
        fetchMyPostedRides(); // Refresh the list
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
    switch (type) {
      case "bike":
        return "bicycle";
      case "car":
        return "car";
      case "auto":
        return "business";
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
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading your rides...</Text>
      </View>
    );
  }

  if (rides.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={styles.emptyContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Ionicons name="car-sport-outline" size={80} color="#CCC" />
        <Text style={styles.emptyText}>No rides posted yet</Text>
        <Text style={styles.emptySubtext}>
          Your posted rides will appear here
        </Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
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
            <View style={styles.bookingBadge}>
              <Ionicons name="people" size={16} color="#FF6B6B" />
              <Text style={styles.bookingCount}>{ride.bookingCount}</Text>
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
                name={getVehicleIcon(ride.vehicleType)}
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
                {ride.availableSeats}/{ride.totalSeats} available
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
                      <Ionicons
                        name="person-circle"
                        size={24}
                        color="#FF6B6B"
                      />
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    minHeight: 400,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    marginTop: 8,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    color: "#333",
    flex: 1,
  },
  bookingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFE5E5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  bookingCount: {
    marginLeft: 4,
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6B6B",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#F0F0F0",
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
    color: "#333",
    marginBottom: 12,
  },
  bookingCard: {
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
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
  passengerDetails: {
    marginLeft: 8,
  },
  passengerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  seatsText: {
    fontSize: 14,
    color: "#666",
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
    fontSize: 12,
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
