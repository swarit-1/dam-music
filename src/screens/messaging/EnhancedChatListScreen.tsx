import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { Conversation, ConversationType } from '../../types/messaging';
import { MessagingStackParamList } from '../../navigation/MessagingNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToUserConversations, searchConversations } from '../../services/conversationService';
import { subscribeToUserPresence } from '../../services/presenceService';

const EnhancedChatListScreen = () => {
  const navigation = useNavigation<StackNavigationProp<MessagingStackParamList>>();
  const { user } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [onlineStatus, setOnlineStatus] = useState<{ [userId: string]: boolean }>({});

  useEffect(() => {
    if (!user) {
      console.log('Skipping Firestore setup - no user');
      setIsLoading(false);
      return;
    }

    console.log('Setting up conversations subscription for user:', user.uid);

    try {
      // Subscribe to user's conversations
      const unsubscribe = subscribeToUserConversations(user.uid, (convs) => {
      setConversations(convs);
      setFilteredConversations(convs);
      setIsLoading(false);

      // Subscribe to presence for all participants
      convs.forEach(conv => {
        conv.participants.forEach(participant => {
          if (participant.userId !== user.uid) {
            subscribeToUserPresence(participant.userId, (presence) => {
              if (presence) {
                setOnlineStatus(prev => ({
                  ...prev,
                  [participant.userId]: presence.isOnline,
                }));
              }
            });
          }
        });
        });
      });

      return () => {
        console.log('Cleaning up conversations subscription');
        unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up conversations subscription:', error);
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(conv => {
        const lowerQuery = searchQuery.toLowerCase();
        
        // Search in conversation title
        if (conv.title?.toLowerCase().includes(lowerQuery)) {
          return true;
        }
        
        // Search in participant names
        return conv.participants.some(p =>
          p.displayName.toLowerCase().includes(lowerQuery)
        );
      });
      setFilteredConversations(filtered);
    }
  }, [searchQuery, conversations]);

  const getConversationName = (conversation: Conversation): string => {
    if (conversation.type === 'project-group' && conversation.title) {
      return conversation.title;
    }

    // For direct conversations, show the other user's name
    const otherParticipant = conversation.participants.find(p => p.userId !== user?.uid);
    return otherParticipant?.displayName || 'Unknown';
  };

  const getConversationAvatar = (conversation: Conversation): string | undefined => {
    if (conversation.avatar) {
      return conversation.avatar;
    }

    // For direct conversations, use other user's avatar
    const otherParticipant = conversation.participants.find(p => p.userId !== user?.uid);
    return otherParticipant?.avatar;
  };

  const getLastMessagePreview = (conversation: Conversation): string => {
    if (!conversation.lastMessage) {
      return 'No messages yet';
    }

    const { type, content, senderName } = conversation.lastMessage;
    const prefix = conversation.type === 'project-group' ? `${senderName}: ` : '';

    switch (type) {
      case 'audio':
        return `${prefix}🎵 Audio file`;
      case 'video':
        return `${prefix}🎥 Video`;
      case 'file':
        return `${prefix}📎 ${content}`;
      case 'voice-note':
        return `${prefix}🎤 Voice message`;
      case 'collaboration-request':
        return `${prefix}🤝 Collaboration request`;
      case 'project-invitation':
        return `${prefix}🎼 Project invitation`;
      default:
        return `${prefix}${content}`;
    }
  };

  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const getUnreadCount = (conversation: Conversation): number => {
    return conversation.unreadCount?.[user?.uid || ''] || 0;
  };

  const isUserOnline = (conversation: Conversation): boolean => {
    if (conversation.type === 'direct') {
      const otherParticipant = conversation.participants.find(p => p.userId !== user?.uid);
      return otherParticipant ? onlineStatus[otherParticipant.userId] || false : false;
    }
    return false;
  };

  const handleConversationPress = (conversation: Conversation) => {
    navigation.navigate('EnhancedChat', {
      conversationId: conversation.id,
      chatName: getConversationName(conversation),
    });
  };

  const renderConversationItem = ({ item }: { item: Conversation }) => {
    const unreadCount = getUnreadCount(item);
    const isOnline = isUserOnline(item);
    const avatar = getConversationAvatar(item);

    return (
      <TouchableOpacity
        style={styles.conversationItem}
        onPress={() => handleConversationPress(item)}
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <MaterialIcons
                name={item.type === 'project-group' ? 'groups' : 'person'}
                size={28}
                color={colors.gray400}
              />
            </View>
          )}
          {isOnline && <View style={styles.onlineIndicator} />}
        </View>

        {/* Content */}
        <View style={styles.conversationContent}>
          <View style={styles.conversationHeader}>
            <Text style={[styles.conversationName, unreadCount > 0 && styles.unreadName]}>
              {getConversationName(item)}
            </Text>
            {item.lastMessage && (
              <Text style={styles.timestamp}>
                {formatTimestamp(item.lastMessage.timestamp)}
              </Text>
            )}
          </View>

          <View style={styles.conversationFooter}>
            <Text
              style={[styles.lastMessage, unreadCount > 0 && styles.unreadMessage]}
              numberOfLines={1}
            >
              {getLastMessagePreview(item)}
            </Text>
            {unreadCount > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
              </View>
            )}
          </View>

          {/* Project badge for group chats */}
          {item.type === 'project-group' && item.projectMetadata && (
            <View style={styles.projectBadge}>
              <MaterialIcons name="music-note" size={12} color={colors.white} />
              <Text style={styles.projectBadgeText}>{item.projectMetadata.genre || 'Project'}</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.brandPurple} />
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
        <Text style={styles.headerTitle}>Messages</Text>
        <TouchableOpacity style={styles.newChatButton}>
          <MaterialIcons name="edit" size={24} color={colors.black} />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color={colors.gray500} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search conversations..."
          placeholderTextColor={colors.gray400}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <MaterialIcons name="close" size={20} color={colors.gray500} />
          </TouchableOpacity>
        )}
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="chat-bubble-outline" size={64} color={colors.gray300} />
            <Text style={styles.emptyText}>No conversations yet</Text>
            <Text style={styles.emptySubtext}>
              {searchQuery ? 'Try a different search' : 'Start a new conversation to get started'}
            </Text>
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
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.black,
  },
  newChatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.black,
  },
  listContent: {
    paddingBottom: 16,
  },
  conversationItem: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 12,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: colors.white,
  },
  conversationContent: {
    flex: 1,
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  conversationName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.black,
    flex: 1,
  },
  unreadName: {
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 12,
    color: colors.gray500,
    marginLeft: 8,
  },
  conversationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    fontSize: 14,
    color: colors.gray600,
    flex: 1,
  },
  unreadMessage: {
    color: colors.black,
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: colors.brandPurple,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    marginLeft: 8,
  },
  unreadCount: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
  projectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.brandPurple,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 6,
    gap: 4,
  },
  projectBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.white,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.black,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.gray600,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default EnhancedChatListScreen;

