import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { AudioMetadata } from '../../types/messaging';
import { formatDuration } from '../../services/fileUploadService';
import WaveformVisualization from './WaveformVisualization';

interface AudioMessageProps {
  audioUrl: string;
  metadata: AudioMetadata;
  isOwnMessage: boolean;
  onTimestampPress?: (timestamp: number) => void;
}

const AudioMessage: React.FC<AudioMessageProps> = ({
  audioUrl,
  metadata,
  isOwnMessage,
  onTimestampPress,
}) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [duration, setDuration] = useState(metadata.duration || 0);

  useEffect(() => {
    return () => {
      // Cleanup sound on unmount
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
      setDuration((status.durationMillis || 0) / 1000);
      setIsPlaying(status.isPlaying);

      // Auto-stop at end
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

  const seekTo = async (position: number) => {
    try {
      if (sound) {
        await sound.setPositionAsync(position * 1000);
      }
    } catch (error) {
      console.error('Error seeking:', error);
    }
  };

  const handleWaveformPress = (progress: number) => {
    const newPosition = progress * duration;
    seekTo(newPosition);
    if (onTimestampPress) {
      onTimestampPress(newPosition);
    }
  };

  return (
    <View style={[styles.container, isOwnMessage && styles.ownMessage]}>
      {/* Play/Pause Button */}
      <TouchableOpacity 
        style={styles.playButton}
        onPress={togglePlayback}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <MaterialIcons 
            name={isPlaying ? "pause" : "play-arrow"} 
            size={32} 
            color={colors.white} 
          />
        )}
      </TouchableOpacity>

      {/* Waveform and Info */}
      <View style={styles.infoContainer}>
        <WaveformVisualization
          waveformData={metadata.waveformData || []}
          currentPosition={currentPosition}
          duration={duration}
          onPress={handleWaveformPress}
          color={isOwnMessage ? colors.white : colors.brandPurple}
        />
        
        <View style={styles.metadataRow}>
          <Text style={[styles.timeText, isOwnMessage && styles.ownText]}>
            {formatDuration(currentPosition)} / {formatDuration(duration)}
          </Text>
          
          {metadata.bpm && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{metadata.bpm} BPM</Text>
            </View>
          )}
          
          {metadata.key && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{metadata.key}</Text>
            </View>
          )}
        </View>

        {/* File info */}
        <Text style={[styles.formatText, isOwnMessage && styles.ownText]}>
          {metadata.format.toUpperCase()} • {formatFileSize(metadata.size)}
          {metadata.versionNumber && ` • ${metadata.versionNumber}`}
        </Text>
      </View>
    </View>
  );
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 10) / 10 + ' ' + sizes[i];
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.gray100,
    borderRadius: 12,
    padding: 12,
    maxWidth: '85%',
  },
  ownMessage: {
    backgroundColor: colors.brandPurple,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.brandPurple,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  timeText: {
    fontSize: 12,
    color: colors.gray600,
    fontWeight: '500',
  },
  ownText: {
    color: colors.white,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  badgeText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '600',
  },
  formatText: {
    fontSize: 10,
    color: colors.gray500,
    marginTop: 4,
  },
});

export default AudioMessage;

