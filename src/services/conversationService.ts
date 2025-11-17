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
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
  serverTimestamp,
  increment,
  writeBatch
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { 
  Conversation, 
  ConversationType,
  ConversationParticipant,
  ProjectMetadata,
  SharedFile,
  FirestoreConversation
} from '../types/messaging';

const CONVERSATIONS_COLLECTION = 'conversations';

/**
 * Create a new conversation (direct or group)
 */
export const createConversation = async (
  currentUserId: string,
  participants: ConversationParticipant[],
  type: ConversationType,
  options?: {
    title?: string;
    description?: string;
    avatar?: string;
    projectId?: string;
    projectMetadata?: ProjectMetadata;
  }
): Promise<string> => {
  try {
    // For direct conversations, check if one already exists
    if (type === 'direct') {
      const participantIds = participants.map(p => p.userId);
      const existingConv = await findExistingDirectConversation(participantIds);
      if (existingConv) {
        return existingConv.id;
      }
    }

    const conversationRef = doc(collection(db, CONVERSATIONS_COLLECTION));
    const participantIds = participants.map(p => p.userId);

    const conversationData: FirestoreConversation = {
      type,
      participants,
      participantIds,
      title: options?.title,
      description: options?.description,
      avatar: options?.avatar,
      projectId: options?.projectId,
      projectMetadata: options?.projectMetadata,
      pinnedMessages: [],
      sharedFiles: [],
      createdAt: serverTimestamp(),
      createdBy: currentUserId,
      updatedAt: serverTimestamp(),
      unreadCount: {},
    };

    await setDoc(conversationRef, conversationData);
    return conversationRef.id;
  } catch (error) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

/**
 * Find existing direct conversation between users
 */
export const findExistingDirectConversation = async (
  participantIds: string[]
): Promise<Conversation | null> => {
  try {
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where('type', '==', 'direct'),
      where('participantIds', 'array-contains', participantIds[0])
    );

    const snapshot = await getDocs(q);
    
    for (const doc of snapshot.docs) {
      const data = doc.data() as FirestoreConversation;
      // Check if all participants match
      if (participantIds.every(id => data.participantIds.includes(id)) &&
          data.participantIds.length === participantIds.length) {
        return convertFirestoreConversation(doc.id, data);
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding conversation:', error);
    throw error;
  }
};

/**
 * Get conversation by ID
 */
export const getConversation = async (conversationId: string): Promise<Conversation | null> => {
  try {
    const docRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return convertFirestoreConversation(docSnap.id, docSnap.data() as FirestoreConversation);
    }
    return null;
  } catch (error) {
    console.error('Error getting conversation:', error);
    throw error;
  }
};

/**
 * Get all conversations for a user
 */
export const getUserConversations = async (userId: string): Promise<Conversation[]> => {
  try {
    const q = query(
      collection(db, CONVERSATIONS_COLLECTION),
      where('participantIds', 'array-contains', userId),
      orderBy('updatedAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => 
      convertFirestoreConversation(doc.id, doc.data() as FirestoreConversation)
    );
  } catch (error) {
    console.error('Error getting user conversations:', error);
    throw error;
  }
};

/**
 * Subscribe to user's conversations in real-time
 */
export const subscribeToUserConversations = (
  userId: string,
  callback: (conversations: Conversation[]) => void
): (() => void) => {
  const q = query(
    collection(db, CONVERSATIONS_COLLECTION),
    where('participantIds', 'array-contains', userId),
    orderBy('updatedAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map(doc => 
      convertFirestoreConversation(doc.id, doc.data() as FirestoreConversation)
    );
    callback(conversations);
  }, (error) => {
    console.error('Error subscribing to conversations:', error);
  });
};

/**
 * Subscribe to a specific conversation
 */
export const subscribeToConversation = (
  conversationId: string,
  callback: (conversation: Conversation | null) => void
): (() => void) => {
  const docRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);

  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback(convertFirestoreConversation(doc.id, doc.data() as FirestoreConversation));
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error subscribing to conversation:', error);
  });
};

/**
 * Update conversation details
 */
export const updateConversation = async (
  conversationId: string,
  updates: Partial<Conversation>
): Promise<void> => {
  try {
    const docRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating conversation:', error);
    throw error;
  }
};

/**
 * Add participants to group conversation
 */
