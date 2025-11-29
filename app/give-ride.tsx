import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const API_URL = 'https://domainapi.shop/g/backend/ride/post-ride.php';

export default function GiveRideScreen() {
  const router = useRouter();
  const { userData } = useAuth();

  const [formData, setFormData] = useState({
    from: '',
    to: '',
    vehicleType: 'car',
    totalSeats: '4',
    pricePerSeat: '',
    additionalDetails: '',
    allDayAvailable: false,
    anywhereAvailable: false,
    womenBooking: false,
  });

  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const vehicleTypes = [
    { id: 'bike', name: 'Bike', icon: 'bicycle', seats: '1' },
    { id: 'auto', name: 'Auto', icon: 'business', seats: '3' },
    { id: 'car', name: 'Car', icon: 'car', seats: '4' },
    { id: 'suv', name: 'SUV', icon: 'car-sport', seats: '7' },
    { id: 'van', name: 'Van', icon: 'bus', seats: '10' },
    { id: 'other', name: 'Other', icon: 'ellipsis-horizontal-circle', seats: '1' },
  ];

  const handleVehicleSelect = (type: string, seats: string) => {
    setFormData(prev => ({
      ...prev,
      vehicleType: type,
      totalSeats: seats,
    }));
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const onTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setTime(selectedTime);
    }
  };

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatTime = (time: Date) => {
    const hours = String(time.getHours()).padStart(2, '0');
    const minutes = String(time.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const handleCheckboxToggle = (field: 'allDayAvailable' | 'anywhereAvailable' | 'womenBooking') => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handlePostRide = async () => {
    // Validation
    if (!formData.anywhereAvailable && (!formData.from || !formData.to)) {
      Alert.alert('Error', 'Please enter pickup and drop locations or select "Available Anywhere"');
      return;
    }

    if (!formData.totalSeats || parseInt(formData.totalSeats) <= 0) {
      Alert.alert('Error', 'Please enter valid number of seats');
      return;
    }

    if (!formData.pricePerSeat) {
      Alert.alert('Error', 'Please enter price per seat');
      return;
    }

    // Validate vehicle type is selected
    if (!formData.vehicleType || formData.vehicleType === '') {
      Alert.alert('Error', 'Please select a vehicle type');
      return;
    }

    // Validate price is a number
    const price = parseFloat(formData.pricePerSeat);
    if (isNaN(price) || price <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        userId: userData?.userId,
        from: formData.anywhereAvailable ? 'Anywhere' : formData.from,
        to: formData.anywhereAvailable ? 'Anywhere' : formData.to,
        journeyDate: formData.allDayAvailable ? null : formatDate(date),
        journeyTime: formData.allDayAvailable ? null : formatTime(time),
        vehicleType: formData.vehicleType,
        totalSeats: parseInt(formData.totalSeats),
        pricePerSeat: price,
        additionalDetails: formData.additionalDetails || null,
        allDayAvailable: formData.allDayAvailable ? 1 : 0,
        anywhereAvailable: formData.anywhereAvailable ? 1 : 0,
        womenBooking: formData.womenBooking ? 1 : 0,
      };

      console.log('Posting ride with payload:', payload);
      console.log('Vehicle Type being sent:', payload.vehicleType);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (data.success) {
        Alert.alert(
          'Success', 
          'Your ride has been posted successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else {
        Alert.alert('Error', data.message || 'Failed to post ride');
      }
    } catch (error) {
      console.error('Error posting ride:', error);
      Alert.alert('Error', 'Failed to connect to server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Route Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Route Details</Text>
          
          {/* Anywhere Available Checkbox */}
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => handleCheckboxToggle('anywhereAvailable')}
          >
            <View style={[styles.checkbox, formData.anywhereAvailable && styles.checkboxChecked]}>
              {formData.anywhereAvailable && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>Available Anywhere (Flexible Route)</Text>
          </TouchableOpacity>

          {!formData.anywhereAvailable && (
            <>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Pickup Location <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="location" size={20} color="#FF6B6B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter pickup location"
                    value={formData.from}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, from: text }))}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Drop Location <Text style={styles.required}>*</Text>
                </Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="location-sharp" size={20} color="#FF6B6B" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Enter drop location"
                    value={formData.to}
                    onChangeText={(text) => setFormData(prev => ({ ...prev, to: text }))}
                  />
                </View>
              </View>
            </>
          )}
        </View>

        {/* Date & Time Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Journey Schedule</Text>
          
          {/* All Day Available Checkbox */}
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => handleCheckboxToggle('allDayAvailable')}
          >
            <View style={[styles.checkbox, formData.allDayAvailable && styles.checkboxChecked]}>
              {formData.allDayAvailable && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </View>
            <Text style={styles.checkboxLabel}>Available All Day (Flexible Time)</Text>
          </TouchableOpacity>

          {!formData.allDayAvailable && (
            <View style={styles.row}>
              {/* Date Picker */}
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>
                  Date <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity 
                  style={styles.inputWrapper}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Ionicons name="calendar" size={20} color="#667EEA" style={styles.inputIcon} />
                  <Text style={styles.dateTimeText}>{formatDate(date)}</Text>
                </TouchableOpacity>
              </View>

              {/* Time Picker */}
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>
                  Time <Text style={styles.required}>*</Text>
                </Text>
                <TouchableOpacity 
                  style={styles.inputWrapper}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Ionicons name="time" size={20} color="#667EEA" style={styles.inputIcon} />
                  <Text style={styles.dateTimeText}>{formatTime(time)}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Date Picker Modal */}
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          {/* Time Picker Modal */}
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onTimeChange}
            />
          )}
        </View>

        {/* Vehicle Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Type *</Text>
          
          <View style={styles.vehicleGrid}>
            {vehicleTypes.map((vehicle) => (
              <TouchableOpacity
                key={vehicle.id}
                style={[
                  styles.vehicleCard,
                  formData.vehicleType === vehicle.id && styles.vehicleCardSelected
                ]}
                onPress={() => handleVehicleSelect(vehicle.id, vehicle.seats)}
              >
                <Ionicons 
                  name={vehicle.icon as any} 
                  size={28} 
                  color={formData.vehicleType === vehicle.id ? '#667EEA' : '#666'} 
                />
                <Text style={[
                  styles.vehicleName,
                  formData.vehicleType === vehicle.id && styles.vehicleNameSelected
                ]}>
                  {vehicle.name}
                </Text>
                <Text style={styles.vehicleSeats}>{vehicle.seats} seats</Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Show selected vehicle type for debugging */}
          <Text style={styles.debugText}>Selected: {formData.vehicleType}</Text>
        </View>

        {/* Pricing Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>
                Total Seats <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Ionicons name="people" size={20} color="#4ECDC4" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.totalSeats}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, totalSeats: text }))}
                  keyboardType="numeric"
                  placeholder="Enter seats"
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>
                Price/Seat <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.inputWrapper}>
                <Text style={styles.currencySymbol}>₹</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={formData.pricePerSeat}
                  onChangeText={(text) => setFormData(prev => ({ ...prev, pricePerSeat: text }))}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          
          {/* Women Only Checkbox */}
          <TouchableOpacity 
            style={styles.checkboxContainer}
            onPress={() => handleCheckboxToggle('womenBooking')}
          >
            <View style={[styles.checkbox, formData.womenBooking && styles.checkboxChecked]}>
              {formData.womenBooking && (
                <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.checkboxLabel}>Women Only Booking</Text>
              <Text style={styles.checkboxSubtext}>Only women passengers can book this ride</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Additional Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Details (Optional)</Text>
          
          <View style={styles.inputGroup}>
            <TextInput
              style={styles.textArea}
              placeholder="Add any special instructions or details..."
              multiline
              numberOfLines={4}
              value={formData.additionalDetails}
              onChangeText={(text) => setFormData(prev => ({ ...prev, additionalDetails: text }))}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* Post Button */}
        <TouchableOpacity
          style={[styles.postButton, isLoading && styles.postButtonDisabled]}
          onPress={handlePostRide}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
              <Text style={styles.postButtonText}>Post Ride</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Bottom Padding for Mobile Navigation Buttons */}
        <View style={{ height: 80 }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  required: {
    color: '#FF6B6B',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4E7EB',
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
  },
  dateTimeText: {
    flex: 1,
    fontSize: 15,
    color: '#1A1A1A',
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4ECDC4',
    marginRight: 8,
  },
  row: {
    flexDirection: 'row',
  },
  vehicleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  vehicleCard: {
    width: '31%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E4E7EB',
    padding: 10,
    alignItems: 'center',
  },
  vehicleCardSelected: {
    borderColor: '#667EEA',
    backgroundColor: '#F3F0FF',
  },
  vehicleName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginTop: 4,
  },
  vehicleNameSelected: {
    color: '#667EEA',
  },
  vehicleSeats: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
  },
  debugText: {
    fontSize: 11,
    color: '#667EEA',
    marginTop: 8,
    fontStyle: 'italic',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4E7EB',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#667EEA',
    borderColor: '#667EEA',
  },
  checkboxLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  checkboxSubtext: {
    fontSize: 11,
    color: '#666',
    marginTop: 2,
  },
  textArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E4E7EB',
    padding: 12,
    fontSize: 15,
    color: '#1A1A1A',
    minHeight: 90,
  },
  postButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#667EEA',
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  postButtonDisabled: {
    opacity: 0.6,
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
