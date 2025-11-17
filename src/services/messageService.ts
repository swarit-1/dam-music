import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  onSnapshot,
  updateDoc,
  deleteDoc,
  Timestamp,
  serverTimestamp,
  writeBatch,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  Message, 
  MessageType,
  MessageStatus,
  MessageReaction,
  FirestoreMessage
} from '../types/messaging';
import { updateLastMessage, incrementUnreadCount } from './conversationService';

const MESSAGES_COLLECTION = 'messages';
const BATCH_SIZE = 20;

/**
 * Send a new message
 */
export const sendMessage = async (
  conversationId: string,
  senderId: string,
  senderName: string,
  content: string,
  type: MessageType = 'text',
  options?: {
    senderAvatar?: string;
    audioMetadata?: Message['audioMetadata'];
    fileMetadata?: Message['fileMetadata'];
    videoMetadata?: Message['videoMetadata'];
    linkPreview?: Message['linkPreview'];
    collaborationRequest?: Message['collaborationRequest'];
    projectInvitation?: Message['projectInvitation'];
    audioTimestampComment?: Message['audioTimestampComment'];
    replyTo?: string;
  }
): Promise<string> => {
  try {
    const messageRef = doc(collection(db, MESSAGES_COLLECTION));
    
    const messageData: FirestoreMessage = {
      conversationId,
      senderId,
      senderName,
      senderAvatar: options?.senderAvatar,
      type,
      content,
      timestamp: serverTimestamp(),
      status: 'sent',
      audioMetadata: options?.audioMetadata,
      fileMetadata: options?.fileMetadata,
      videoMetadata: options?.videoMetadata,
      linkPreview: options?.linkPreview,
      collaborationRequest: options?.collaborationRequest,
      projectInvitation: options?.projectInvitation,
      audioTimestampComment: options?.audioTimestampComment,
      replyTo: options?.replyTo,
      reactions: [],
      readBy: {},
      deliveredTo: {},
    };

    await setDoc(messageRef, messageData);

    // Update conversation's last message
    await updateLastMessage(conversationId, {
      content: type === 'text' ? content : getMessageTypeDisplay(type),
      senderId,
      senderName,
      timestamp: new Date(),
      type,
    });

    return messageRef.id;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Get display text for non-text message types
 */
const getMessageTypeDisplay = (type: MessageType): string => {
  const displays: Record<MessageType, string> = {
    'text': '',
    'audio': '🎵 Audio file',
    'video': '🎥 Video',
    'file': '📎 File',
    'voice-note': '🎤 Voice message',
    'collaboration-request': '🤝 Collaboration request',
    'project-invitation': '🎼 Project invitation',
    'audio-timestamp-comment': '💬 Audio comment',
    'link-preview': '🔗 Link',
  };
  return displays[type] || 'Message';
};

/**
 * Get messages for a conversation (paginated)
 */
export const getMessages = async (
  conversationId: string,
  limitCount: number = BATCH_SIZE,
  lastDoc?: QueryDocumentSnapshot
): Promise<{ messages: Message[], lastVisible: QueryDocumentSnapshot | null }> => {
  try {
    let q = query(
      collection(db, MESSAGES_COLLECTION),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    if (lastDoc) {
      q = query(q, startAfter(lastDoc));
    }

    const snapshot = await getDocs(q);
    const messages = snapshot.docs.map(doc => 
      convertFirestoreMessage(doc.id, doc.data() as FirestoreMessage)
    );

    return {
      messages,
      lastVisible: snapshot.docs[snapshot.docs.length - 1] || null,
    };
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

/**
 * Subscribe to messages in real-time
 */
export const subscribeToMessages = (
  conversationId: string,
  callback: (messages: Message[]) => void,
  limitCount: number = 50
): (() => void) => {
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    where('conversationId', '==', conversationId),
    orderBy('timestamp', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => 
      convertFirestoreMessage(doc.id, doc.data() as FirestoreMessage)
    );
    callback(messages);
  }, (error) => {
    console.error('Error subscribing to messages:', error);
  });
};

/**
 * Get a single message by ID
 */
export const getMessage = async (messageId: string): Promise<Message | null> => {
  try {
    const docRef = doc(db, MESSAGES_COLLECTION, messageId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return convertFirestoreMessage(docSnap.id, docSnap.data() as FirestoreMessage);
    }
    return null;
  } catch (error) {
    console.error('Error getting message:', error);
    throw error;
  }
};

/**
 * Update message status
 */
export const updateMessageStatus = async (
  messageId: string,
  status: MessageStatus
): Promise<void> => {
  try {
    const docRef = doc(db, MESSAGES_COLLECTION, messageId);
    await updateDoc(docRef, { status });
  } catch (error) {
    console.error('Error updating message status:', error);
    throw error;
  }
};

/**
 * Mark message as delivered to a user
 */
export const markMessageAsDelivered = async (
  messageId: string,
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, MESSAGES_COLLECTION, messageId);
    await updateDoc(docRef, {
      [`deliveredTo.${userId}`]: serverTimestamp(),
      status: 'delivered',
    });
  } catch (error) {
    console.error('Error marking message as delivered:', error);
    throw error;
  }
};

/**
 * Mark message as read by a user
 */
export const markMessageAsRead = async (
  messageId: string,
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, MESSAGES_COLLECTION, messageId);
    await updateDoc(docRef, {
      [`readBy.${userId}`]: serverTimestamp(),
      status: 'read',
    });
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

/**
 * Mark all messages in conversation as read
 */
export const markAllMessagesAsRead = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('conversationId', '==', conversationId),
      where('senderId', '!=', userId)
    );

    const snapshot = await getDocs(q);
    const batch = writeBatch(db);

    snapshot.docs.forEach(doc => {
      const data = doc.data() as FirestoreMessage;
      // Only update if not already read by this user
      if (!data.readBy?.[userId]) {
        batch.update(doc.ref, {
          [`readBy.${userId}`]: serverTimestamp(),
          status: 'read',
        });
      }
    });

    await batch.commit();
  } catch (error) {
    console.error('Error marking all messages as read:', error);
    throw error;
  }
};

