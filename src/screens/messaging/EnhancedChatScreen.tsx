import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { Message, MessageType, TypingIndicator as TypingIndicatorType } from '../../types/messaging';
import { MessagingStackParamList } from '../../navigation/MessagingNavigator';
import { useAuth } from '../../contexts/AuthContext';

// Message components
import AudioMessage from '../../components/messaging/AudioMessage';
import FileMessage from '../../components/messaging/FileMessage';
import VideoMessage from '../../components/messaging/VideoMessage';
import VoiceNoteMessage from '../../components/messaging/VoiceNoteMessage';
import CollaborationRequestMessage from '../../components/messaging/CollaborationRequestMessage';
import MessageReactions from '../../components/messaging/MessageReactions';
import TypingIndicator from '../../components/messaging/TypingIndicator';

// Services
import {
  sendMessage,
  subscribeToMessages,
  markMessageAsRead,
  markAllMessagesAsRead,
  addReaction,
  updateCollaborationRequestStatus,
} from '../../services/messageService';
import {
  pickAudioFile,
  pickDocumentFile,
  pickVideoFile,
  uploadFile,
  getAudioMetadata,
  getFileMetadata,
  detectFileType,
  generateWaveformData,
} from '../../services/fileUploadService';
import { startTyping, stopTyping, subscribeToTypingIndicators } from '../../services/presenceService';
import { markConversationAsRead } from '../../services/conversationService';

type EnhancedChatScreenRouteProp = RouteProp<MessagingStackParamList, 'EnhancedChat'>;

