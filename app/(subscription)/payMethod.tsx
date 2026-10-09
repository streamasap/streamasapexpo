// app/(subscription)/payment-method.tsx
import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function SelectPaymentMethodScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const selectedPlan = (params.plan as 'monthly' | 'producer') || 'monthly';
  const isProducer = selectedPlan === 'producer';

  // State for selected payment method
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank_transfer'>('card');

  const handleContinue = () => {
  if (paymentMethod === 'card') {
    router.push({
      pathname: '/(subscription)/cardDetails',
      params: { plan: selectedPlan },
    });
  } else {
    router.push({
      pathname: '/(subscription)/bankTransfer',
      params: { plan: selectedPlan },
    });
  }
};

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Main Body */}
        <View style={styles.mainContent}>
          {/* Header Back Button */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Centered Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/asapfull.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Headline & Dynamic Subtitle */}
          <Text style={styles.title}>Select Payment Method</Text>
          <Text style={styles.subtitle}>
            {isProducer
              ? "You're subscribing to Producer — $80/one-time."
              : "You're subscribing to User — ₦1,700/month."}
          </Text>

          {/* Payment Method Cards */}
          <View style={styles.optionsContainer}>
            {/* Card Option */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setPaymentMethod('card')}
              style={styles.methodCardWrapper}>
              <LinearGradient
                colors={
                  paymentMethod === 'card'
                    ? ['#1C2A78', '#4A2A9A', '#131528']
                    : ['#141624', '#181A2D']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.methodCard,
                  paymentMethod === 'card' && styles.selectedBorder,
                ]}>
                <Text style={styles.methodText}>Card</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Bank Transfer Option */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setPaymentMethod('bank_transfer')}
              style={styles.methodCardWrapper}>
              <LinearGradient
                colors={
                  paymentMethod === 'bank_transfer'
                    ? ['#1C2A78', '#4A2A9A', '#131528']
                    : ['#141624', '#181A2D']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.methodCard,
                  paymentMethod === 'bank_transfer' && styles.selectedBorder,
                ]}>
                <Text style={styles.methodText}>Bank Transfer</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom CTA Wrapper */}
        <View style={styles.ctaWrapper}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.buttonTouchable}
            onPress={handleContinue}>
            <LinearGradient
              colors={['#4C40F7', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.providerNote}>
            Secure payments powered by Paystack
          </Text>
          <Text style={styles.footerNote}>
            {isProducer
              ? 'Your Producer access never expires.'
              : 'You can change or cancel your plan anytime from Profile.'}
          </Text>

          {/* Change Plan Button */}
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
    marginBottom: 24,
    lineHeight: 16,
  },
  optionsContainer: {
    gap: 16,
  },
  methodCardWrapper: {
    width: '100%',
  },
  methodCard: {
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 20,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#1E2035',
  },
  selectedBorder: {
    borderColor: '#5B62F6',
    borderWidth: 1.5,
  },
  methodText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  ctaWrapper: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingTop: 16,
  },
  buttonTouchable: {
    width: '100%',
  },
  actionButton: {
    width: '100%',
    height: 52,
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
    marginTop: 12,
    fontWeight: '500',
  },
  footerNote: {
    color: '#6B7280',
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  changePlanBtn: {
    marginTop: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  changePlanText: {
    color: '#3B82F6',
    fontSize: 12,
    fontWeight: '600',
  },
});