/**
 * Add reaction to a message
 */
export const addReaction = async (
  messageId: string,
  userId: string,
  userName: string,
  emoji: string
): Promise<void> => {
  try {
    const message = await getMessage(messageId);
    if (!message) throw new Error('Message not found');

    const reactions = message.reactions || [];
    
    // Check if user already reacted with this emoji
    const existingReaction = reactions.find(
      r => r.userId === userId && r.emoji === emoji
    );

    if (existingReaction) {
      // Remove reaction if already exists
      const updatedReactions = reactions.filter(
        r => !(r.userId === userId && r.emoji === emoji)
      );
      await updateDoc(doc(db, MESSAGES_COLLECTION, messageId), {
        reactions: updatedReactions,
      });
    } else {
      // Add new reaction
      const newReaction: MessageReaction = {
        emoji,
        userId,
        userName,
        timestamp: new Date(),
      };
      await updateDoc(doc(db, MESSAGES_COLLECTION, messageId), {
        reactions: [...reactions, newReaction],
      });
    }
  } catch (error) {
    console.error('Error adding reaction:', error);
    throw error;
  }
};

/**
 * Remove reaction from a message
 */
export const removeReaction = async (
  messageId: string,
  userId: string,
  emoji: string
): Promise<void> => {
  try {
    const message = await getMessage(messageId);
    if (!message) throw new Error('Message not found');

    const reactions = message.reactions || [];
    const updatedReactions = reactions.filter(
      r => !(r.userId === userId && r.emoji === emoji)
    );

    await updateDoc(doc(db, MESSAGES_COLLECTION, messageId), {
      reactions: updatedReactions,
    });
  } catch (error) {
    console.error('Error removing reaction:', error);
    throw error;
  }
};

/**
 * Edit a message
 */
