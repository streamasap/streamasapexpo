// app/(tabs)/index.tsx
import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Header } from '../../components/tabsHome/Header';
import { HeroCarousel } from '../../components/tabsHome/HeroCarousel';
import { ContinueWatching } from '../../components/tabsHome/ContinueWatching';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  
  // Tab Bar height (58) + inset bottom + extra padding (24)
  const bottomPadding = 58 + Math.max(insets.bottom, 10) + 24;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomPadding },
        ]}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
        bounces={false}
        overScrollMode="never"
      >
        <Header />
        <View style={styles.body}>
          <HeroCarousel />
          <ContinueWatching />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#05060A',
  },
  scrollContent: {
    // paddingBottom dynamically calculated above
  },
  body: {
    flex: 1,
  },
});