import React, { useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
} from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export interface VideoPreviewProps {
  streamUrl?: string | null;
  posterUri?: string;
  loading?: boolean;
}

export function VideoPreview({ streamUrl, posterUri, loading }: VideoPreviewProps) {
  const sourceObject = streamUrl
    ? {
        uri: streamUrl,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      }
    : null;

  // Initialize video player instance
  const player = useVideoPlayer(sourceObject, (playerInstance) => {
    playerInstance.loop = false;
    if (streamUrl) {
      playerInstance.play();
    }
  });

  // Smoothly swap stream URL asynchronously to prevent UI freeze on iOS
  useEffect(() => {
    let isMounted = true;

    async function updateSource() {
      if (streamUrl && player) {
        try {
          const newSource = {
            uri: streamUrl,
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
          };
          
          if (typeof player.replaceAsync === 'function') {
            await player.replaceAsync(newSource);
          } else {
            player.replace(newSource);
          }
          if (isMounted) player.play();
        } catch (err) {
          console.error('Error switching video source:', err);
        }
      }
    }

    updateSource();

    return () => {
      isMounted = false;
    };
  }, [streamUrl, player]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Fetching stream...</Text>
      </View>
    );
  }

  if (streamUrl) {
    return (
      <View style={styles.container}>
        <VideoView
          style={styles.video}
          player={player}
          nativeControls={true}
          allowsPictureInPicture={true}
          startsPictureInPictureAutomatically={true}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ImageBackground
        source={
          posterUri
            ? { uri: posterUri }
            : require('../../assets/images/mov1.png')
        }
        style={styles.poster}
        resizeMode="cover">
        <View style={styles.overlay}>
          <Text style={styles.noStreamText}>No active stream available</Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: 220,
    backgroundColor: '#10121D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 8,
  },
  noStreamText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: '600',
  },
});