export const editMessage = async (
  messageId: string,
  newContent: string
): Promise<void> => {
  try {
    const docRef = doc(db, MESSAGES_COLLECTION, messageId);
    await updateDoc(docRef, {
      content: newContent,
      editedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error editing message:', error);
    throw error;
  }
};

/**
 * Delete a message (soft delete)
 */
export const deleteMessage = async (messageId: string): Promise<void> => {
  try {
    const docRef = doc(db, MESSAGES_COLLECTION, messageId);
    await updateDoc(docRef, {
      content: 'This message has been deleted',
      deletedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

/**
 * Search messages in a conversation
 */
export const searchMessages = async (
  conversationId: string,
  searchQuery: string
): Promise<Message[]> => {
  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(q);
    const messages = snapshot.docs.map(doc => 
      convertFirestoreMessage(doc.id, doc.data() as FirestoreMessage)
    );

    // Filter locally (Firestore doesn't support text search)
    const lowerQuery = searchQuery.toLowerCase();
    return messages.filter(msg => 
      msg.content.toLowerCase().includes(lowerQuery) ||
      msg.senderName.toLowerCase().includes(lowerQuery)
    );
  } catch (error) {
    console.error('Error searching messages:', error);
    throw error;
  }
};

/**
 * Get messages by type (e.g., all audio messages)
 */
export const getMessagesByType = async (
  conversationId: string,
  type: MessageType
): Promise<Message[]> => {
  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('conversationId', '==', conversationId),
      where('type', '==', type),
      orderBy('timestamp', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => 
      convertFirestoreMessage(doc.id, doc.data() as FirestoreMessage)
    );
  } catch (error) {
    console.error('Error getting messages by type:', error);
    throw error;
  }
};

/**
 * Get pinned messages
 */
export const getPinnedMessages = async (
  conversationId: string,
  pinnedMessageIds: string[]
): Promise<Message[]> => {
  try {
    if (pinnedMessageIds.length === 0) return [];

    const messages = await Promise.all(
      pinnedMessageIds.map(id => getMessage(id))
    );

    return messages.filter((msg): msg is Message => msg !== null);
  } catch (error) {
    console.error('Error getting pinned messages:', error);
    throw error;
  }
};

/**
 * Update collaboration request status
 */
export const updateCollaborationRequestStatus = async (
  messageId: string,
  status: 'accepted' | 'declined'
): Promise<void> => {
  try {
    const docRef = doc(db, MESSAGES_COLLECTION, messageId);
    const message = await getMessage(messageId);
    
    if (message?.collaborationRequest) {
      await updateDoc(docRef, {
        'collaborationRequest.status': status,
        'collaborationRequest.respondedAt': serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error updating collaboration request:', error);
    throw error;
  }
};

/**
 * Update project invitation status
 */
export const updateProjectInvitationStatus = async (
  messageId: string,
  status: 'accepted' | 'declined'
): Promise<void> => {
  try {
    const docRef = doc(db, MESSAGES_COLLECTION, messageId);
    const message = await getMessage(messageId);
    
    if (message?.projectInvitation) {
      await updateDoc(docRef, {
        'projectInvitation.status': status,
        'projectInvitation.respondedAt': serverTimestamp(),
      });
    }
  } catch (error) {
    console.error('Error updating project invitation:', error);
    throw error;
  }
};

/**
 * Convert Firestore message to Message type
 */
const convertFirestoreMessage = (id: string, data: FirestoreMessage): Message => {
  return {
    ...data,
    id,
    timestamp: data.timestamp?.toDate?.() || new Date(),
    readBy: data.readBy ? Object.fromEntries(
      Object.entries(data.readBy).map(([userId, timestamp]) => [
        userId,
        timestamp?.toDate?.() || new Date()
      ])
    ) : {},
    deliveredTo: data.deliveredTo ? Object.fromEntries(
      Object.entries(data.deliveredTo).map(([userId, timestamp]) => [
        userId,
        timestamp?.toDate?.() || new Date()
      ])
    ) : {},
    reactions: data.reactions || [],
    editedAt: data.editedAt?.toDate?.(),
    deletedAt: data.deletedAt?.toDate?.(),
  };
};

/**
 * Get unread message count for user in conversation
 */
export const getUnreadCount = async (
  conversationId: string,
  userId: string
): Promise<number> => {
  try {
    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('conversationId', '==', conversationId),
      where('senderId', '!=', userId)
    );

    const snapshot = await getDocs(q);
    let unreadCount = 0;

    snapshot.docs.forEach(doc => {
      const data = doc.data() as FirestoreMessage;
      if (!data.readBy?.[userId]) {
        unreadCount++;
      }
    });

    return unreadCount;
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
};

