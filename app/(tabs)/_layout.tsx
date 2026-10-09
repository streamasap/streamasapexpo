import React from 'react';
import { Tabs } from 'expo-router';
import { TabBar } from '../../components/tabsHome/TabBar';

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: '#05060A' },
      }}>
      <Tabs.Screen
        name="index"
        options={{ 
          title: 'HOME',
        }}
      />
      <Tabs.Screen
        name="myList"
        options={{
          title: 'MY LIST',
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'SEARCH',
        }}
      />
      <Tabs.Screen
        name="downloads"
        options={{
          title: 'Downloads',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'PROFILE',
        }}
      />
      {/* Hidden from tab bar button list */}
      <Tabs.Screen
        name="watch"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}