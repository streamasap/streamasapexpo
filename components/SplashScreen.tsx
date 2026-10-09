// components/SplashScreen.tsx
import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Dimensions,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withSpring,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

interface CustomSplashScreenProps {
  onFinish?: () => void;
  onGetStarted?: () => void;
  isFirstTimeUser?: boolean;
  duration?: number;
}

export default function CustomSplashScreen({
  onFinish,
  onGetStarted,
  isFirstTimeUser = true,
  duration = 2900,
}: CustomSplashScreenProps) {
  const insets = useSafeAreaInsets();

  // Stage 1: asap_Poly1 (350ms - 800ms)
  const polyOpacity = useSharedValue(0);
  const polyScale = useSharedValue(0.75);

  // Stage 2: asapicon / icon.png (1000ms - 1950ms)
  const iconOpacity = useSharedValue(0);
  const iconScale = useSharedValue(0.85);
  const iconTranslateX = useSharedValue(0);

  // Stage 3: asapfull / asapfull.png (1950ms - left)
  const fullOpacity = useSharedValue(0);
  const fullScale = useSharedValue(0.95);
  const fullTranslateX = useSharedValue(-width * 0.65);

  // Progress Bar
  const barProgress = useSharedValue(0);
  const barOpacity = useSharedValue(1);

  // Get Started Button for first-time users
  const buttonOpacity = useSharedValue(0);
  const buttonTranslateY = useSharedValue(50);

  useEffect(() => {
    // Stage 1 (350ms - 800ms): asap_Poly1 zooms & fades in
    polyOpacity.value = withDelay(
      350,
      withSequence(
        withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }),
        withDelay(150, withTiming(0, { duration: 150, easing: Easing.in(Easing.cubic) }))
      )
    );

    polyScale.value = withDelay(
      350,
      withSequence(
        withTiming(1.08, { duration: 300, easing: Easing.out(Easing.cubic) }),
        withTiming(1.0, { duration: 150 }),
        withTiming(1.04, { duration: 150 })
      )
    );

    // Stage 2 (1000ms - 1950ms): Icon enters in center
    iconOpacity.value = withDelay(
      1000,
      withSequence(
        withTiming(1, { duration: 300, easing: Easing.out(Easing.cubic) }),
        withDelay(350, withTiming(0, { duration: 350, easing: Easing.inOut(Easing.cubic) }))
      )
    );

    iconScale.value = withDelay(
      1000,
      withSequence(
        withTiming(1.0, { duration: 300, easing: Easing.out(Easing.cubic) }),
        withDelay(350, withTiming(0.95, { duration: 350 }))
      )
    );

    // Stage 2 transition out: moves to the RIGHT
    iconTranslateX.value = withDelay(
      1650,
      withTiming(width * 0.65, { duration: 350, easing: Easing.in(Easing.cubic) })
    );

    // Stage 3 (1950ms onwards): transitions in FROM THE LEFT
    fullTranslateX.value = withDelay(
      1650,
      withTiming(0, { duration: 350, easing: Easing.out(Easing.cubic) })
    );

    fullOpacity.value = withDelay(
      1650,
      withTiming(1, { duration: 350, easing: Easing.out(Easing.cubic) })
    );

    // Stage 3 expands to be big at center, remaining permanently
    fullScale.value = withDelay(
      1950,
      withSequence(
        withTiming(1.28, { duration: 450, easing: Easing.out(Easing.cubic) }),
        withTiming(1.24, { duration: 350, easing: Easing.inOut(Easing.quad) })
      )
    );

    // Continuous Red Progress Bar
    barProgress.value = withDelay(
      100,
      withTiming(1, {
        duration: 2500,
        easing: Easing.bezier(0.2, 0.0, 0.2, 1),
      })
    );

    // Progress bar fades out
    barOpacity.value = withDelay(
      2650,
      withTiming(0, { duration: 250, easing: Easing.out(Easing.quad) })
    );

    if (isFirstTimeUser) {
      buttonOpacity.value = withDelay(
        2750,
        withTiming(1, { duration: 450, easing: Easing.out(Easing.cubic) })
      );
      buttonTranslateY.value = withDelay(
        2750,
        withSpring(0, { damping: 14, stiffness: 90 })
      );
    } else {
      const exitTimer = setTimeout(() => {
        if (onFinish) {
          onFinish();
        }
      }, duration);
      return () => clearTimeout(exitTimer);
    }
  }, [duration, isFirstTimeUser, onFinish]);

  const animatedPolyStyle = useAnimatedStyle(() => ({
    opacity: polyOpacity.value,
    transform: [{ scale: polyScale.value }],
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    opacity: iconOpacity.value,
    transform: [
      { scale: iconScale.value },
      { translateX: iconTranslateX.value },
    ],
  }));

  const animatedFullStyle = useAnimatedStyle(() => ({
    opacity: fullOpacity.value,
    transform: [
      { scale: fullScale.value },
      { translateX: fullTranslateX.value },
    ],
  }));

  const animatedProgressStyle = useAnimatedStyle(() => ({
    width: `${barProgress.value * 100}%`,
  }));

  const animatedBarContainerStyle = useAnimatedStyle(() => ({
    opacity: barOpacity.value,
  }));

  const animatedButtonStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ translateY: buttonTranslateY.value }],
  }));

  const bottomSafePadding = Math.max(insets.bottom, 16) + 16;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />

      <View style={styles.centerContainer}>
        <Animated.View style={[styles.logoLayer, animatedPolyStyle]}>
          <Image
            source={require('../assets/images/asap_Poly1.png')}
            style={styles.polyImage}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View style={[styles.logoLayer, animatedIconStyle]}>
          <Image
            source={require('../assets/images/icon.png')}
            style={styles.iconImage}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View style={[styles.logoLayer, animatedFullStyle]}>
          <Image
            source={require('../assets/images/asapfull.png')}
            style={styles.fullImage}
            resizeMode="contain"
          />
        </Animated.View>
      </View>

      <Animated.View
        style={[
          styles.loaderContainer,
          animatedBarContainerStyle,
          { bottom: bottomSafePadding + 14 },
        ]}>
        <View style={styles.progressBarTrack}>
          <Animated.View style={[styles.progressBarFill, animatedProgressStyle]} />
        </View>
      </Animated.View>

      {isFirstTimeUser && (
        <Animated.View
          style={[
            styles.bottomButtonContainer,
            animatedButtonStyle,
            { bottom: bottomSafePadding },
          ]}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.getStartedButton}
            onPress={onGetStarted}>
            <Text style={styles.getStartedText}>Get Started</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  centerContainer: {
    width: width,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoLayer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  polyImage: {
    width: 90,
    height: 90,
  },
  iconImage: {
    width: 130,
    height: 130,
  },
  fullImage: {
    width: width * 0.85,
    height: 170,
  },
  loaderContainer: {
    position: 'absolute',
    alignItems: 'center',
    width: '100%',
  },
  progressBarTrack: {
    width: width * 0.42,
    height: 3.5,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#E50914',
    borderRadius: 3,
  },
  bottomButtonContainer: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  getStartedButton: {
    backgroundColor: '#3556F7',
    width: '100%',
    maxWidth: 320,
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
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});