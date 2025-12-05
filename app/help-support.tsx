import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function HelpSupportScreen() {
  const router = useRouter();

  const handleCall = () => {
    Linking.openURL('tel:7974840811');
  };

  const handleEmail = () => {
    Linking.openURL('mailto:roshan.maravi94@gmail.com');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/917974840811');
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#667EEA" barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient
        colors={['#667EEA', '#764BA2']}
        style={styles.header}
      >
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Contact Support Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <LinearGradient
              colors={['#667EEA', '#764BA2']}
              style={styles.iconContainer}
            >
              <Ionicons name="headset" size={28} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.cardTitle}>Contact Support</Text>
          </View>
          <Text style={styles.cardDescription}>
            Need help? Our support team is here for you!
          </Text>

          {/* Phone */}
          <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
            <View style={styles.contactButtonLeft}>
              <View style={styles.contactIconWrapper}>
                <Ionicons name="call" size={20} color="#4CAF50" />
              </View>
              <View>
                <Text style={styles.contactLabel}>Phone Support</Text>
                <Text style={styles.contactValue}>+91 7974840811</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          {/* Email */}
          <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
            <View style={styles.contactButtonLeft}>
              <View style={styles.contactIconWrapper}>
                <Ionicons name="mail" size={20} color="#2196F3" />
              </View>
              <View>
                <Text style={styles.contactLabel}>Email Support</Text>
                <Text style={styles.contactValue}>roshan.maravi94@gmail.com</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          {/* WhatsApp */}
          <TouchableOpacity style={styles.contactButton} onPress={handleWhatsApp}>
            <View style={styles.contactButtonLeft}>
              <View style={styles.contactIconWrapper}>
                <Ionicons name="logo-whatsapp" size={20} color="#25D366" />
              </View>
              <View>
                <Text style={styles.contactLabel}>WhatsApp</Text>
                <Text style={styles.contactValue}>Chat with us</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* FAQs */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <LinearGradient
              colors={['#4ECDC4', '#44A08D']}
              style={styles.iconContainer}
            >
              <Ionicons name="help-circle" size={28} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.cardTitle}>Frequently Asked Questions</Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How do I post a ride?</Text>
            <Text style={styles.faqAnswer}>
              Tap the "Give Ride" button on the home screen, fill in your ride details including route, date, vehicle type, and available seats, then submit.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How do I book a ride?</Text>
            <Text style={styles.faqAnswer}>
              Browse available rides on the home screen, use the search filters to find rides matching your route, then tap "Book Now" on your preferred ride.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How do I cancel a booking?</Text>
            <Text style={styles.faqAnswer}>
              Go to "Booked Rides" tab, find your booking, and tap the cancel button. The driver will be notified of the cancellation.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How do I delete a posted ride?</Text>
            <Text style={styles.faqAnswer}>
              Go to "Posted Rides" tab, find your ride, and tap the delete button. All bookings for that ride will be automatically cancelled.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>Is my personal information safe?</Text>
            <Text style={styles.faqAnswer}>
              Yes! We use industry-standard encryption and security measures to protect your data. Read our Privacy Policy for more details.
            </Text>
          </View>

          <View style={styles.faqItem}>
            <Text style={styles.faqQuestion}>How do notifications work?</Text>
            <Text style={styles.faqAnswer}>
              You'll receive notifications for new bookings, booking confirmations, and ride updates. Make sure notifications are enabled in your phone settings.
            </Text>
          </View>
        </View>

        {/* Quick Tips */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <LinearGradient
              colors={['#FF6B6B', '#E94E4E']}
              style={styles.iconContainer}
            >
              <Ionicons name="bulb" size={28} color="#FFFFFF" />
            </LinearGradient>
            <Text style={styles.cardTitle}>Quick Tips</Text>
          </View>

          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.tipText}>
              Always verify driver/passenger details before the ride
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.tipText}>
              Use the in-app call feature to communicate
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.tipText}>
              Keep your phone number updated for easy contact
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.tipText}>
              Cancel rides early if your plans change
            </Text>
          </View>

          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            <Text style={styles.tipText}>
              Rate your experience to help the community
            </Text>
          </View>
        </View>

        {/* Support Hours */}
        <View style={styles.hoursCard}>
          <View style={styles.hoursHeader}>
            <Ionicons name="time" size={24} color="#667EEA" />
            <Text style={styles.hoursTitle}>Support Hours</Text>
          </View>
          <Text style={styles.hoursText}>
            Monday - Friday: 9:00 AM - 6:00 PM{'\n'}
            Saturday: 10:00 AM - 4:00 PM{'\n'}
            Sunday: Closed
          </Text>
          <Text style={styles.hoursNote}>
            Email support available 24/7
          </Text>
        </View>

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
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
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
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  contactButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  contactIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactLabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  faqItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  hoursCard: {
    backgroundColor: '#F3F0FF',
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  hoursHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  hoursTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#667EEA',
  },
  hoursText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
    marginBottom: 8,
  },
  hoursNote: {
    fontSize: 13,
    color: '#667EEA',
    fontWeight: '600',
    fontStyle: 'italic',
  },
});