const EnhancedChatScreen = () => {
  const route = useRoute<EnhancedChatScreenRouteProp>();
  const navigation = useNavigation<StackNavigationProp<MessagingStackParamList>>();
  const { user } = useAuth();
  const { conversationId, chatName } = route.params;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const [typingUsers, setTypingUsers] = useState<TypingIndicatorType[]>([]);

  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!user || !conversationId) return;

    // Subscribe to messages
    const unsubscribe = subscribeToMessages(conversationId, (newMessages) => {
      setMessages(newMessages.reverse()); // Reverse for FlatList inverted
      
      // Mark messages as read
      newMessages.forEach(msg => {
        if (msg.senderId !== user.uid && !msg.readBy?.[user.uid]) {
          markMessageAsRead(msg.id, user.uid);
        }
      });
    });

    // Subscribe to typing indicators
    const unsubscribeTyping = subscribeToTypingIndicators(
      conversationId,
      user.uid,
      setTypingUsers
    );

    // Mark conversation as read
    markConversationAsRead(conversationId, user.uid);

    return () => {
      unsubscribe();
      unsubscribeTyping();
      if (user) {
        stopTyping(conversationId, user.uid);
      }
    };
  }, [conversationId, user]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !user) return;

    const messageText = inputText.trim();
    setInputText('');

    try {
      await sendMessage(
        conversationId || '',
        user?.uid || '',
        user.displayName || 'User',
        messageText,
        'text',
        { senderAvatar: user.photoURL || undefined }
      );

      stopTyping(conversationId, user.uid);
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleInputChange = (text: string) => {
    setInputText(text);

    if (!user) return;

    // Start typing indicator
    if (text.length > 0) {
      startTyping(conversationId, user.uid, user.displayName || 'User');

      // Reset timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(conversationId, user.uid);
      }, 2000);
    } else {
      stopTyping(conversationId, user.uid);
    }
  };

  const handleAttachAudio = async () => {
    setShowAttachmentMenu(false);
    
    try {
      const file = await pickAudioFile();
      if (!file || !user) return;

      setUploading(true);
      
      // Upload file
      const audioUrl = await uploadFile(
        file.uri,
        file.name,
        'audio',
        conversationId,
        setUploadProgress
      );

      // Get metadata
      const metadata = await getAudioMetadata(file.uri, file.name, file.size);
      metadata.waveformData = await generateWaveformData(file.uri);

      // Send message
      await sendMessage(
        conversationId,
        user.uid,
        user.displayName || 'User',
        file.name,
        'audio',
        {
          senderAvatar: user.photoURL || undefined,
          audioMetadata: metadata,
        }
      );

      setUploading(false);
      setUploadProgress(0);
    } catch (error) {
      console.error('Error attaching audio:', error);
      Alert.alert('Error', 'Failed to attach audio file');
      setUploading(false);
    }
  };

  const handleAttachFile = async () => {
    setShowAttachmentMenu(false);
    
    try {
      const file = await pickDocumentFile();
      if (!file || !user) return;

      setUploading(true);
      
      const fileType = detectFileType(file.name, file.mimeType);
      const fileUrl = await uploadFile(
        file.uri,
        file.name,
        fileType,
        conversationId,
        setUploadProgress
      );

      const metadata = getFileMetadata(file.name, file.size, file.mimeType, fileUrl);

      await sendMessage(
        conversationId,
        user.uid,
        user.displayName || 'User',
        file.name,
        'file',
        {
          senderAvatar: user.photoURL || undefined,
          fileMetadata: metadata,
        }
      );

      setUploading(false);
      setUploadProgress(0);
    } catch (error) {
      console.error('Error attaching file:', error);
      Alert.alert('Error', 'Failed to attach file');
      setUploading(false);
    }
  };

  const handleAttachVideo = async () => {
    setShowAttachmentMenu(false);
    
    try {
      const file = await pickVideoFile();
      if (!file || !user) return;

      setUploading(true);
      
      const videoUrl = await uploadFile(
        file.uri,
        file.name,
        'video',
        conversationId,
        setUploadProgress
      );

      await sendMessage(
        conversationId,
        user.uid,
        user.displayName || 'User',
        file.name,
        'video',
        {
          senderAvatar: user.photoURL || undefined,
          videoMetadata: {
            duration: 0,
            format: 'mp4',
            size: file.size,
            url: videoUrl,
          },
        }
      );

      setUploading(false);
      setUploadProgress(0);
    } catch (error) {
      console.error('Error attaching video:', error);
      Alert.alert('Error', 'Failed to attach video');
      setUploading(false);
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;
    
    try {
      await addReaction(messageId, user.uid, user.displayName || 'User', emoji);
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const handleCollaborationResponse = async (messageId: string, accepted: boolean) => {
    try {
      await updateCollaborationRequestStatus(messageId, accepted ? 'accepted' : 'declined');
    } catch (error) {
      console.error('Error updating collaboration request:', error);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = user?.uid === item.senderId;

    let messageContent;

    switch (item.type) {
      case 'audio':
        messageContent = item.audioMetadata && (
          <AudioMessage
            audioUrl={item.audioMetadata.url || ''}
            metadata={item.audioMetadata}
            isOwnMessage={isOwnMessage}
          />
        );
        break;

      case 'video':
        messageContent = item.videoMetadata && (
          <VideoMessage
            videoUrl={item.videoMetadata.url}
            metadata={item.videoMetadata}
            isOwnMessage={isOwnMessage}
          />
        );
        break;

      case 'file':
        messageContent = item.fileMetadata && (
          <FileMessage
            fileMetadata={item.fileMetadata}
            isOwnMessage={isOwnMessage}
          />
        );
        break;

      case 'voice-note':
        messageContent = item.audioMetadata && (
          <VoiceNoteMessage
            audioUrl={item.audioMetadata.url || ''}
            duration={item.audioMetadata.duration}
            isOwnMessage={isOwnMessage}
          />
        );
        break;

      case 'collaboration-request':
        messageContent = item.collaborationRequest && (
          <CollaborationRequestMessage
            data={item.collaborationRequest}
            isOwnMessage={isOwnMessage}
            onAccept={() => handleCollaborationResponse(item.id, true)}
            onDecline={() => handleCollaborationResponse(item.id, false)}
          />
        );
        break;

      default:
        messageContent = (
          <View style={[styles.textMessageBubble, isOwnMessage && styles.ownMessageBubble]}>
            <Text style={[styles.messageText, isOwnMessage && styles.ownMessageText]}>
              {item.content}
            </Text>
          </View>
        );
    }

    return (
      <View style={[styles.messageContainer, isOwnMessage && styles.ownMessageContainer]}>
        {!isOwnMessage && (
          <Text style={styles.senderName}>{item.senderName}</Text>
        )}
        
        {messageContent}

        {/* Timestamp and Status */}
        <View style={styles.messageFooter}>
          <Text style={styles.timestamp}>
            {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {isOwnMessage && (
            <MaterialIcons
              name={item.status === 'read' ? 'done-all' : 'done'}
              size={16}
              color={item.status === 'read' ? colors.brandPurple : colors.gray400}
            />
          )}
        </View>

        {/* Reactions */}
        {item.reactions && item.reactions.length > 0 && user && (
          <MessageReactions
            reactions={item.reactions}
            onReactionPress={(emoji) => handleReaction(item.id, emoji)}
            currentUserId={user.uid}
          />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{chatName}</Text>
        <TouchableOpacity>
          <MaterialIcons name="more-vert" size={24} color={colors.black} />
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          inverted
          onContentSizeChange={() => flatListRef.current?.scrollToOffset({ offset: 0, animated: true })}
        />

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <TypingIndicator
            userNames={typingUsers.map(t => t.userName)}
            showNames
          />
        )}

        {/* Upload Progress */}
        {uploading && (
          <View style={styles.uploadProgress}>
            <ActivityIndicator size="small" color={colors.brandPurple} />
            <Text style={styles.uploadText}>Uploading... {Math.round(uploadProgress)}%</Text>
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <TouchableOpacity
            style={styles.attachButton}
            onPress={() => setShowAttachmentMenu(true)}
          >
            <MaterialIcons name="attach-file" size={24} color={colors.gray600} />
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={handleInputChange}
            placeholder="Type a message..."
            multiline
            maxLength={1000}
          />

          <TouchableOpacity
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <MaterialIcons
              name="send"
              size={20}
              color={inputText.trim() ? colors.white : colors.gray400}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Attachment Menu */}
      <Modal
        visible={showAttachmentMenu}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAttachmentMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAttachmentMenu(false)}
        >
          <View style={styles.attachmentMenu}>
            <TouchableOpacity style={styles.attachmentOption} onPress={handleAttachAudio}>
              <View style={[styles.attachmentIcon, { backgroundColor: '#FF6B6B' }]}>
                <MaterialIcons name="audiotrack" size={24} color={colors.white} />
              </View>
              <Text style={styles.attachmentLabel}>Audio</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.attachmentOption} onPress={handleAttachVideo}>
              <View style={[styles.attachmentIcon, { backgroundColor: '#4ECDC4' }]}>
                <MaterialIcons name="videocam" size={24} color={colors.white} />
              </View>
              <Text style={styles.attachmentLabel}>Video</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.attachmentOption} onPress={handleAttachFile}>
              <View style={[styles.attachmentIcon, { backgroundColor: '#95A5A6' }]}>
                <MaterialIcons name="insert-drive-file" size={24} color={colors.white} />
              </View>
              <Text style={styles.attachmentLabel}>File</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
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
  keyboardView: {
    flex: 1,
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageContainer: {
    marginBottom: 16,
    maxWidth: '85%',
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  senderName: {
    fontSize: 12,
    color: colors.gray600,
    marginBottom: 4,
    marginLeft: 4,
  },
  textMessageBubble: {
    backgroundColor: colors.gray100,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  ownMessageBubble: {
    backgroundColor: colors.brandPurple,
  },
  messageText: {
    fontSize: 15,
    color: colors.black,
    lineHeight: 20,
  },
  ownMessageText: {
    color: colors.white,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    marginLeft: 4,
  },
  timestamp: {
    fontSize: 11,
    color: colors.gray500,
  },
  uploadProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  uploadText: {
    fontSize: 13,
    color: colors.gray600,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
    backgroundColor: colors.white,
  },
  attachButton: {
    padding: 8,
    marginBottom: 4,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    backgroundColor: colors.gray50,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    marginHorizontal: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.brandPurple,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray200,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  attachmentMenu: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  attachmentOption: {
    alignItems: 'center',
    gap: 8,
  },
  attachmentIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attachmentLabel: {
    fontSize: 13,
    color: colors.gray700,
    fontWeight: '500',
  },
});

export default EnhancedChatScreen;

