import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { FileMetadata } from '../../types/messaging';
import { getFileIcon, formatFileSize } from '../../services/fileUploadService';
import * as WebBrowser from 'expo-web-browser';

interface FileMessageProps {
  fileMetadata: FileMetadata;
  isOwnMessage: boolean;
  onDownload?: () => void;
}

const FileMessage: React.FC<FileMessageProps> = ({
  fileMetadata,
  isOwnMessage,
  onDownload,
}) => {
  const fileIcon = getFileIcon(fileMetadata.name);

  const handlePress = async () => {
    if (onDownload) {
      onDownload();
    } else {
      // Open in browser
      try {
        await WebBrowser.openBrowserAsync(fileMetadata.url);
      } catch (error) {
        console.error('Error opening file:', error);
      }
    }
  };

  const getFileTypeLabel = () => {
    const ext = fileMetadata.format.toUpperCase();
    const typeMap: { [key: string]: string } = {
      'PDF': 'Document',
      'DOC': 'Document',
      'DOCX': 'Document',
      'TXT': 'Text File',
      'MID': 'MIDI File',
      'MIDI': 'MIDI File',
      'ZIP': 'Archive',
      'RAR': 'Archive',
      'FLP': 'FL Studio Project',
      'LOGIC': 'Logic Project',
      'ALS': 'Ableton Project',
    };
    return typeMap[ext] || 'File';
  };

  return (
    <TouchableOpacity 
      style={[styles.container, isOwnMessage && styles.ownMessage]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* File Icon */}
      <View style={[styles.iconContainer, isOwnMessage && styles.ownIconContainer]}>
        <Text style={styles.fileIcon}>{fileIcon}</Text>
      </View>

      {/* File Info */}
      <View style={styles.infoContainer}>
        <Text 
          style={[styles.fileName, isOwnMessage && styles.ownText]}
          numberOfLines={2}
        >
          {fileMetadata.name}
        </Text>
        
        <View style={styles.metadataRow}>
          <Text style={[styles.metadataText, isOwnMessage && styles.ownMetadataText]}>
            {getFileTypeLabel()} • {formatFileSize(fileMetadata.size)}
          </Text>
          {fileMetadata.versionNumber && (
            <View style={styles.versionBadge}>
              <Text style={styles.versionText}>{fileMetadata.versionNumber}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Download Icon */}
      <MaterialIcons 
        name="download" 
        size={24} 
        color={isOwnMessage ? colors.white : colors.brandPurple} 
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.gray100,
    borderRadius: 12,
    padding: 12,
    maxWidth: '85%',
    alignItems: 'center',
  },
  ownMessage: {
    backgroundColor: colors.brandPurple,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ownIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  fileIcon: {
    fontSize: 28,
  },
  infoContainer: {
    flex: 1,
    marginRight: 12,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  ownText: {
    color: colors.white,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metadataText: {
    fontSize: 12,
    color: colors.gray600,
  },
  ownMetadataText: {
    color: 'rgba(255, 255, 255, 0.8)',
  },
  versionBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  versionText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: '600',
  },
});

export default FileMessage;

