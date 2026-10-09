// app/(onboard)/slides.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { prefetchCatalogData } from '../../services/catalogPrefetch';

const { width } = Dimensions.get('window');

interface SlideData {
  id: number;
  fullTitle: string;
  firstRow: string;
  secondRow: string;
  titleHighlight: string;
  subtitle: string;
  buttonText: string;
  type: 'movies' | 'sports' | 'shorts' | 'producer' | 'referral';
}

const SLIDES: SlideData[] = [
  {
    id: 1,
    fullTitle: 'Unlimited Movies, Anytime, Anywhere',
    firstRow: 'Unlimited Movies,',
    secondRow: 'Anytime, Anywhere.',
    titleHighlight: 'Anywhere.',
    subtitle:
      'Enjoy thousands of Hollywood hits and global favorites, easily whenever you are.',
    buttonText: 'Start Streaming',
    type: 'movies',
  },
  {
    id: 2,
    fullTitle: 'Live Sports, Straight To You.',
    firstRow: 'Live Sports,',
    secondRow: 'Straight To You.',
    titleHighlight: 'Sports,',
    subtitle:
      'Catch live football and more, streaming right to your phone.',
    buttonText: "See What's Live",
    type: 'sports',
  },
  {
    id: 3,
    fullTitle: 'Scroll, Watch, and Upload.',
    firstRow: 'Scroll, Watch,',
    secondRow: 'And Upload.',
    titleHighlight: 'Upload.',
    subtitle:
      'Discover trending shorts or post your own. Get producer access to header.',
    buttonText: 'Try Shorts',
    type: 'shorts',
  },
  {
    id: 4,
    fullTitle: 'Got A Movie? Upload it on StreamASAP.',
    firstRow: 'Got A Movie?',
    secondRow: 'Upload it on StreamASAP.',
    titleHighlight: 'StreamASAP.',
    subtitle:
      'Subscribe as a Producer to upload your films and reach viewers online.',
    buttonText: 'Start Uploading',
    type: 'producer',
  },
  {
    id: 5,
    fullTitle: 'Share StreamASAP. Get Paid For It.',
    firstRow: 'Share StreamASAP.',
    secondRow: 'Get Paid For It',
    titleHighlight: 'Share',
    subtitle:
      'Every friend who joins with your link earns you real money to your wallet.',
    buttonText: 'Start Earning',
    type: 'referral',
  },
];

