import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

const UploadScreen = () => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    // Request camera permission on mount
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, []);

  const handleChooseFromFiles = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['audio/*', 'video/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        Alert.alert('File Selected', `Selected: ${result.assets[0].name}`);
        // TODO: Handle file upload
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to pick file');
    }
  };

  const handleChooseFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['videos'],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        Alert.alert('Video Selected', 'Video selected from gallery');
        // TODO: Handle video upload
      }
    } catch (error) {
      console.error('Error picking from gallery:', error);
      Alert.alert('Error', 'Failed to pick from gallery');
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;

    if (isRecording) {
      // Stop recording
      cameraRef.current.stopRecording();
      setIsRecording(false);
    } else {
      // Start recording
      setIsRecording(true);
      try {
        const video = await cameraRef.current.recordAsync();
        if (video) {
          Alert.alert('Recording Complete', 'Video recorded successfully');
          // TODO: Handle video upload
        }
      } catch (error) {
        console.error('Error recording:', error);
        Alert.alert('Error', 'Failed to record video');
      } finally {
        setIsRecording(false);
      }
    }
  };

  const handleCancel = () => {
    if (isRecording) {
      cameraRef.current?.stopRecording();
      setIsRecording(false);
    }
    // TODO: Navigate back
  };

  const handleConfirm = () => {
    Alert.alert('Confirm', 'Would save/upload the recording');
  };

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <MaterialIcons name="camera-alt" size={64} color={colors.gray500} />
          <Text style={styles.permissionText}>Camera access is required to record videos</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>

        {/* Purple Bottom Section with File/Gallery Options */}
        <LinearGradient
          colors={['rgba(81, 43, 121, 1)', 'rgba(149, 79, 223, 1)']}
          style={styles.bottomSection}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        >
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleChooseFromFiles}
            >
              <Text style={styles.optionText}>Choose from Files</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={handleChooseFromGallery}
            >
              <Text style={styles.optionText}>Choose from Gallery</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Camera/Preview Area with Controls */}
      <View style={styles.previewArea}>
        <CameraView 
          ref={cameraRef}
          style={styles.camera} 
          facing={facing}
          mode="video"
        >
          {/* Flip Camera Button */}
          <TouchableOpacity 
            style={styles.flipButton} 
            onPress={toggleCameraFacing}
          >
            <MaterialIcons name="flip-camera-ios" size={32} color={colors.white} />
          </TouchableOpacity>

          {/* Recording Indicator */}
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.recordingDot} />
              <Text style={styles.recordingText}>Recording...</Text>
            </View>
          )}

          {/* Bottom Controls: X, Capture Button, Check */}
          <View style={styles.bottomControls}>
            <TouchableOpacity style={styles.sideButton} onPress={handleCancel}>
              <MaterialIcons name="close" size={32} color={colors.white} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.captureButton, isRecording && styles.captureButtonRecording]}
              onPress={handleCapture}
            >
              <View style={[styles.captureButtonInner, isRecording && styles.captureButtonInnerRecording]} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.sideButton} onPress={handleConfirm}>
              <MaterialIcons name="check" size={32} color={colors.white} />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>

      {/* Purple Bottom Section with File/Gallery Options */}
      <LinearGradient
        colors={['rgba(81, 43, 121, 1)', 'rgba(149, 79, 223, 1)']}
        style={styles.bottomSection}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleChooseFromFiles}
          >
            <Text style={styles.optionText}>Choose from Files</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.optionButton}
            onPress={handleChooseFromGallery}
          >
            <Text style={styles.optionText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  previewArea: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    paddingHorizontal: 40,
  },
  permissionText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: colors.brandPurple,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 10,
  },
  permissionButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  flipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 25,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 50,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#ff0000',
  },
  recordingText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 40,
    paddingHorizontal: 20,
  },
  sideButton: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 25,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonRecording: {
    backgroundColor: '#ff0000',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.brandPurple,
  },
  captureButtonInnerRecording: {
    width: 30,
    height: 30,
    borderRadius: 4,
    backgroundColor: colors.white,
    borderWidth: 0,
  },
  bottomSection: {
    paddingTop: 20,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  optionsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 12,
  },
  optionButton: {
    flex: 1,
    backgroundColor: colors.white,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  optionText: {
    color: colors.brandPurple,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default UploadScreen;
