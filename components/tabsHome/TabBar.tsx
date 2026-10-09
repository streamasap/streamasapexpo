// components/tabsHome/TabBar.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

export function TabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <View style={styles.tabContent}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          
          // Cast options to safely read Expo Router's href property
          const tabOptions = options as typeof options & { href?: string | null };

          // Skip rendering if href is explicitly set to null or if route is watch
          if (tabOptions.href === null || route.name === 'watch') {
            return null;
          }

          const label = options.title ?? route.name;
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const activeColor = '#FFFFFF';
          const inactiveColor = '#8E8E93';

          const renderIcon = () => {
            switch (route.name) {
              case 'index':
                return (
                  <Ionicons
                    name="home"
                    size={24}
                    color={isFocused ? activeColor : inactiveColor}
                  />
                );
              case 'myList':
                return (
                  <Ionicons
                    name="add"
                    size={28}
                    color={isFocused ? activeColor : inactiveColor}
                  />
                );
              case 'search':
                return (
                  <Ionicons
                    name="search-outline"
                    size={24}
                    color={isFocused ? activeColor : inactiveColor}
                  />
                );
              case 'downloads':
                return (
                  <Ionicons
                    name="cloud-download-outline"
                    size={24}
                    color={isFocused ? activeColor : inactiveColor}
                  />
                );
              case 'profile':
                return (
                  <Image
                    source={{
                      uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
                    }}
                    style={[
                      styles.profileAvatar,
                      isFocused && styles.activeAvatarBorder,
                    ]}
                  />
                );
              default:
                return null;
            }
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              activeOpacity={0.7}
              style={styles.tabItem}>
              {renderIcon()}
              <Text
                style={[
                  styles.label,
                  { color: isFocused ? activeColor : inactiveColor },
                ]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#13131A',
    zIndex: 9999,
    elevation: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.12)',
  },
  tabContent: {
    flexDirection: 'row',
    height: 58,
    paddingTop: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  label: {
    fontSize: 9,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  profileAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  activeAvatarBorder: {
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
});