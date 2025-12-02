import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfile } from '../../services/authService';

export default function ProfileVibeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

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

  const handleFinish = async () => {
    if (!user) {
      Alert.alert('Error', 'User not found. Please sign in again.');
      return;
    }

    if (selectedSkills.length === 0 && selectedGenres.length === 0 && selectedRoles.length === 0) {
      Alert.alert('Error', 'Please select at least one preference.');
      return;
    }

    // Prevent multiple submissions
    if (loading) return;

    setLoading(true);
    try {
      // Save vibe preferences to Firestore
      await updateUserProfile(user.uid, {
        vibeSkills: selectedSkills,
        vibeGenres: selectedGenres,
        vibeRoles: selectedRoles,
      });

      // Profile is now complete - AppNavigator will detect this and navigate to MainTabs
      Alert.alert('Success', 'Profile created successfully!', [
        {
          text: 'OK',
          onPress: () => {
            setLoading(false);
          }
        }
      ]);

      // Also reset after 3 seconds in case user doesn't click OK
      setTimeout(() => {
        setLoading(false);
      }, 3000);
    } catch (error: any) {
      console.error('Profile save error:', error);
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
      {items.map((item) => (
        <TouchableOpacity
          key={item}
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
          <View style={[styles.progressLine, { marginRight: 0 }]} />
        </View>

        {/* Title */}
        <Text style={styles.title}>Who's Your Vibe?</Text>

        {/* Skills Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills</Text>
          <Text style={styles.sectionQuestion}>
            What are you looking for?
          </Text>
          {renderButtonGrid(skills, selectedSkills, toggleSkill)}
        </View>

        {/* Genre Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Genre</Text>
          <Text style={styles.sectionQuestion}>
            What are you looking for?
          </Text>
          {renderButtonGrid(genres, selectedGenres, toggleGenre)}
        </View>

        {/* Roles Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Roles</Text>
          <Text style={styles.sectionQuestion}>
            What are you looking for?
          </Text>
          {renderButtonGrid(roles, selectedRoles, toggleRole)}
        </View>
      </ScrollView>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={[styles.backButton, loading && styles.buttonDisabled]} 
          onPress={handleBack} 
          disabled={loading}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <MaterialIcons name="arrow-back" size={20} color="#ffffff" style={styles.navIcon} />
          <Text style={styles.navButtonText}>Back</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.finishButton, loading && styles.buttonDisabled]} 
          onPress={handleFinish} 
          disabled={loading}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" size="small" />
          ) : (
            <>
              <Text style={styles.navButtonText}>Finish</Text>
              <MaterialIcons name="check" size={20} color="#ffffff" style={styles.navIcon} />
            </>
          )}
        </TouchableOpacity>
      </View>
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
  sectionQuestion: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    marginBottom: 16,
    fontFamily: 'LeagueSpartan',
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
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  gridButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'LeagueSpartan',
  },
  gridButtonTextSelected: {
    color: '#ffffff',
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
  finishButton: {
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
    fontFamily: 'LeagueSpartan',
  },
  navIcon: {
    marginHorizontal: 4,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
