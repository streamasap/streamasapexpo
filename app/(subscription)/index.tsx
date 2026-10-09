import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { prefetchCatalogData } from '../../services/catalogPrefetch';

export default function ChoosePlanScreen() {
  const router = useRouter();

  useEffect(() => {
    // Pre-warm catalog in background during subscription choice
    prefetchCatalogData().catch(() => {});
  }, []);

  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'producer'>('monthly');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const monthlyFeatures = [
    'Full access to Movies, Live Sports & Shorts',
    'No ads on Movies or Live Sports',
    'HD & Full quality',
    'Download & watch offline',
    'Upload & go live on Shorts',
  ];

  const producerFeatures = [
    'Everything in User',
    'Upload full movies for approval & publishing',
    'One-time payment — no monthly renewal',
    'Producer badge on your profile',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Main Content Area */}
        <View style={styles.mainContent}>
          {/* Header Navigation with Pill-Bordered Continue Free */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={() => router.replace('/(personalized)/' as any)}
              style={styles.continueFreeBtn}>
              <Text style={styles.continueFreeText}>Continue Free</Text>
            </TouchableOpacity>
          </View>

          {/* Logo Container with Height 100 */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/images/asapfull.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Left-Aligned Title and Description */}
          <Text style={styles.title}>Choose Your Plan</Text>
          <Text style={styles.subtitle}>
            Pick a plan and start your endless entertainment on StreamASAP
          </Text>

          {/* Fixed-height Toggle Container Area */}
          <View style={styles.toggleArea}>
            {selectedPlan === 'monthly' ? (
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[
                    styles.toggleOption,
                    billingCycle === 'monthly' && styles.toggleActive,
                  ]}
                  onPress={() => setBillingCycle('monthly')}>
                  <Text
                    style={[
                      styles.toggleText,
                      billingCycle === 'monthly' && styles.toggleTextActive,
                    ]}>
                    Monthly
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.toggleOption,
                    billingCycle === 'yearly' && styles.toggleActive,
                  ]}
                  onPress={() => setBillingCycle('yearly')}>
                  <Text
                    style={[
                      styles.toggleText,
                      billingCycle === 'yearly' && styles.toggleTextActive,
                    ]}>
                    Yearly
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>

          {/* Plan Cards Row */}
          <View style={styles.planCardsRow}>
            {/* Monthly / User Plan Card */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setSelectedPlan('monthly')}
              style={styles.cardTouchWrapper}>
              <LinearGradient
                colors={
                  selectedPlan === 'monthly'
                    ? ['#1C2A78', '#4A2A9A', '#131528']
                    : ['#141624', '#181A2D']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.planCard,
                  selectedPlan === 'monthly' && styles.selectedCardBorder,
                ]}>
                <Text style={styles.mostPopularText}>MOST POPULAR</Text>
                
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText}>USER</Text>
                </View>

                <Text style={styles.cardDesc}>Watch without{'\n'}interruption</Text>
                
                <Text style={styles.cardPrice}>
                  ₦1,700 <Text style={styles.subPrice}>/ month</Text>
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Producer Plan Card */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setSelectedPlan('producer')}
              style={styles.cardTouchWrapper}>
              <LinearGradient
                colors={
                  selectedPlan === 'producer'
                    ? ['#1C2A78', '#4A2A9A', '#131528']
                    : ['#141624', '#181A2D']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                  styles.planCard,
                  selectedPlan === 'producer' && styles.selectedCardBorder,
                ]}>
                <View style={styles.badgePillProducer}>
                  <Text style={styles.badgeText}>PRODUCER</Text>
                </View>

                <Text style={styles.cardDesc}>Upload your own{'\n'}movies</Text>

                <Text style={styles.cardPrice}>
                  $80 <Text style={styles.subPrice}>/ one-time</Text>
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Features List with Adjusted Minimum Height */}
          <View style={styles.featuresContainer}>
            {(selectedPlan === 'monthly' ? monthlyFeatures : producerFeatures).map(
              (item, index) => (
                <View key={index} style={styles.featureRow}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.featureText}>{item}</Text>
                </View>
              )
            )}
          </View>
        </View>

        {/* CTA Wrapper anchored to bottom */}
        <View style={styles.ctaWrapper}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.buttonTouchable}
            onPress={() =>
              router.push({
                pathname: '/(subscription)/confirm',
                params: { plan: selectedPlan },
              })
            }>
            <LinearGradient
              colors={['#4C40F7', '#2563EB']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.actionButton}>
              <Text style={styles.actionButtonText}>
                {selectedPlan === 'monthly'
                  ? 'Subscribe — ₦1,700'
                  : 'Become a Producer — $80'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.providerNote}>
            Secure payments powered by Paystack
          </Text>
          <Text style={styles.footerNote}>
            {selectedPlan === 'monthly'
              ? 'You can change or cancel your plan anytime from Profile.'
              : 'Your Producer access never expires.'}
          </Text>
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
    paddingBottom: 20,
  },
  mainContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 0,
  },
  continueFreeBtn: {
    marginTop: 8,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#2D3047',
    backgroundColor: 'transparent',
  },
  continueFreeText: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '500',
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 0,
  },
  logo: {
    width: 110,
    height: 100,
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
    marginBottom: 12,
    lineHeight: 16,
  },
  toggleArea: {
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#12131F',
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: '#232538',
  },
  toggleOption: {
    paddingHorizontal: 16,
    paddingVertical: 5,
    borderRadius: 16,
  },
  toggleActive: {
    backgroundColor: '#4C40F7',
  },
  toggleText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  planCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardTouchWrapper: {
    width: '48%',
  },
  planCard: {
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E2035',
    minHeight: 165,
    justifyContent: 'space-between',
  },
  selectedCardBorder: {
    borderColor: '#5B62F6',
    borderWidth: 1.5,
  },
  mostPopularText: {
    color: '#8B93FF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  badgePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    marginBottom: 6,
  },
  badgePillProducer: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardDesc: {
    color: '#D1D5DB',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
    marginBottom: 8,
  },
  cardPrice: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  subPrice: {
    fontSize: 11,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  featuresContainer: {
    minHeight: 130,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletPoint: {
    color: '#9CA3AF',
    marginRight: 8,
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
    paddingTop: 8,
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
});