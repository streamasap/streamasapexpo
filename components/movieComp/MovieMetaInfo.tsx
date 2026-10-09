import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SubjectDetails } from '../../app/(tabs)/watch';

export interface MovieMetaInfoProps {
  details?: SubjectDetails | null;
}

export function MovieMetaInfo({ details }: MovieMetaInfoProps) {
  const title = details?.title || details?.name || 'Spider-Man: Brand New Day';
  const year = details?.year || '2026';
  const score = details?.score ? details.score.toFixed(1) : '8.0';
  const isSeries = details?.subjectType === 2;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>{year}</Text>
        <Text style={styles.dot}>•</Text>
        <Text style={styles.metaText}>{isSeries ? 'TV Series' : 'Movie'}</Text>
        <Text style={styles.dot}>•</Text>
        <View style={styles.ratingBox}>
          <Text style={styles.ratingText}>{score}</Text>
          <Ionicons name="star" size={11} color="#FBBF24" />
        </View>
      </View>

      <Text style={styles.description} numberOfLines={3}>
        {details?.overview || details?.description || 'A forgotten peter parker lives alone as a full-time spider-man until mounting pressure triggers a dangerous change.'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  metaText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  dot: {
    fontSize: 12,
    color: '#6B7280',
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  description: {
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 18,
  },
});