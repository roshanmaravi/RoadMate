import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import GetRides from "./getRides";
import GivenRides from "./givenRides";

export default function MyRides() {
  const [activeTab, setActiveTab] = useState<"getRides" | "givenRides">("getRides");
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="white" />
        </TouchableOpacity>
        <Text style={styles.title}>My Rides</Text>
        {/* placeholder for spacing so title stays centered */}
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "getRides" && styles.activeTab]}
          onPress={() => setActiveTab("getRides")}
        >
          <Ionicons 
            name={activeTab === "getRides" ? "car" : "car-outline"} 
            size={20} 
            color={activeTab === "getRides" ? "white" : "#666"} 
          />
          <Text style={[styles.tabText, activeTab === "getRides" && styles.activeTabText]}>
            Booked Rides
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "givenRides" && styles.activeTab]}
          onPress={() => setActiveTab("givenRides")}
        >
          <Ionicons 
            name={activeTab === "givenRides" ? "car-sport" : "car-sport-outline"} 
            size={20} 
            color={activeTab === "givenRides" ? "white" : "#666"} 
          />
          <Text style={[styles.tabText, activeTab === "givenRides" && styles.activeTabText]}>
            Posted Rides
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === "getRides" ? <GetRides /> : <GivenRides />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFFFFF",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF6B6B",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    flex: 1,
    textAlign: "center",
  },
  tabContainer: {
    flexDirection: "row",
    padding: 10,
    gap: 10,
    backgroundColor: "#FFFFFF",
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 12,
    backgroundColor: "#F5F7FA",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeTab: {
    backgroundColor: "#FF6B6B",
  },
  tabText: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
  activeTabText: {
    color: "white",
    fontWeight: "600",
  },
  content: {
    flex: 1,
  },
});
