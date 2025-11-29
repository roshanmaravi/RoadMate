import { useAuth } from "@/contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
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
  rideId: number;
  driverId: string;
  driverName: string;
  driverPhone: string;
  from: string;
  to: string;
  journeyDate: string;
  vehicleType: string;
  seatsBooked: number;
  totalSeats: number;
  availableSeats: number;
  womenBooking: boolean;
  bookingStatus: "pending" | "confirmed" | "cancelled";
  bookedAt: string;
}

export default function BookedRidesScreen() {
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

  const getStatusText = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const callDriver = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
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
          <Text style={styles.headerTitle}>Booked Rides</Text>
          <Text style={styles.headerSubtitle}>Your ride bookings</Text>
        </LinearGradient>

        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#667EEA" />
          <Text style={styles.loadingText}>Loading your bookings...</Text>
        </View>
      </View>
    );
  }

  if (bookings.length === 0) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor="#667EEA" barStyle="light-content" />
        
        {/* Header */}
        <LinearGradient
          colors={['#667EEA', '#764BA2']}
          style={styles.header}
        >
          <Text style={styles.headerTitle}>Booked Rides</Text>
          <Text style={styles.headerSubtitle}>Your ride bookings</Text>
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
            <Ionicons name="bookmarks-outline" size={80} color="#667EEA" />
            <Text style={styles.emptyText}>No rides booked yet</Text>
            <Text style={styles.emptySubtext}>
              Your booked rides will appear here
            </Text>
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
        <Text style={styles.headerTitle}>Booked Rides</Text>
        <Text style={styles.headerSubtitle}>{bookings.length} booking{bookings.length !== 1 ? 's' : ''}</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollView}
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
                <View style={styles.routeDot} />
                <Text style={styles.locationText}>{booking.from}</Text>
              </View>

              <View style={styles.routeLine} />

              <View style={styles.locationRow}>
                <View style={[styles.routeDot, styles.routeDotEnd]} />
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
                  name={getVehicleIcon(booking.vehicleType) as any}
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
                <LinearGradient
                  colors={['#4ECDC4', '#44A08D']}
                  style={styles.driverAvatar}
                >
                  <Text style={styles.driverAvatarText}>
                    {booking.driverName.charAt(0).toUpperCase()}
                  </Text>
                </LinearGradient>
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
                  <Text style={styles.callButtonText}>Call</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Booked Time */}
            <Text style={styles.bookedTime}>
              Booked on: {new Date(booking.bookedAt).toLocaleString()}
            </Text>
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
  statusBadge: {
    position: "absolute",
    top: 16,
    right: 16,
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
    paddingRight: 80,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4ECDC4",
    marginRight: 12,
  },
  routeDotEnd: {
    backgroundColor: "#667EEA",
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: "#E4E7EB",
    marginLeft: 4,
    marginVertical: 4,
  },
  locationText: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "500",
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
    fontSize: 13,
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
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverAvatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  driverDetails: {
    marginLeft: 12,
  },
  driverLabel: {
    fontSize: 12,
    color: "#999",
  },
  driverName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1A1A1A",
    marginTop: 2,
  },
  callButton: {
    flexDirection: 'row',
    backgroundColor: "#4CAF50",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    gap: 6,
  },
  callButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  bookedTime: {
    fontSize: 11,
    color: "#999",
    marginTop: 8,
    textAlign: "center",
  },
});
