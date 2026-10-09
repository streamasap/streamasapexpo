import React, { useCallback, useRef, useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import CustomSplashScreen from '../components/SplashScreen';
import { useAuth } from '../context/AuthContext';
import { prefetchCatalogData } from '../services/catalogPrefetch';

export default function Index() {
  const router = useRouter();
  const { isFirstTimeUser, getInitialRoute, isLoading } = useAuth();

  const hasNavigated = useRef(false);
  const [isSplashDone, setIsSplashDone] = useState(false);

  // 1. Run catalog pre-warming in the background during splash screen
  useEffect(() => {
    prefetchCatalogData().catch((err) => {
      console.error('Background prefetch failed silently:', err);
    });
  }, []);

  const handleFinish = useCallback(() => {
    setIsSplashDone(true);
  }, []);

  const handleGetStarted = useCallback(() => {
    if (hasNavigated.current) return;
    hasNavigated.current = true;

    // Navigate straight to slides WITHOUT setting isFirstTimeUser to false yet!
    router.replace('/(onboard)/slides' as any);
  }, [router]);

  useEffect(() => {
    if (isFirstTimeUser) return;

    if (isSplashDone && !isLoading && !hasNavigated.current) {
      hasNavigated.current = true;
      const targetRoute = getInitialRoute();
      router.replace(targetRoute as any);
    }
  }, [isSplashDone, isLoading, isFirstTimeUser, getInitialRoute, router]);

  return (
    <CustomSplashScreen
      onFinish={handleFinish}
      onGetStarted={handleGetStarted}
      isFirstTimeUser={isFirstTimeUser}
      duration={2900}
    />
  );
}