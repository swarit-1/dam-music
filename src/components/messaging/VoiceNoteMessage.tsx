import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { formatDuration } from '../../services/fileUploadService';

interface VoiceNoteMessageProps {
  audioUrl: string;
  duration: number;
  isOwnMessage: boolean;
}

const VoiceNoteMessage: React.FC<VoiceNoteMessageProps> = ({
  audioUrl,
  duration,
  isOwnMessage,
}) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  const loadSound = async () => {
    try {
      setIsLoading(true);
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: audioUrl },
        { shouldPlay: false },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading sound:', error);
      setIsLoading(false);
    }
  };

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setCurrentPosition(status.positionMillis / 1000);
      setIsPlaying(status.isPlaying);

      if (status.didJustFinish) {
        setIsPlaying(false);
        setCurrentPosition(0);
        if (sound) {
          sound.setPositionAsync(0);
        }
      }
    }
  };

  const togglePlayback = async () => {
    try {
      if (!sound) {
        await loadSound();
        return;
      }

      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
    } catch (error) {
      console.error('Error toggling playback:', error);
    }
  };

  const progress = duration > 0 ? (currentPosition / duration) * 100 : 0;

  return (
    <View style={[styles.container, isOwnMessage && styles.ownMessage]}>
      {/* Mic Icon */}
      <View style={[styles.micIcon, isOwnMessage && styles.ownMicIcon]}>
        <MaterialIcons 
          name="mic" 
          size={20} 
          color={isOwnMessage ? colors.white : colors.brandPurple} 
        />
      </View>

      {/* Play Button */}
      <TouchableOpacity 
        style={[styles.playButton, isOwnMessage && styles.ownPlayButton]}
        onPress={togglePlayback}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <MaterialIcons 
            name={isPlaying ? "pause" : "play-arrow"} 
            size={24} 
            color={colors.white} 
          />
        )}
      </TouchableOpacity>

      {/* Progress Bar and Time */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarContainer}>
          <View style={[styles.progressBar, isOwnMessage && styles.ownProgressBar]}>
            <View 
              style={[
                styles.progressFill, 
                isOwnMessage && styles.ownProgressFill,
                { width: `${progress}%` }
              ]} 
            />
          </View>
        </View>
        
        <Text style={[styles.timeText, isOwnMessage && styles.ownText]}>
          {formatDuration(isPlaying ? currentPosition : duration)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.gray100,
    borderRadius: 20,
    padding: 8,
    paddingRight: 12,
    alignItems: 'center',
    maxWidth: '75%',
  },
  ownMessage: {
    backgroundColor: colors.brandPurple,
  },
  micIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(149, 79, 223, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  ownMicIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brandPurple,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ownPlayButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  progressBarContainer: {
    marginBottom: 4,
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.gray300,
    borderRadius: 2,
    overflow: 'hidden',
  },
  ownProgressBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.brandPurple,
    borderRadius: 2,
  },
  ownProgressFill: {
    backgroundColor: colors.white,
  },
  timeText: {
    fontSize: 11,
    color: colors.gray600,
    fontWeight: '500',
  },
  ownText: {
    color: 'rgba(255, 255, 255, 0.9)',
  },
});

export default VoiceNoteMessage;