export default function OnboardingSlides() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { completeFirstTimeWalkthrough } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);

  const contentOpacity = useSharedValue(1);

  const isNavigating = useRef(false);

  useEffect(() => {
    // Pre-warm catalog into local storage while user is reading slides
    prefetchCatalogData().catch(() => {});
  }, []);

  const changeSlide = (nextIndex: number) => {
    contentOpacity.value = withTiming(0, { duration: 150 }, () => {
      contentOpacity.value = withTiming(1, { duration: 250, easing: Easing.out(Easing.quad) });
    });
    setCurrentIndex(nextIndex);
  };

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      changeSlide(currentIndex + 1);
    } else {
      await finishOnboarding();
    }
  };

  const finishOnboarding = async () => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    router.replace('/(auth)/login' as any);
    await completeFirstTimeWalkthrough();
  };

  const currentSlide = SLIDES[currentIndex];

  const animatedContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  // Dynamic helper to render text row with inline highlighted phrase detection
  const renderTitleRow = (rowText: string, highlight: string) => {
    if (rowText.includes(highlight)) {
      const parts = rowText.split(highlight);
      return (
        <Text
          style={styles.titleText}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}>
          {parts[0]}
          <Text style={styles.highlightText}>{highlight}</Text>
          {parts[1]}
        </Text>
      );
    }
    return (
      <Text
        style={styles.titleText}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.7}>
        {rowText}
      </Text>
    );
  };

  const renderCardGraphic = (type: SlideData['type']) => {
    switch (type) {
      case 'movies':
        return (
          <View style={styles.movieGrid}>
            {[
              { title: 'SCI-FI', color: '#1B2A4A', icon: 'planet-outline' },
              { title: 'ACTION', color: '#3D1C24', icon: 'flame-outline' },
              { title: 'DRAMA', color: '#1A332E', icon: 'film-outline' },
              { title: 'HORROR', color: '#2B1B3D', icon: 'skull-outline' },
              { title: 'COMEDY', color: '#3A2E1A', icon: 'happy-outline' },
              { title: 'THRILLER', color: '#1E293B', icon: 'eye-outline' },
            ].map((item, idx) => (
              <View key={idx} style={[styles.movieTile, { backgroundColor: item.color }]}>
                <Ionicons name={item.icon as any} size={24} color="#FFFFFF" />
                <Text style={styles.movieTileText}>{item.title}</Text>
              </View>
            ))}
          </View>
        );
      case 'sports':
        return (
          <View style={styles.sportsGrid}>
            <View style={[styles.sportsTile, { backgroundColor: '#1E293B' }]}>
              <Ionicons name="football" size={32} color="#38BDF8" />
              <Text style={styles.sportsTag}>FOOTBALL LIVE</Text>
            </View>
            <View style={[styles.sportsTile, { backgroundColor: '#2E1065' }]}>
              <Ionicons name="basketball" size={32} color="#F97316" />
              <Text style={styles.sportsTag}>NBA ARENA</Text>
            </View>
            <View style={[styles.sportsWideTile, { backgroundColor: '#0F172A' }]}>
              <MaterialCommunityIcons name="stadium" size={36} color="#22C55E" />
              <Text style={styles.sportsWideTag}>4K STADIUM BROADCAST</Text>
            </View>
          </View>
        );
      case 'shorts':
        return (
          <View style={styles.shortsContainer}>
            <View style={[styles.shortCard, { backgroundColor: '#31103F' }]}>
              <Ionicons name="videocam" size={30} color="#F43F5E" />
              <Text style={styles.shortCaption}>Trending Clips</Text>
            </View>
            <View style={[styles.shortCard, { backgroundColor: '#0C2742' }]}>
              <Ionicons name="sparkles" size={30} color="#38BDF8" />
              <Text style={styles.shortCaption}>Creator Reels</Text>
            </View>
          </View>
        );
      case 'producer':
        return (
          <View style={styles.producerContainer}>
            <View style={styles.producerStudioCard}>
              <MaterialCommunityIcons name="movie-open-play" size={48} color="#3556F7" />
              <Text style={styles.producerTitle}>Producer Hub</Text>
              <Text style={styles.producerSubtitle}>
                Monetize & publish your indie films directly to millions of viewers worldwide.
              </Text>
              <View style={styles.producerBadge}>
                <Ionicons name="shield-checkmark" size={16} color="#22C55E" />
                <Text style={styles.producerBadgeText}>Verified Producer Rights</Text>
              </View>
            </View>
          </View>
        );
      case 'referral':
        return (
          <View style={styles.referralContainer}>
            <View style={styles.referralCard}>
              <Ionicons name="people" size={44} color="#38BDF8" />
              <Text style={styles.referralTitle}>Invite & Earn Cash</Text>
              <Text style={styles.referralSubtitle}>
                Instant wallet payout for every friend who signs up with your exclusive link.
              </Text>
              <View style={styles.walletPill}>
                <Ionicons name="wallet-outline" size={18} color="#22C55E" />
                <Text style={styles.walletPillText}>Instant Wallet Rewards</Text>
              </View>
            </View>
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      <View
        style={[
          styles.topHeader,
          {
            paddingTop: Math.max(insets.top, 20) + 8,
          },
        ]}>
        <TouchableOpacity
          style={styles.skipButton}
          onPress={finishOnboarding}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>

        <View style={styles.headerBrandingWrapper}>
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View style={styles.brandTextRow}>
            <Text style={styles.brandStreamText}>Stream</Text>
            <Text style={styles.brandAsapText}>Asap</Text>
          </View>
        </View>
      </View>

      <Animated.View style={[styles.mainContent, animatedContentStyle]}>
        {/* Two Rows Block Container */}
        <View style={styles.titleBlockContainer}>
          <View style={styles.titleRow}>
            {renderTitleRow(currentSlide.firstRow, currentSlide.titleHighlight)}
          </View>
          <View style={styles.titleRow}>
            {renderTitleRow(currentSlide.secondRow, currentSlide.titleHighlight)}
          </View>
        </View>

        <Text style={styles.subtitle}>{currentSlide.subtitle}</Text>

        <View style={styles.visualCardContainer}>
          {renderCardGraphic(currentSlide.type)}
        </View>
      </Animated.View>

      <View
        style={[
          styles.bottomControls,
          { paddingBottom: Math.max(insets.bottom, 16) + 16 },
        ]}>
        <View style={styles.paginationRow}>
          {SLIDES.map((slide, idx) => (
            <TouchableOpacity
              key={slide.id}
              onPress={() => changeSlide(idx)}
              activeOpacity={0.7}
              style={[
                styles.dot,
                currentIndex === idx ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          activeOpacity={0.85}
          onPress={handleNext}>
          <Text style={styles.actionButtonText}>{currentSlide.buttonText}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'space-between',
  },
  topHeader: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  skipButton: {
    alignSelf: 'flex-end',
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 4,
  },
  skipText: {
    color: '#8E8E93',
    fontSize: 16,
    fontWeight: '600',
  },
  headerBrandingWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -4,
  },
  headerLogo: {
    width: 60,
    height: 60,
    marginBottom: -15,
  },
  brandTextRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandStreamText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 2,
  },
  brandAsapText: {
    color: '#3556F7',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 26,
    justifyContent: 'center',
  },
  titleBlockContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 10,
  },
  titleRow: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  titleText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  highlightText: {
    color: '#38BDF8',
  },
  subtitle: {
    fontSize: 13.5,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    maxWidth: 320,
  },
  visualCardContainer: {
    width: '100%',
    height: 230,
    borderRadius: 16,
    backgroundColor: '#19191E',
    borderWidth: 1,
    borderColor: '#26262E',
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  movieGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
  },
  movieTile: {
    width: '31%',
    height: '47%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  movieTileText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  sportsGrid: {
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  sportsTile: {
    width: '48%',
    height: '46%',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sportsTag: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
  },
  sportsWideTile: {
    width: '100%',
    height: '48%',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  sportsWideTag: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
    letterSpacing: 1,
  },
  shortsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
    padding: 6,
  },
  shortCard: {
    width: '48%',
    height: '100%',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortCaption: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
  },
  producerContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  producerStudioCard: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  producerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 10,
  },
  producerSubtitle: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  producerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34, 197, 94, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 12,
  },
  producerBadgeText: {
    color: '#22C55E',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 6,
  },
  referralContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  referralCard: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  referralTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginTop: 10,
  },
  referralSubtitle: {
    color: '#8E8E93',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
  walletPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 12,
  },
  walletPillText: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 6,
  },
  bottomControls: {
    alignItems: 'center',
    paddingHorizontal: 26,
    paddingBottom: 28,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  dot: {
    height: 5,
    borderRadius: 3,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 22,
    backgroundColor: '#3556F7',
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#383842',
  },
  actionButton: {
    backgroundColor: '#3556F7',
    width: '100%',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3556F7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});