export const addParticipants = async (
  conversationId: string,
  participants: ConversationParticipant[]
): Promise<void> => {
  try {
    const docRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    await updateDoc(docRef, {
      participants: arrayUnion(...participants),
      participantIds: arrayUnion(...participants.map(p => p.userId)),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding participants:', error);
    throw error;
  }
};

/**
 * Remove participant from group conversation
 */
export const removeParticipant = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  try {
    const conversation = await getConversation(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    const participant = conversation.participants.find(p => p.userId === userId);
    if (!participant) throw new Error('Participant not found');

    const docRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    await updateDoc(docRef, {
      participants: arrayRemove(participant),
      participantIds: arrayRemove(userId),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error removing participant:', error);
    throw error;
  }
};

/**
 * Pin a message in conversation
 */
export const pinMessage = async (
  conversationId: string,
  messageId: string,
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    await updateDoc(docRef, {
      pinnedMessages: arrayUnion(messageId),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error pinning message:', error);
    throw error;
  }
};

/**
 * Unpin a message
 */
export const unpinMessage = async (
  conversationId: string,
  messageId: string
): Promise<void> => {
  try {
    const docRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    await updateDoc(docRef, {
      pinnedMessages: arrayRemove(messageId),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error unpinning message:', error);
    throw error;
  }
};

/**
 * Add shared file to conversation
 */
export const addSharedFile = async (
  conversationId: string,
  file: SharedFile
): Promise<void> => {
  try {
    const docRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    await updateDoc(docRef, {
      sharedFiles: arrayUnion(file),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding shared file:', error);
    throw error;
  }
};

/**
 * Archive conversation for a user
 */
export const archiveConversation = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    await updateDoc(docRef, {
      archivedBy: arrayUnion(userId),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error archiving conversation:', error);
    throw error;
  }
};

/**
 * Unarchive conversation
 */
export const unarchiveConversation = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    await updateDoc(docRef, {
      archivedBy: arrayRemove(userId),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error unarchiving conversation:', error);
    throw error;
  }
};

/**
 * Update unread count for a user
 */
export const incrementUnreadCount = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    await updateDoc(docRef, {
      [`unreadCount.${userId}`]: increment(1),
    });
  } catch (error) {
    console.error('Error incrementing unread count:', error);
    throw error;
  }
};

/**
 * Mark conversation as read for a user
 */
export const markConversationAsRead = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  try {
    const docRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    await updateDoc(docRef, {
      [`unreadCount.${userId}`]: 0,
    });

    // Also update participant's lastReadAt
    const conversation = await getConversation(conversationId);
    if (conversation) {
      const updatedParticipants = conversation.participants.map(p => 
        p.userId === userId ? { ...p, lastReadAt: new Date() } : p
      );
      await updateDoc(docRef, { participants: updatedParticipants });
    }
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    throw error;
  }
};

/**
 * Update last message info
 */
export const updateLastMessage = async (
  conversationId: string,
  messagePreview: Conversation['lastMessage']
): Promise<void> => {
  try {
    const docRef = doc(db, CONVERSATIONS_COLLECTION, conversationId);
    await updateDoc(docRef, {
      lastMessage: messagePreview,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating last message:', error);
    throw error;
  }
};

/**
 * Convert Firestore timestamp to Date
 */
const convertFirestoreConversation = (
  id: string, 
  data: FirestoreConversation
): Conversation => {
  return {
    ...data,
    id,
    createdAt: data.createdAt?.toDate?.() || new Date(),
    updatedAt: data.updatedAt?.toDate?.() || new Date(),
    lastMessage: data.lastMessage ? {
      content: data.lastMessage.content,
      senderId: data.lastMessage.senderId,
      senderName: data.lastMessage.senderName,
      timestamp: data.lastMessage.timestamp?.toDate?.() || new Date(),
      type: data.lastMessage.type,
    } : undefined,
    participants: data.participants.map(p => ({
      ...p,
      joinedAt: p.joinedAt || new Date(),
      lastReadAt: p.lastReadAt || new Date(),
    })),
  };
};

/**
 * Search conversations by title or participant name
 */
export const searchConversations = async (
  userId: string,
  searchQuery: string
): Promise<Conversation[]> => {
  try {
    // Get all user conversations first (Firestore doesn't support partial text search)
    const conversations = await getUserConversations(userId);
    
    // Filter locally
    const lowerQuery = searchQuery.toLowerCase();
    return conversations.filter(conv => {
      // Search in title
      if (conv.title?.toLowerCase().includes(lowerQuery)) return true;
      
      // Search in participant names
      return conv.participants.some(p => 
        p.displayName.toLowerCase().includes(lowerQuery)
      );
    });
  } catch (error) {
    console.error('Error searching conversations:', error);
    throw error;
  }
};

