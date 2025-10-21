import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { ScoredPost } from '../types';
import { getFeedForUser } from '../services/matchingService';
import { mockUser, mockPosts } from '../data/mockData';
import { audioService } from '../services/audioService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function FeedScreen() {
  const [posts, setPosts] = useState<ScoredPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    initializeScreen();
    return () => {
      audioService.cleanup();
    };
  }, []);

  useEffect(() => {
    // Play audio for current post
    if (posts.length > 0 && currentIndex < posts.length) {
      const currentPost = posts[currentIndex];
      playAudio(currentPost.audio_clip_url);
    }
  }, [currentIndex, posts]);

  const initializeScreen = async () => {
    try {
      // Initialize audio service
      await audioService.initialize();

      // Fetch and rank posts
      const rankedPosts = getFeedForUser(mockUser, mockPosts);
      setPosts(rankedPosts);
      setLoading(false);
    } catch (error) {
      console.error('Error initializing feed:', error);
      setLoading(false);
    }
  };

  const playAudio = async (url: string) => {
    try {
      await audioService.playSound(url, true);
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const togglePlayPause = async () => {
    try {
      if (isPlaying) {
        await audioService.pauseSound();
        setIsPlaying(false);
      } else {
        await audioService.resumeSound();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error toggling play/pause:', error);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      setCurrentIndex(index);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const renderPost = ({ item, index }: { item: ScoredPost; index: number }) => {
    const matchPercentage = Math.round(item.score * 100);

    return (
      <View style={styles.postContainer}>
        {/* Background gradient effect */}
        <View style={styles.background} />

        {/* Content overlay */}
        <View style={styles.contentContainer}>
          {/* Match score badge */}
          <View style={styles.matchBadge}>
            <Text style={styles.matchText}>{matchPercentage}% Match</Text>
          </View>

          {/* Post info */}
          <View style={styles.infoContainer}>
            <Text style={styles.genreText}>{item.genre.toUpperCase()}</Text>
            <Text style={styles.creatorName}>{item.creator_name}</Text>
            <Text style={styles.roleText}>
              {item.creator_role.join(', ')}
            </Text>

            <View style={styles.rolesNeededContainer}>
              <Text style={styles.rolesLabel}>Looking for:</Text>
              <Text style={styles.rolesNeeded}>
                {item.roles_needed.join(', ')}
              </Text>
            </View>

            <View style={styles.tagsContainer}>
              {item.tags.map((tag, i) => (
                <View key={i} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Play/Pause button */}
          <TouchableOpacity
            style={styles.playButton}
            onPress={togglePlayPause}
            activeOpacity={0.8}
          >
            <Text style={styles.playButtonText}>
              {currentIndex === index && isPlaying ? '⏸' : '▶'}
            </Text>
          </TouchableOpacity>

          {/* Action buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>👤</Text>
              <Text style={styles.actionLabel}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>❤️</Text>
              <Text style={styles.actionLabel}>Like</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionLabel}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1DB954" />
        <Text style={styles.loadingText}>Loading your matches...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(data, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
  },
  postContainer: {
    height: SCREEN_HEIGHT,
    width: '100%',
    position: 'relative',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#1a1a1a',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 20,
    paddingBottom: 40,
  },
  matchBadge: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: '#1DB954',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  matchText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  infoContainer: {
    marginBottom: 20,
  },
  genreText: {
    color: '#1DB954',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1,
  },
  creatorName: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  roleText: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 16,
  },
  rolesNeededContainer: {
    marginBottom: 12,
  },
  rolesLabel: {
    color: '#888',
    fontSize: 14,
    marginBottom: 4,
  },
  rolesNeeded: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#fff',
    fontSize: 12,
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -35 }, { translateY: -35 }],
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 30,
    color: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  actionLabel: {
    color: '#fff',
    fontSize: 12,
  },
});
