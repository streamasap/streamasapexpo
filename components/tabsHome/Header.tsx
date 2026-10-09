// components/tabsHome/Header.tsx
import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

const CATEGORIES = ['Shorts', 'Movies', 'Sports'];

export function Header() {
  const [activeCategory, setActiveCategory] = useState('Movies');

  return (
    <View style={styles.container}>
      <View style={styles.categoriesRow}>
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <TouchableOpacity key={cat} onPress={() => setActiveCategory(cat)}>
              <Text style={[styles.categoryText, isActive && styles.activeCategoryText]}>
                {cat}
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
    backgroundColor: '#05060A',
    paddingVertical: 12,
    alignItems: 'center',
  },
  categoriesRow: {
    flexDirection: 'row',
    gap: 28,
  },
  categoryText: {
    color: '#8E8E93',
    fontSize: 18,
    fontWeight: '500',
  },
  activeCategoryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});