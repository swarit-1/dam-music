import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { Conversation } from '../../types/messaging';
import { MessagingStackParamList } from '../../navigation/MessagingNavigator';
import { mockConversations } from '../../data/mockMessagesData';

const EnhancedChatListScreen = () => {
  const navigation = useNavigation<StackNavigationProp<MessagingStackParamList>>();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // DEMO MODE: Use mock data instead of Firebase
    console.log('[DEMO MODE] Using mock conversations data');
    setConversations(mockConversations);
    setIsLoading(false);
  }, []);

  const getConversationName = (conversation: Conversation): string => {
    // For direct conversations, show the other user's name
    const otherParticipant = conversation.participants.find(p => p.userId !== 'currentUser');
    return otherParticipant?.displayName || 'Unknown';
  };

  const formatTimestamp = (date: Date): string => {
    // Format as "00:00" for demo
    return '00:00';
  };

  const handleConversationPress = (conversation: Conversation) => {
    navigation.navigate('EnhancedChat', {
      conversationId: conversation.id,
      chatName: getConversationName(conversation),
    });
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleConversationPress(item)}
      >
        {/* Avatar */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getConversationName(item)
              .split(' ')
              .map((n) => n[0])
              .slice(0, 2)
              .join('')
              .toUpperCase()}
          </Text>
        </View>

        {/* Content */}
        <View style={styles.conversationContent}>
          <Text style={styles.conversationName}>
            {getConversationName(item)}
          </Text>
          <View style={styles.messageRow}>
            <MaterialIcons name="mic" size={16} color={colors.green} />
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage?.content || 'No messages yet'}
            </Text>
          </View>
        </View>

        {/* Timestamp */}
        <Text style={styles.timestamp}>
          {item.lastMessage && formatTimestamp(item.lastMessage.timestamp)}
        </Text>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.white} />
      </View>
    );
  }

  return (
    <LinearGradient
      colors={['rgba(81, 43, 121, 1)', 'rgba(149, 79, 223, 1)']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Messages</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Conversations List */}
      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="chat-bubble-outline" size={64} color={colors.white} />
            <Text style={styles.emptyText}>No conversations yet</Text>
          </View>
        }
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.brandPurple,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    letterSpacing: 0.5,
  },
  placeholder: {
    width: 40,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  conversationItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
    backgroundColor: colors.gray200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: colors.brandPurple,
    fontWeight: 'bold',
    fontSize: 16,
  },
  conversationContent: {
    flex: 1,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    marginBottom: 4,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: colors.gray600,
    flex: 1,
  },
  timestamp: {
    fontSize: 12,
    color: colors.gray500,
    marginLeft: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.white,
    marginTop: 16,
  },
});

export default EnhancedChatListScreen;
