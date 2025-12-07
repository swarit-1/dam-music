import React from 'react';
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

const UploadScreen = () => {
  const handleChooseFromFiles = () => {
    Alert.alert('Choose from Files', 'File picker would open here in production');
  };

  const handleChooseFromGallery = () => {
    Alert.alert('Choose from Gallery', 'Gallery picker would open here in production');
  };

  const handleCapture = () => {
    Alert.alert('Capture', 'Camera/recording would start here in production');
  };

  const handleCancel = () => {
    Alert.alert('Cancel', 'Would navigate back');
  };

  const handleConfirm = () => {
    Alert.alert('Confirm', 'Would save/upload the recording');
  };

  return (
    <View style={styles.container}>
      {/* Camera/Preview Area with Controls */}
      <View style={styles.previewArea}>
        <Text style={styles.previewText}>Camera Preview</Text>

        {/* Bottom Controls: X, Capture Button, Check */}
        <View style={styles.bottomControls}>
          <TouchableOpacity style={styles.sideButton} onPress={handleCancel}>
            <MaterialIcons name="close" size={32} color={colors.white} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.captureButton}
            onPress={handleCapture}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.sideButton} onPress={handleConfirm}>
            <MaterialIcons name="check" size={32} color={colors.white} />
          </TouchableOpacity>
        </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.black,
    position: 'relative',
  },
  previewText: {
    color: colors.gray500,
    fontSize: 18,
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
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.white,
    borderWidth: 3,
    borderColor: colors.brandPurple,
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
