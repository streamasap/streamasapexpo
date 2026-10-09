// app/(subscription)/card-details.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function CardDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const selectedPlan = (params.plan as 'monthly' | 'producer') || 'monthly';
  const isProducer = selectedPlan === 'producer';

  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  const formattedAmount = isProducer ? '$80' : '₦1,700';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Back Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/asapfull.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Headlines */}
          <Text style={styles.title}>Set Up Your Credit or Debit Card.</Text>
          <Text style={styles.subtitle}>
            {isProducer
              ? "You're subscribing to Producer — $80/one-time."
              : "You're subscribing to User — ₦1,700/month."}
          </Text>

          {/* Payment Card Badges */}
          <View style={styles.cardBadgesRow}>
            <View style={styles.badgeWrapper}>
              <Text style={[styles.badgeText, { color: '#1A1F71', fontWeight: '900' }]}>VISA</Text>
            </View>
            <View style={[styles.badgeWrapper, { backgroundColor: '#006633' }]}>
              <Text style={[styles.badgeText, { color: '#FFFFFF', fontWeight: '700' }]}>Verve</Text>
            </View>
            <View style={styles.badgeWrapper}>
              <Text style={[styles.badgeText, { color: '#EB001B', fontWeight: '800' }]}>mastercard</Text>
            </View>
          </View>

          {/* Form Inputs */}
          <View style={styles.formContainer}>
            <TextInput
              style={styles.input}
              placeholder="Card Number"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={cardNumber}
              onChangeText={setCardNumber}
            />
            <TextInput
              style={styles.input}
              placeholder="Expiration Date"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              value={expiryDate}
              onChangeText={setExpiryDate}
            />
            <TextInput
              style={styles.input}
              placeholder="CVV"
              placeholderTextColor="#6B7280"
              keyboardType="numeric"
              secureTextEntry
              value={cvv}
              onChangeText={setCvv}
            />
            <TextInput
              style={styles.input}
              placeholder="Card Name"
              placeholderTextColor="#6B7280"
              value={cardName}
              onChangeText={setCardName}
            />
          </View>

          {/* Terms Note */}
          <Text style={styles.termsText}>
            By continuing, you agree to our{' '}
            <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>

        {/* Bottom CTA Area */}
        <View style={styles.ctaWrapper}>
          <TouchableOpacity activeOpacity={0.85} 
          style={styles.buttonTouchable}
          onPress={() => router.replace('/(personalized)/' as any)}
          >
            <LinearGradient
              colors={['#4C40F7', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Pay {formattedAmount}</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.providerNote}>
            Your payment is encrypted and secure.
          </Text>
          <Text style={styles.footerNote}>
            {isProducer
              ? 'Your Producer access never expires.'
              : 'Cancel anytime from Profile.'}
          </Text>

          <TouchableOpacity
            style={styles.changePlanBtn}
            onPress={() => router.dismissTo('/(subscription)')}>
            <Text style={styles.changePlanText}>Change Plan</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090A10',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 24,
  },
  mainContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  backBtn: {
    paddingVertical: 6,
    paddingRight: 12,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 0,
  },
  logo: {
    width: 110,
    height: 90,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'left',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'left',
    marginBottom: 16,
    lineHeight: 16,
  },
  cardBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  badgeWrapper: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
  },
  formContainer: {
    gap: 12,
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#121422',
    borderWidth: 1,
    borderColor: '#26293D',
    borderRadius: 10,
    height: 48,
    paddingHorizontal: 14,
    color: '#FFFFFF',
    fontSize: 13,
  },
  termsText: {
    color: '#9CA3AF',
    fontSize: 11,
    lineHeight: 15,
  },
  termsLink: {
    color: '#3B82F6',
    fontWeight: '500',
  },
  ctaWrapper: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingTop: 14,
  },
  buttonTouchable: {
    width: '100%',
  },
  actionButton: {
    width: '100%',
    height: 50,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  providerNote: {
    color: '#9CA3AF',
    fontSize: 11,
    marginTop: 10,
    fontWeight: '500',
  },
  footerNote: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 3,
    textAlign: 'center',
  },
  changePlanBtn: {
    marginTop: 12,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  changePlanText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '600',
  },
});