import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Video, ResizeMode } from 'expo-video';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { VideoMetadata } from '../../types/messaging';
import { formatDuration, formatFileSize } from '../../services/fileUploadService';

interface VideoMessageProps {
  videoUrl: string;
  metadata: VideoMetadata;
  isOwnMessage: boolean;
}

const VideoMessage: React.FC<VideoMessageProps> = ({
  videoUrl,
  metadata,
  isOwnMessage,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <View style={[styles.container, isOwnMessage && styles.ownMessage]}>
      <TouchableOpacity 
        style={styles.videoContainer}
        onPress={togglePlay}
        activeOpacity={0.9}
      >
        {metadata.thumbnailUrl ? (
          <Image 
            source={{ uri: metadata.thumbnailUrl }} 
            style={styles.thumbnail}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderThumbnail}>
            <MaterialIcons name="movie" size={48} color={colors.gray400} />
          </View>
        )}
        
        {/* Play overlay */}
        {!isPlaying && (
          <View style={styles.playOverlay}>
            <View style={styles.playButton}>
              <MaterialIcons name="play-arrow" size={40} color={colors.white} />
            </View>
          </View>
        )}
        
        {/* Duration badge */}
        {metadata.duration > 0 && (
          <View style={styles.durationBadge}>
            <Text style={styles.durationText}>
              {formatDuration(metadata.duration)}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Video info */}
      <View style={styles.infoContainer}>
        <Text style={[styles.infoText, isOwnMessage && styles.ownText]}>
          {metadata.format.toUpperCase()} • {formatFileSize(metadata.size)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.gray100,
    borderRadius: 12,
    overflow: 'hidden',
    maxWidth: '85%',
  },
  ownMessage: {
    backgroundColor: 'transparent',
  },
  videoContainer: {
    width: 280,
    height: 200,
    backgroundColor: colors.black,
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  placeholderThumbnail: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.gray800,
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.brandPurple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  durationText: {
    fontSize: 12,
    color: colors.white,
    fontWeight: '600',
  },
  infoContainer: {
    padding: 8,
  },
  infoText: {
    fontSize: 12,
    color: colors.gray600,
  },
  ownText: {
    color: colors.white,
  },
});

export default VideoMessage;

