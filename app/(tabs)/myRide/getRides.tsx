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
  rideId: number;
  driverId: string;
  driverName: string;
  driverPhone: string;
  from: string;
  to: string;
  journeyDate: string;
  vehicleType: "bike" | "car" | "auto";
  seatsBooked: number;
  totalSeats: number;
  availableSeats: number;
  womenBooking: boolean;
  bookingStatus: "pending" | "confirmed" | "cancelled";
  bookedAt: string;
}

export default function GetRides() {
  const { userData } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (userData?.userId) {
      fetchMyBookings();
    }
  }, [userData?.userId]);

  const fetchMyBookings = async () => {
    if (!userData?.userId) {
      Alert.alert("Error", "User not logged in");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://domainapi.shop/g/backend/ride/get-my-bookings.php?userId=${userData.userId}`
      );
      const data = await response.json();

      if (data.success) {
        setBookings(data.bookings);
      } else {
        Alert.alert("Error", data.message || "Failed to load bookings");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      Alert.alert("Error", "Failed to connect to server");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMyBookings();
  }, [userData?.userId]);

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

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const callDriver = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Loading your bookings...</Text>
      </View>
    );
  }

  if (bookings.length === 0) {
    return (
      <ScrollView
        contentContainerStyle={styles.emptyContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Ionicons name="car-outline" size={80} color="#CCC" />
        <Text style={styles.emptyText}>No rides booked yet</Text>
        <Text style={styles.emptySubtext}>
          Your booked rides will appear here
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
      {bookings.map((booking) => (
        <View key={booking.bookingId} style={styles.card}>
          {/* Status Badge */}
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(booking.bookingStatus) },
            ]}
          >
            <Text style={styles.statusText}>
              {getStatusText(booking.bookingStatus)}
            </Text>
          </View>

          {/* Ride Details */}
          <View style={styles.routeContainer}>
            <View style={styles.locationRow}>
              <Ionicons
                name="location-outline"
                size={20}
                color="#FF6B6B"
              />
              <Text style={styles.locationText}>{booking.from}</Text>
            </View>

            <View style={styles.arrowContainer}>
              <Ionicons name="arrow-down" size={20} color="#999" />
            </View>

            <View style={styles.locationRow}>
              <Ionicons
                name="location-sharp"
                size={20}
                color="#FF6B6B"
              />
              <Text style={styles.locationText}>{booking.to}</Text>
            </View>
          </View>

          {/* Journey Info */}
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Ionicons name="calendar-outline" size={18} color="#666" />
              <Text style={styles.infoText}>{booking.journeyDate}</Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons
                name={getVehicleIcon(booking.vehicleType)}
                size={18}
                color="#666"
              />
              <Text style={styles.infoText}>
                {booking.vehicleType.charAt(0).toUpperCase() +
                  booking.vehicleType.slice(1)}
              </Text>
            </View>

            <View style={styles.infoItem}>
              <Ionicons name="people-outline" size={18} color="#666" />
              <Text style={styles.infoText}>
                {booking.seatsBooked} seat{booking.seatsBooked > 1 ? "s" : ""}
              </Text>
            </View>
          </View>

          {/* Driver Info */}
          <View style={styles.driverContainer}>
            <View style={styles.driverInfo}>
              <Ionicons name="person-circle-outline" size={24} color="#FF6B6B" />
              <View style={styles.driverDetails}>
                <Text style={styles.driverLabel}>Driver</Text>
                <Text style={styles.driverName}>{booking.driverName}</Text>
              </View>
            </View>

            {booking.bookingStatus === "confirmed" && (
              <TouchableOpacity
                style={styles.callButton}
                onPress={() => callDriver(booking.driverPhone)}
              >
                <Ionicons name="call" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>

          {/* Booked Time */}
          <Text style={styles.bookedTime}>
            Booked on: {new Date(booking.bookedAt).toLocaleString()}
          </Text>
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
  statusBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  routeContainer: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  arrowContainer: {
    marginLeft: 10,
    marginVertical: 4,
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
  driverContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  driverInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  driverDetails: {
    marginLeft: 8,
  },
  driverLabel: {
    fontSize: 12,
    color: "#999",
  },
  driverName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  callButton: {
    backgroundColor: "#4CAF50",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  bookedTime: {
    fontSize: 12,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
});
