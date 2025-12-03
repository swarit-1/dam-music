import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';

export default function ProfileCustomizationScreen({ navigation }: any) {
  const route = useRoute();
  const fromDevSkip = (route.params as any)?.fromDevSkip || false;
  const [selectedSoftware, setSelectedSoftware] = useState('');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedCollaboration, setSelectedCollaboration] = useState('');
  const [showSoftwareModal, setShowSoftwareModal] = useState(false);
  const [showSkillLevelModal, setShowSkillLevelModal] = useState(false);
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);

  // Animation values
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const modalTranslateY = useRef(new Animated.Value(400)).current;

  // Handle modal animations
  useEffect(() => {
    if (showSoftwareModal || showSkillLevelModal || showCollaborationModal) {
      // Reset animation values to initial state before animating in
      overlayOpacity.setValue(0);
      modalTranslateY.setValue(400);
      
      // Animate in
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(modalTranslateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(modalTranslateY, {
          toValue: 400,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showSoftwareModal, showSkillLevelModal, showCollaborationModal]);

  const softwareOptions = [
    'Ableton Live',
    'Pro Tools',
    'Logic Pro',
    'FL Studio',
    'Cubase',
    'Studio One',
    'Reaper',
    'GarageBand',
  ];

  const skillLevelOptions = [
    'Beginner',
    'Intermediate',
    'Advanced',
    'Professional',
  ];

  const skills = [
    'Mixing',
    'Sound Design',
    'Composing',
    'Drummer',
    'Guitarist',
    'Violinist',
    'Pianist',
    'Producer',
  ];

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
    'Both',
  ];

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

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

  const handleNext = () => {
    // Navigate to "Who's Your Vibe?" screen
    navigation.navigate('ProfileVibe');
  };

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
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.modalOverlay, { opacity: overlayOpacity }]}>
        <TouchableOpacity 
          style={styles.modalOverlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        >
          <Animated.View 
            style={[
              styles.modalContent, 
              { transform: [{ translateY: modalTranslateY }] }
            ]}
            onStartShouldSetResponder={() => true}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                <MaterialIcons name="close" size={24} color="#000000" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalOptions}>
              {options.map((option) => (
                <TouchableOpacity
                  key={option}
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
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );

  const renderDropdown = (
    label: string,
    subtitle: string,
    value: string,
    onPress: () => void
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{label}</Text>
      <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      <TouchableOpacity style={styles.dropdown} onPress={onPress}>
        <Text style={[styles.dropdownText, !value && styles.dropdownPlaceholder]}>
          {value || 'Select...'}
        </Text>
        <MaterialIcons name="keyboard-arrow-down" size={24} color="#000000" />
      </TouchableOpacity>
    </View>
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
          <View style={styles.progressLine} />
          <View style={styles.progressLine} />
          <View style={[styles.progressLine, styles.progressLineInactive, { marginRight: 0 }]} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Customize Your Profile</Text>

        {/* Software Section */}
        {renderDropdown(
          'Software',
          'Select your preferred software application',
          selectedSoftware,
          () => setShowSoftwareModal(true)
        )}

        {/* Skill Level Section */}
        {renderDropdown(
          'Skill Level',
          'Select your level of experience',
          selectedSkillLevel,
          () => setShowSkillLevelModal(true)
        )}

        {/* Skills Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>
          <View style={styles.skillsGrid}>
            {skills.map((skill) => (
              <TouchableOpacity
                key={skill}
                style={[
                  styles.skillButton,
                  selectedSkills.includes(skill) && styles.skillButtonSelected,
                ]}
                onPress={() => toggleSkill(skill)}
              >
                <Text
                  style={[
                    styles.skillButtonText,
                    selectedSkills.includes(skill) && styles.skillButtonTextSelected,
                  ]}
                >
                  {skill}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Genre Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Genre</Text>
          <Text style={styles.sectionSubtitle}>
            What genres would you be interested in working in?
          </Text>
          <View style={styles.skillsGrid}>
            {genres.map((genre) => (
              <TouchableOpacity
                key={genre}
                style={[
                  styles.skillButton,
                  selectedGenres.includes(genre) && styles.skillButtonSelected,
                ]}
                onPress={() => toggleGenre(genre)}
              >
                <Text
                  style={[
                    styles.skillButtonText,
                    selectedGenres.includes(genre) && styles.skillButtonTextSelected,
                  ]}
                >
                  {genre}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Roles Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Roles</Text>
          <Text style={styles.sectionSubtitle}>
            What do you identify with the most?
          </Text>
          <View style={styles.skillsGrid}>
            {roles.map((role) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.skillButton,
                  selectedRoles.includes(role) && styles.skillButtonSelected,
                ]}
                onPress={() => toggleRole(role)}
              >
                <Text
                  style={[
                    styles.skillButtonText,
                    selectedRoles.includes(role) && styles.skillButtonTextSelected,
                  ]}
                >
                  {role}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Collaboration Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Collaboration</Text>
          <Text style={styles.sectionSubtitle}>
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
      {fromDevSkip && (
        <TouchableOpacity style={styles.devBackButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={20} color="#ffffff" style={styles.devBackButtonIcon} />
          <Text style={styles.devBackButtonText}>Dev Back</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
        <MaterialIcons name="arrow-forward" size={20} color="#ffffff" style={styles.nextButtonIcon} />
      </TouchableOpacity>

      {/* Software Picker Modal */}
      {renderPickerModal(
        showSoftwareModal,
        () => setShowSoftwareModal(false),
        'Select Software',
        softwareOptions,
        selectedSoftware,
        setSelectedSoftware
      )}

      {/* Skill Level Picker Modal */}
      {renderPickerModal(
        showSkillLevelModal,
        () => setShowSkillLevelModal(false),
        'Select Skill Level',
        skillLevelOptions,
        selectedSkillLevel,
        setSelectedSkillLevel
      )}

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
  progressLineInactive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    fontFamily: 'KdamThmorPro',
    textAlign: 'center',
  },
  section: {
    marginBottom: 40,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    fontFamily: 'KdamThmorPro',
  },
  sectionSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginBottom: 16,
    fontFamily: 'LeagueSpartan',
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
    fontFamily: 'LeagueSpartan',
  },
  dropdownPlaceholder: {
    color: 'rgba(0, 0, 0, 0.5)',
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  skillButton: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
    margin: 5,
    minWidth: '45%',
    alignItems: 'center',
  },
  skillButtonSelected: {
    backgroundColor: 'rgba(80, 42, 120, 0.3)',
    borderWidth: 2,
    borderColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  skillButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'LeagueSpartan',
  },
  skillButtonTextSelected: {
    color: '#ffffff',
  },
  nextButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
    fontFamily: 'LeagueSpartan',
  },
  nextButtonIcon: {
    marginLeft: 4,
  },
  devBackButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  devBackButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 6,
    fontFamily: 'LeagueSpartan',
  },
  devBackButtonIcon: {
    marginRight: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalOverlayTouchable: {
    flex: 1,
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
    fontFamily: 'LeagueSpartan',
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
    fontFamily: 'LeagueSpartan',
  },
  modalOptionTextSelected: {
    color: 'rgba(80, 42, 120, 1)',
    fontWeight: '600',
  },
});

