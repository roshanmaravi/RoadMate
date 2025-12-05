import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function PrivacyPolicyScreen() {
  const router = useRouter();

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
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.lastUpdated}>Last Updated: December 2024</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.text}>
            Welcome to RoadMate. We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our ride-sharing application.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Information We Collect</Text>
          
          <Text style={styles.subTitle}>2.1 Personal Information</Text>
          <Text style={styles.text}>
            • Name{'\n'}
            • Mobile phone number{'\n'}
            • Location information{'\n'}
            • Profile information
          </Text>

          <Text style={styles.subTitle}>2.2 Ride Information</Text>
          <Text style={styles.text}>
            • Pickup and drop-off locations{'\n'}
            • Journey dates and times{'\n'}
            • Vehicle details{'\n'}
            • Ride preferences
          </Text>

          <Text style={styles.subTitle}>2.3 Usage Data</Text>
          <Text style={styles.text}>
            • App usage patterns{'\n'}
            • Device information{'\n'}
            • Log data{'\n'}
            • Crash reports
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
          <Text style={styles.text}>
            We use your information to:{'\n\n'}
            • Connect drivers and passengers{'\n'}
            • Facilitate ride bookings{'\n'}
            • Send notifications about bookings{'\n'}
            • Improve our services{'\n'}
            • Ensure safety and security{'\n'}
            • Provide customer support{'\n'}
            • Prevent fraud and abuse
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Information Sharing</Text>
          <Text style={styles.text}>
            We share your information only when necessary:{'\n\n'}
            • With other users for ride coordination{'\n'}
            • With service providers who assist our operations{'\n'}
            • When required by law{'\n'}
            • To protect our rights and safety
          </Text>
          <Text style={styles.highlight}>
            We will never sell your personal information to third parties.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Data Security</Text>
          <Text style={styles.text}>
            We implement industry-standard security measures to protect your data:{'\n\n'}
            • Encrypted data transmission{'\n'}
            • Secure server infrastructure{'\n'}
            • Regular security audits{'\n'}
            • Access controls and authentication
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Your Rights</Text>
          <Text style={styles.text}>
            You have the right to:{'\n\n'}
            • Access your personal data{'\n'}
            • Correct inaccurate information{'\n'}
            • Delete your account{'\n'}
            • Opt-out of notifications{'\n'}
            • Request data portability
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Location Data</Text>
          <Text style={styles.text}>
            We collect location information to provide ride-sharing services. You can control location permissions through your device settings. Disabling location may limit app functionality.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Data Retention</Text>
          <Text style={styles.text}>
            We retain your data only as long as necessary to provide services and comply with legal obligations. You can request deletion of your data at any time.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Children's Privacy</Text>
          <Text style={styles.text}>
            RoadMate is not intended for users under 18 years of age. We do not knowingly collect information from children.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Changes to Privacy Policy</Text>
          <Text style={styles.text}>
            We may update this Privacy Policy from time to time. We will notify you of any significant changes through the app or email.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Contact Us</Text>
          <Text style={styles.text}>
            If you have questions about this Privacy Policy, please contact us:
          </Text>
          
          <View style={styles.contactCard}>
            <View style={styles.contactItem}>
              <Ionicons name="mail" size={20} color="#667EEA" />
              <Text style={styles.contactText}>roshan.maravi94@gmail.com</Text>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="call" size={20} color="#667EEA" />
              <Text style={styles.contactText}>+91 7974840811</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using RoadMate, you agree to this Privacy Policy.
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
  section: {
    marginTop: 24,
  },
  lastUpdated: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  subTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#667EEA',
    marginTop: 12,
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  highlight: {
    fontSize: 14,
    color: '#667EEA',
    fontWeight: '600',
    marginTop: 8,
    lineHeight: 22,
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 15,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  footer: {
    marginTop: 32,
    padding: 20,
    backgroundColor: '#F3F0FF',
    borderRadius: 16,
  },
  footerText: {
    fontSize: 13,
    color: '#667EEA',
    textAlign: 'center',
    fontWeight: '600',
  },
});
