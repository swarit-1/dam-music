import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

export default function ProfileCustomizationScreen({ navigation }: any) {
  const [selectedSoftware, setSelectedSoftware] = useState('');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const skills = [
    'Mixing',
    'Sound Design',
    'Composing',
    'Drummer',
    'Guitarist',
    'Violinist',
    'Mixing',
    'Pianist',
  ];

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleNext = () => {
    // Save profile data and navigate to genres screen
    navigation.navigate('ProfileGenres');
  };

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
          <View style={styles.progressLineActive} />
          <View style={styles.progressLine} />
          <View style={[styles.progressLine, { marginRight: 0 }]} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Customize Your Profile</Text>

        {/* Software Section */}
        {renderDropdown(
          'Software',
          'Select your preferred software application',
          selectedSoftware,
          () => {
            // TODO: Open software picker
            console.log('Open software picker');
          }
        )}

        {/* Skill Level Section */}
        {renderDropdown(
          'Skill Level',
          'Select your level of experience',
          selectedSkillLevel,
          () => {
            // TODO: Open skill level picker
            console.log('Open skill level picker');
          }
        )}

        {/* Skills Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <Text style={styles.sectionSubtitle}>Select all that apply</Text>
          <View style={styles.skillsGrid}>
            {skills.map((skill, index) => (
              <TouchableOpacity
                key={index}
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
      </ScrollView>

      {/* Next Button */}
      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next</Text>
        <MaterialIcons name="arrow-forward" size={20} color="#ffffff" style={styles.nextButtonIcon} />
      </TouchableOpacity>
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
  title: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 40,
    fontFamily: 'serif',
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
    fontFamily: 'serif',
  },
  sectionSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginBottom: 16,
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
  },
  skillButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
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
  },
  nextButtonIcon: {
    marginLeft: 4,
  },
});

