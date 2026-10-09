// app/(subscription)/confirm.tsx
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

export default function ConfirmPaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Determine selected plan from route parameters (defaulting to 'monthly')
  const selectedPlan = (params.plan as 'monthly' | 'producer') || 'monthly';
  const isProducer = selectedPlan === 'producer';

  const features = isProducer
    ? [
        'Everything in User',
        'Upload full movies for approval & publishing',
        'One-time payment — no monthly renewal',
        'Producer badge on your profile',
      ]
    : [
        'Full access to Movies, Live Sports & Shorts',
        'No ads on Movies or Live Sports',
        'HD & Full quality',
        'Download & watch offline',
        'Upload & go live on Shorts',
      ];

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

          {/* Dynamic Headline */}
          <Text style={styles.title}>Confirm Your Payment</Text>
          <Text style={styles.subtitle}>
            {isProducer
              ? "You're upgrading to Producer — $80 one-time."
              : "You're subscribing to User — ₦1,700/month."}
          </Text>

          {/* Active Summary Plan Card */}
          <View style={styles.cardContainer}>
            <LinearGradient
              colors={['#1C2A78', '#4A2A9A', '#131528']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.planCard}>
              {!isProducer && (
                <Text style={styles.mostPopularText}>MOST POPULAR</Text>
              )}

              <View style={styles.badgePill}>
                <Text style={styles.badgeText}>
                  {isProducer ? 'PRODUCER' : 'USER'}
                </Text>
              </View>

              <Text style={styles.cardDesc}>
                {isProducer
                  ? 'Upload your own\nmovies'
                  : 'Watch without\ninterruption'}
              </Text>

              <Text style={styles.cardPrice}>
                {isProducer ? '$80 ' : '₦1,700 '}
                <Text style={styles.subPrice}>
                  {isProducer ? '/ one-time' : '/ month'}
                </Text>
              </Text>
            </LinearGradient>
          </View>

          {/* Features List */}
          <View style={styles.featuresContainer}>
            {features.map((item, index) => (
              <View key={index} style={styles.featureRow}>
                <Text style={styles.bulletPoint}>•</Text>
                <Text style={styles.featureText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Button & Footer Actions */}
        <View style={styles.ctaWrapper}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.buttonTouchable}
           onPress={() =>
              router.push({
                pathname: '/(subscription)/payMethod',
              })
              }>
            <LinearGradient
              colors={['#4C40F7', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Choose Payment Method</Text>
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

          {/* Change Plan Action Link */}
          <TouchableOpacity
            style={styles.changePlanBtn}
            onPress={() => router.back()}>
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
  cardContainer: {
    width: '100%',
    marginBottom: 20,
  },
  planCard: {
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#5B62F6',
  },
  mostPopularText: {
    color: '#8B93FF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  badgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardDesc: {
    color: '#D1D5DB',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 17,
    marginBottom: 12,
  },
  cardPrice: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
  },
  subPrice: {
    fontSize: 14,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  featuresContainer: {
    minHeight: 120,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bulletPoint: {
    color: '#9CA3AF',
    marginRight: 10,
    fontSize: 13,
    lineHeight: 16,
  },
  featureText: {
    color: '#E5E7EB',
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  ctaWrapper: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingTop: 10,
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