import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { TrendingNow, CatalogMovieItem } from '../../components/tabsHome/TrendingNow';
import { API_BASE_URL } from '../../context/Api';

const GENRES = ['All', 'Action', 'Comedy', 'Horror', 'Drama', 'Sci-Fi', 'Thriller'];

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');

  const [searchResults, setSearchResults] = useState<CatalogMovieItem[] | undefined>(undefined);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Execute search API request
  const executeSearch = useCallback(async (queryStr: string, genreStr: string) => {
    // If input is empty and genre is "All", show default home trending items
    if (!queryStr.trim() && genreStr === 'All') {
      setSearchResults(undefined);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const activeGenre = genreStr === 'All' ? '' : genreStr;
      const endpoint = `${API_BASE_URL}/movies/search?query=${encodeURIComponent(queryStr)}&genre=${encodeURIComponent(activeGenre)}`;

      const response = await fetch(endpoint);
      const json = await response.json();

      console.log('[DEBUG Search Payload]:', JSON.stringify(json));

      const rawList =
        json.data?.results ||
        json.data?.subjects ||
        json.data?.trending ||
        json.data ||
        json.results ||
        (Array.isArray(json) ? json : []);

      if (Array.isArray(rawList)) {
        setSearchResults(rawList);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error('Search request error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce user input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      executeSearch(searchQuery, selectedGenre);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedGenre, executeSearch]);

  const handleSelectGenre = (genre: string) => {
    setSelectedGenre(genre);
    executeSearch(searchQuery, genre);
  };

  const handleClear = () => {
    setSearchQuery('');
    executeSearch('', selectedGenre);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        {/* Search Input Bar */}
        <View style={styles.searchSection}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Search movies, series..."
              placeholderTextColor="#6B6B73"
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
              onSubmitEditing={() => executeSearch(searchQuery, selectedGenre)}
            />

            {searchQuery.length > 0 && (
              <TouchableOpacity activeOpacity={0.7} onPress={handleClear} style={styles.clearBtn}>
                <Ionicons name="close-circle" size={18} color="#6B6B73" />
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.searchActionBtn}
              onPress={() => executeSearch(searchQuery, selectedGenre)}>
              <Text style={styles.searchActionText}>Search</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity activeOpacity={0.7} style={styles.micButton}>
            <Ionicons name="mic-outline" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Genre Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.genreScroll}>
          {GENRES.map((genre) => {
            const isSelected = selectedGenre === genre;
            return (
              <TouchableOpacity
                key={genre}
                activeOpacity={0.8}
                onPress={() => handleSelectGenre(genre)}
                style={[
                  styles.genreChip,
                  isSelected && styles.genreChipSelected,
                ]}>
                <Text
                  style={[
                    styles.genreText,
                    isSelected && styles.genreTextSelected,
                  ]}>
                  {genre}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Dynamic Search Results / Trending Component */}
        <TrendingNow
          searchResults={searchResults}
          loading={isSearching}
          sectionTitle={
            searchQuery.trim() || selectedGenre !== 'All'
              ? 'Search Results'
              : 'Trending Now'
          }
        />
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
    paddingBottom: 100,
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 36,
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    flexDirection: 'row',
    height: 44,
    backgroundColor: '#111018',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#242132',
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13,
  },
  clearBtn: {
    paddingHorizontal: 4,
  },
  searchActionBtn: {
    paddingLeft: 8,
  },
  searchActionText: {
    color: '#8A4FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  micButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  genreScroll: {
    paddingHorizontal: 20,
    marginTop: 26,
    gap: 8,
  },
  genreChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#131520',
    borderWidth: 1,
    borderColor: '#202436',
  },
  genreChipSelected: {
    backgroundColor: '#1E1B38',
    borderColor: '#6C48C5',
  },
  genreText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
  },
  genreTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});