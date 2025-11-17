import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '../config/firebase';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { AudioMetadata, FileMetadata, VideoMetadata } from '../types/messaging';

export type FileType = 'audio' | 'video' | 'document' | 'image';
export type UploadProgressCallback = (progress: number) => void;

/**
 * Pick an audio file
 */
export const pickAudioFile = async (): Promise<{
  uri: string;
  name: string;
  size: number;
  mimeType: string;
} | null> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['audio/*', 'audio/mpeg', 'audio/wav', 'audio/mp3', 'audio/m4a', 'audio/aac'],
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return null;
    }

    const file = result.assets[0];
    return {
      uri: file.uri,
      name: file.name,
      size: file.size || 0,
      mimeType: file.mimeType || 'audio/mpeg',
    };
  } catch (error) {
    console.error('Error picking audio file:', error);
    throw error;
  }
};

/**
 * Pick a video file
 */
export const pickVideoFile = async (): Promise<{
  uri: string;
  name: string;
  size: number;
  mimeType: string;
} | null> => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['videos'],
      allowsEditing: false,
      quality: 1,
    });

    if (result.canceled) {
      return null;
    }

    const video = result.assets[0];
    return {
      uri: video.uri,
      name: `video_${Date.now()}.mp4`,
      size: 0, // Size not available from ImagePicker
      mimeType: 'video/mp4',
    };
  } catch (error) {
    console.error('Error picking video file:', error);
    throw error;
  }
};

/**
 * Pick any document file
 */
export const pickDocumentFile = async (): Promise<{
  uri: string;
  name: string;
  size: number;
  mimeType: string;
} | null> => {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return null;
    }

    const file = result.assets[0];
    return {
      uri: file.uri,
      name: file.name,
      size: file.size || 0,
      mimeType: file.mimeType || 'application/octet-stream',
    };
  } catch (error) {
    console.error('Error picking document file:', error);
    throw error;
  }
};

/**
 * Upload file to Firebase Storage
 */
