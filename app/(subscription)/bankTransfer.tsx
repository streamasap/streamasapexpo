// app/(subscription)/bankTransfer.tsx
import React from 'react';
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

export default function BankTransferScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const selectedPlan = (params.plan as 'monthly' | 'producer') || 'monthly';
  const isProducer = selectedPlan === 'producer';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Main Content Area */}
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
          <Text style={styles.title}>Bank Transfer</Text>
          <Text style={styles.subtitle}>
            {isProducer
              ? "You're subscribing to Producer — $80/one-time."
              : "You're subscribing to User — ₦1,700/month."}
          </Text>

          {/* Coming Soon Card Container */}
          <View style={styles.cardContainer}>
            <LinearGradient
              colors={['#1C2A78', '#4A2A9A', '#131528']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.comingSoonCard}>
              
              {/* Card Icon Header */}
              <View style={styles.iconCircle}>
                <Ionicons name="business" size={28} color="#8B93FF" />
              </View>

              {/* Status Badge */}
              <View style={styles.badgePill}>
                <Text style={styles.badgeText}>COMING SOON</Text>
              </View>

              <Text style={styles.cardTitle}>Bank Transfer Payment</Text>
              <Text style={styles.cardDesc}>
                Direct bank transfers are currently under maintenance. Please select card payment to complete your checkout instantly.
              </Text>
            </LinearGradient>
          </View>
        </View>

        {/* Bottom Action Section */}
        <View style={styles.ctaWrapper}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.buttonTouchable}
            onPress={() =>
              router.replace({
                pathname: '/(subscription)/cardDetails',
                params: { plan: selectedPlan },
              })
            }>
            <LinearGradient
              colors={['#4C40F7', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Pay with Card Instead</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.providerNote}>
            Secure payments powered by Paystack
          </Text>
          <Text style={styles.footerNote}>
            {isProducer
              ? 'Your Producer access never expires.'
              : 'Cancel anytime from Profile.'}
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
    marginBottom: 20,
    lineHeight: 16,
  },
  cardContainer: {
    width: '100%',
    marginVertical: 8,
  },
  comingSoonCard: {
    borderRadius: 16,
    paddingVertical: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#5B62F6',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  badgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 12,
  },
  badgeText: {
    color: '#8B93FF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  cardDesc: {
    color: '#D1D5DB',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
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