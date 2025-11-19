import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { ProjectRole, ProjectMetadata, ConversationParticipant } from '../../types/messaging';
import { MessagingStackParamList } from '../../navigation/MessagingNavigator';
import { AuthContext } from '../../contexts/AuthContext';
import { createConversation } from '../../services/conversationService';

const GENRES = ['Pop', 'Hip-Hop', 'R&B', 'Rock', 'Electronic', 'Jazz', 'Country', 'Lo-Fi', 'Other'];
const ROLES: ProjectRole[] = ['producer', 'vocalist', 'engineer', 'guitarist', 'drummer', 'bassist', 'keyboardist'];

const CreateProjectChatScreen = () => {
  const navigation = useNavigation<StackNavigationProp<MessagingStackParamList>>();
  const { user } = useContext(AuthContext);

  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [bpm, setBpm] = useState('');
  const [musicalKey, setMusicalKey] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // In a real app, you would have a user picker here
  // For now, we'll just create a group with the current user
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);

  const handleCreate = async () => {
    if (!projectTitle.trim()) {
      Alert.alert('Error', 'Please enter a project title');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'You must be logged in');
      return;
    }

    setIsCreating(true);

    try {
      const participants: ConversationParticipant[] = [
        {
          userId: user.uid,
          displayName: user.displayName || 'User',
          avatar: user.photoURL || undefined,
          role: 'owner',
          joinedAt: new Date(),
          isAdmin: true,
        },
      ];

      // Add other participants (in a real app, this would come from a user selector)
      // For now, just the current user

      const projectMetadata: ProjectMetadata = {
        title: projectTitle,
        description: projectDescription || undefined,
        genre: selectedGenre || undefined,
        bpm: bpm ? parseInt(bpm) : undefined,
        key: musicalKey || undefined,
        members: participants.map(p => ({
          userId: p.userId,
          displayName: p.displayName,
          role: p.role || 'collaborator',
          avatar: p.avatar,
        })),
        deadlines: [],
        milestones: [],
        status: 'active',
      };

      const conversationId = await createConversation(
        user.uid,
        participants,
        'project-group',
        {
          title: projectTitle,
          description: projectDescription,
          projectMetadata,
        }
      );

      Alert.alert('Success', 'Project chat created!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
            navigation.navigate('EnhancedChat', {
              conversationId,
              chatName: projectTitle,
            });
          },
        },
      ]);
    } catch (error) {
      console.error('Error creating project chat:', error);
      Alert.alert('Error', 'Failed to create project chat');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="close" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Project Chat</Text>
        <TouchableOpacity onPress={handleCreate} disabled={isCreating}>
          {isCreating ? (
            <ActivityIndicator size="small" color={colors.brandPurple} />
          ) : (
            <Text style={styles.createButton}>Create</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Project Title */}
        <View style={styles.section}>
          <Text style={styles.label}>Project Title *</Text>
          <TextInput
            style={styles.input}
            value={projectTitle}
            onChangeText={setProjectTitle}
            placeholder="Enter project name..."
            maxLength={50}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={projectDescription}
            onChangeText={setProjectDescription}
            placeholder="What's this project about?"
            multiline
            numberOfLines={4}
            maxLength={200}
          />
        </View>

        {/* Genre */}
        <View style={styles.section}>
          <Text style={styles.label}>Genre</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genreScroll}>
            {GENRES.map((genre) => (
              <TouchableOpacity
                key={genre}
                style={[
                  styles.genreChip,
                  selectedGenre === genre && styles.genreChipSelected,
                ]}
                onPress={() => setSelectedGenre(genre === selectedGenre ? '' : genre)}
              >
                <Text
                  style={[
                    styles.genreChipText,
                    selectedGenre === genre && styles.genreChipTextSelected,
                  ]}
                >
                  {genre}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* BPM and Key */}
        <View style={styles.row}>
          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>BPM</Text>
            <TextInput
              style={styles.input}
              value={bpm}
              onChangeText={setBpm}
              placeholder="120"
              keyboardType="number-pad"
              maxLength={3}
            />
          </View>

          <View style={[styles.section, styles.halfWidth]}>
            <Text style={styles.label}>Key</Text>
            <TextInput
              style={styles.input}
              value={musicalKey}
              onChangeText={setMusicalKey}
              placeholder="C Major"
              maxLength={10}
            />
          </View>
        </View>

        {/* Info */}
        <View style={styles.infoBox}>
          <MaterialIcons name="info-outline" size={20} color={colors.brandPurple} />
          <Text style={styles.infoText}>
            You can add collaborators and customize roles after creating the project chat.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.black,
  },
  createButton: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.brandPurple,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray700,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.gray50,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.black,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  genreScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  genreChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.gray100,
    marginRight: 8,
  },
  genreChipSelected: {
    backgroundColor: colors.brandPurple,
  },
  genreChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.gray700,
  },
  genreChipTextSelected: {
    color: colors.white,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(149, 79, 223, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: colors.gray700,
    lineHeight: 18,
  },
});

export default CreateProjectChatScreen;