export const uploadFile = async (
  fileUri: string,
  fileName: string,
  fileType: FileType,
  conversationId: string,
  onProgress?: UploadProgressCallback
): Promise<string> => {
  try {
    // Create storage reference
    const timestamp = Date.now();
    const storagePath = `conversations/${conversationId}/${fileType}/${timestamp}_${fileName}`;
    const storageRef = ref(storage, storagePath);

    // Convert URI to blob
    const response = await fetch(fileUri);
    const blob = await response.blob();

    // Upload with progress tracking
    const uploadTask = uploadBytesResumable(storageRef, blob);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          onProgress?.(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Delete file from Firebase Storage
 */
export const deleteFile = async (fileUrl: string): Promise<void> => {
  try {
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Get audio metadata (duration, format, etc.)
 */
export const getAudioMetadata = async (
  fileUri: string,
  fileName: string,
  fileSize: number
): Promise<AudioMetadata> => {
  try {
    // Load audio to get duration
    const { sound, status } = await Audio.Sound.createAsync(
      { uri: fileUri },
      { shouldPlay: false }
    );

    let duration = 0;
    if (status.isLoaded) {
      duration = (status.durationMillis || 0) / 1000; // Convert to seconds
    }

    // Unload sound
    await sound.unloadAsync();

    // Extract format from filename
    const format = fileName.split('.').pop()?.toLowerCase() || 'mp3';

    return {
      duration,
      format,
      size: fileSize,
      waveformData: [], // Will be generated separately if needed
    };
  } catch (error) {
    console.error('Error getting audio metadata:', error);
    // Return basic metadata if extraction fails
    const format = fileName.split('.').pop()?.toLowerCase() || 'mp3';
    return {
      duration: 0,
      format,
      size: fileSize,
    };
  }
};

/**
 * Generate waveform data from audio file
 * This is a simplified version - in production, you'd want to use Web Audio API
 * or a native module for more accurate waveform generation
 */
export const generateWaveformData = async (
  fileUri: string,
  samples: number = 100
): Promise<number[]> => {
  try {
    // For now, return mock waveform data
    // In production, implement actual audio analysis
    const waveform: number[] = [];
    for (let i = 0; i < samples; i++) {
      // Generate pseudo-random waveform that looks natural
      const value = Math.sin(i * 0.1) * 0.5 + Math.random() * 0.5;
      waveform.push(Math.abs(value));
    }
    return waveform;
  } catch (error) {
    console.error('Error generating waveform:', error);
    return Array(samples).fill(0.5);
  }
};

/**
 * Get video metadata
 */
export const getVideoMetadata = async (
  fileUri: string,
  fileName: string
): Promise<VideoMetadata> => {
  try {
    // For expo, we can't easily get video duration without loading it
    // Return basic metadata
    const format = fileName.split('.').pop()?.toLowerCase() || 'mp4';

    return {
      duration: 0,
      format,
      size: 0,
      url: fileUri,
    };
  } catch (error) {
    console.error('Error getting video metadata:', error);
    throw error;
  }
};

/**
 * Get file metadata
 */
export const getFileMetadata = (
  fileName: string,
  fileSize: number,
  mimeType: string,
  fileUrl: string
): FileMetadata => {
  const format = fileName.split('.').pop()?.toLowerCase() || 'file';
  
  return {
    name: fileName,
    type: mimeType,
    size: fileSize,
    format,
    url: fileUrl,
  };
};

/**
 * Detect file type from MIME type or extension
 */
export const detectFileType = (fileName: string, mimeType?: string): FileType => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  // Check MIME type first
  if (mimeType) {
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('image/')) return 'image';
  }

  // Check extension
  const audioExtensions = ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'aiff'];
  const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];

  if (extension && audioExtensions.includes(extension)) return 'audio';
  if (extension && videoExtensions.includes(extension)) return 'video';
  if (extension && imageExtensions.includes(extension)) return 'image';

  return 'document';
};

/**
 * Get file icon based on extension
 */
export const getFileIcon = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const iconMap: { [key: string]: string } = {
    // Audio
    mp3: '🎵',
    wav: '🎵',
    m4a: '🎵',
    aac: '🎵',
    flac: '🎵',
    ogg: '🎵',
    
    // Video
    mp4: '🎥',
    mov: '🎥',
    avi: '🎥',
    mkv: '🎥',
    
    // Documents
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    txt: '📝',
    
    // Music production
    mid: '🎹',
    midi: '🎹',
    logic: '🎛️',
    flp: '🎛️',
    
    // Archives
    zip: '📦',
    rar: '📦',
    '7z': '📦',
    
    // Images
    jpg: '🖼️',
    jpeg: '🖼️',
    png: '🖼️',
    gif: '🖼️',
  };
  
  return iconMap[extension || ''] || '📎';
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Format duration for display (seconds to MM:SS)
 */
export const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Record voice note
 */
export const recordVoiceNote = async (): Promise<{
  uri: string;
  duration: number;
} | null> => {
  try {
    // Request permissions
    const { granted } = await Audio.requestPermissionsAsync();
    if (!granted) {
      throw new Error('Audio recording permission not granted');
    }

    // Configure audio mode for recording
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });

    // Create recording
    const recording = new Audio.Recording();
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await recording.startAsync();

    // Return recording object wrapped in a promise
    // The actual stopping and getting URI would be handled by the UI component
    return null; // This is a simplified version
  } catch (error) {
    console.error('Error recording voice note:', error);
    throw error;
  }
};

/**
 * Validate file size (limit: 100MB)
 */
export const validateFileSize = (fileSize: number, maxSizeMB: number = 100): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return fileSize <= maxSizeBytes;
};

/**
 * Generate thumbnail for video
 */
export const generateVideoThumbnail = async (videoUri: string): Promise<string | null> => {
  try {
    // Use expo-video-thumbnails if available
    const { VideoThumbnails } = await import('expo-video-thumbnails');
    const { uri } = await VideoThumbnails.getThumbnailAsync(videoUri, {
      time: 1000, // Get thumbnail at 1 second
    });
    return uri;
  } catch (error) {
    console.error('Error generating video thumbnail:', error);
    return null;
  }
};

/**
 * Extract BPM from audio file name (if present)
 * Example: "beat_128bpm.mp3" -> 128
 */
export const extractBPMFromFileName = (fileName: string): number | undefined => {
  const bpmMatch = fileName.match(/(\d+)\s*bpm/i);
  return bpmMatch ? parseInt(bpmMatch[1]) : undefined;
};

/**
 * Extract key from audio file name (if present)
 * Example: "melody_C#min.mp3" -> "C# Minor"
 */
export const extractKeyFromFileName = (fileName: string): string | undefined => {
  const keyMatch = fileName.match(/([A-G][#b]?)(maj|min|major|minor)/i);
  if (keyMatch) {
    const note = keyMatch[1];
    const scale = keyMatch[2].toLowerCase().startsWith('maj') ? 'Major' : 'Minor';
    return `${note} ${scale}`;
  }
  return undefined;
};

