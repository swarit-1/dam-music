import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile } from '../../services/authService';

export default function ProfileGenresScreen({ navigation }: any) {
  const { user } = useAuth();
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedCollaboration, setSelectedCollaboration] = useState('');
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const genres = [
    'Pop',
    'Jazz',
    'Rock',
    'Country',
    'R&B/Soul',
    'Hip-Hop',
    'Electronic',
    'Classical',
  ];

  const roles = [
    'Producer',
    'Instrumentalist',
    'Song Writer',
    'Bassist',
    'Vocalist',
    'Soloist',
    'Rapper',
    'Drummer',
  ];

  const collaborationOptions = [
    'In-Person',
    'Online',
    'Hybrid',
    'Both',
  ];

  const toggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter((g) => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const toggleRole = (role: string) => {
    if (selectedRoles.includes(role)) {
      setSelectedRoles(selectedRoles.filter((r) => r !== role));
    } else {
      setSelectedRoles([...selectedRoles, role]);
    }
  };

  const handleNext = async () => {
    if (!user) {
      Alert.alert('Error', 'User not found. Please sign in again.');
      return;
    }

    if (selectedGenres.length === 0 || selectedRoles.length === 0) {
      Alert.alert('Error', 'Please select at least one genre and one role.');
      return;
    }

    setLoading(true);
    try {
      // Save preferences to Firestore
      await updateUserProfile(user.uid, {
        genre: selectedGenres,
        role: selectedRoles,
        collaboration: selectedCollaboration || 'Both',
      });

      // Profile is now complete - AppNavigator will detect this and navigate to MainTabs
      // Keep loading state to show we're processing
      // The periodic check in AppNavigator will detect the updated profile within 2 seconds
    } catch (error: any) {
      Alert.alert('Error', `Failed to save profile: ${error.message}`);
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const renderButtonGrid = (
    items: string[],
    selectedItems: string[],
    onToggle: (item: string) => void
  ) => (
    <View style={styles.buttonGrid}>
      {items.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.gridButton,
            selectedItems.includes(item) && styles.gridButtonSelected,
          ]}
          onPress={() => onToggle(item)}
        >
          <Text
            style={[
              styles.gridButtonText,
              selectedItems.includes(item) && styles.gridButtonTextSelected,
            ]}
          >
            {item}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPickerModal = (
    visible: boolean,
    onClose: () => void,
    title: string,
    options: string[],
    selectedValue: string,
    onSelect: (value: string) => void
  ) => (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
              <MaterialIcons name="close" size={24} color="#000000" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalOptions}>
            {options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.modalOption,
                  selectedValue === option && styles.modalOptionSelected,
                ]}
                onPress={() => {
                  onSelect(option);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.modalOptionText,
                    selectedValue === option && styles.modalOptionTextSelected,
                  ]}
                >
                  {option}
                </Text>
                {selectedValue === option && (
                  <MaterialIcons name="check" size={24} color="#ffffff" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  return (
    <LinearGradient
      colors={['rgba(80, 42, 120, 1)', 'rgba(157, 89, 226, 1)']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressLineActive} />
          <View style={styles.progressLineActive} />
          <View style={[styles.progressLine, { marginRight: 0 }]} />
        </View>

        {/* Genre Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Genre</Text>
          <Text style={styles.sectionQuestion}>
            What genres would you be interested in working in?
          </Text>
          {renderButtonGrid(genres, selectedGenres, toggleGenre)}
        </View>

        {/* Roles Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Roles</Text>
          <Text style={styles.sectionQuestion}>
            What do you identify with the most?
          </Text>
          {renderButtonGrid(roles, selectedRoles, toggleRole)}
        </View>

        {/* Collaboration Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Collaboration</Text>
          <Text style={styles.sectionQuestion}>
            Select your preferred mode(s) of collaboration
          </Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setShowCollaborationModal(true)}
          >
            <Text style={[styles.dropdownText, !selectedCollaboration && styles.dropdownPlaceholder]}>
              {selectedCollaboration || 'Select...'}
            </Text>
            <MaterialIcons name="keyboard-arrow-down" size={24} color="#000000" />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} disabled={loading}>
          <MaterialIcons name="arrow-back" size={20} color="#ffffff" style={styles.navIcon} />
          <Text style={styles.navButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Text style={styles.navButtonText}>Next</Text>
              <MaterialIcons name="arrow-forward" size={20} color="#ffffff" style={styles.navIcon} />
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Collaboration Picker Modal */}
      {renderPickerModal(
        showCollaborationModal,
        () => setShowCollaborationModal(false),
        'Select Collaboration Mode',
        collaborationOptions,
        selectedCollaboration,
        setSelectedCollaboration
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 100,
  },
  progressContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 30,
  },
  progressLine: {
    height: 4,
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 2,
    marginRight: 10,
  },
  progressLineActive: {
    height: 4,
    flex: 1,
    backgroundColor: 'rgba(50, 25, 75, 1)',
    borderRadius: 2,
    marginRight: 10,
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'serif',
  },
  sectionQuestion: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginBottom: 16,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  gridButton: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    margin: 5,
    minWidth: '45%',
    alignItems: 'center',
  },
  gridButtonSelected: {
    backgroundColor: 'rgba(80, 42, 120, 0.3)',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  gridButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
  },
  gridButtonTextSelected: {
    color: '#ffffff',
  },
  dropdown: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    height: 50,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownText: {
    color: '#000000',
    fontSize: 16,
    flex: 1,
  },
  dropdownPlaceholder: {
    color: 'rgba(0, 0, 0, 0.5)',
  },
  navigationContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  navButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  navIcon: {
    marginHorizontal: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalOptions: {
    maxHeight: 400,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalOptionSelected: {
    backgroundColor: 'rgba(80, 42, 120, 0.1)',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#000000',
  },
  modalOptionTextSelected: {
    color: 'rgba(80, 42, 120, 1)',
    fontWeight: '600',
  },
});

