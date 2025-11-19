import { 
  doc, 
  setDoc, 
  updateDoc,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { UserPresence, TypingIndicator } from '../types/messaging';

const PRESENCE_COLLECTION = 'userPresence';
const TYPING_COLLECTION = 'typingIndicators';
const TYPING_TIMEOUT = 3000; // 3 seconds

let typingTimeout: NodeJS.Timeout | null = null;

/**
 * Set user online status
 */
export const setUserOnline = async (userId: string): Promise<void> => {
  try {
    const presenceRef = doc(db, PRESENCE_COLLECTION, userId);
    await setDoc(presenceRef, {
      userId,
      isOnline: true,
      lastSeen: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error('Error setting user online:', error);
    throw error;
  }
};

/**
 * Set user offline status
 */
export const setUserOffline = async (userId: string): Promise<void> => {
  try {
    const presenceRef = doc(db, PRESENCE_COLLECTION, userId);
    await updateDoc(presenceRef, {
      isOnline: false,
      lastSeen: serverTimestamp(),
      activeConversationId: null,
    });
  } catch (error) {
    console.error('Error setting user offline:', error);
    throw error;
  }
};

/**
 * Update active conversation
 */
export const setActiveConversation = async (
  userId: string,
  conversationId: string | null
): Promise<void> => {
  try {
    const presenceRef = doc(db, PRESENCE_COLLECTION, userId);
    await updateDoc(presenceRef, {
      activeConversationId: conversationId,
      lastSeen: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error setting active conversation:', error);
    throw error;
  }
};

/**
 * Subscribe to user's presence status
 */
export const subscribeToUserPresence = (
  userId: string,
  callback: (presence: UserPresence | null) => void
): (() => void) => {
  const presenceRef = doc(db, PRESENCE_COLLECTION, userId);

  return onSnapshot(presenceRef, (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      callback({
        userId: data.userId,
        isOnline: data.isOnline,
        lastSeen: data.lastSeen?.toDate() || new Date(),
        activeConversationId: data.activeConversationId,
      });
    } else {
      callback(null);
    }
  }, (error) => {
    console.error('Error subscribing to user presence:', error);
  });
};

/**
 * Subscribe to multiple users' presence status
 */
export const subscribeToMultipleUsersPresence = (
  userIds: string[],
  callback: (presences: { [userId: string]: UserPresence }) => void
): (() => void) => {
  if (userIds.length === 0) {
    callback({});
    return () => {};
  }

  const unsubscribers = userIds.map(userId => {
    return subscribeToUserPresence(userId, (presence) => {
      // This would need to be aggregated - simplified for now
    });
  });

  return () => {
    unsubscribers.forEach(unsub => unsub());
  };
};

/**
 * Get user presence status
 */
export const getUserPresence = async (userId: string): Promise<UserPresence | null> => {
  try {
    const presenceRef = doc(db, PRESENCE_COLLECTION, userId);
    const docSnap = await onSnapshot(presenceRef, () => {});
    
    // This is simplified - in production, use a one-time get
    return null;
  } catch (error) {
    console.error('Error getting user presence:', error);
    throw error;
  }
};

/**
 * Start typing indicator
 */
export const startTyping = async (
  conversationId: string,
  userId: string,
  userName: string
): Promise<void> => {
  try {
    const typingRef = doc(db, TYPING_COLLECTION, `${conversationId}_${userId}`);
    await setDoc(typingRef, {
      conversationId,
      userId,
      userName,
      timestamp: serverTimestamp(),
    });

    // Auto-stop typing after timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }
    typingTimeout = setTimeout(() => {
      stopTyping(conversationId, userId);
    }, TYPING_TIMEOUT);
  } catch (error) {
    console.error('Error starting typing:', error);
    throw error;
  }
};

/**
 * Stop typing indicator
 */
export const stopTyping = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  try {
    const typingRef = doc(db, TYPING_COLLECTION, `${conversationId}_${userId}`);
    await deleteDoc(typingRef);

    if (typingTimeout) {
      clearTimeout(typingTimeout);
      typingTimeout = null;
    }
  } catch (error) {
    console.error('Error stopping typing:', error);
    // Don't throw error for typing indicators
  }
};

/**
 * Subscribe to typing indicators in a conversation
 */
export const subscribeToTypingIndicators = (
  conversationId: string,
  currentUserId: string,
  callback: (typingUsers: TypingIndicator[]) => void
): (() => void) => {
  const q = query(
    collection(db, TYPING_COLLECTION),
    where('conversationId', '==', conversationId)
  );

  return onSnapshot(q, (snapshot) => {
    const typingIndicators = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          conversationId: data.conversationId,
          userId: data.userId,
          userName: data.userName,
          timestamp: data.timestamp?.toDate() || new Date(),
        } as TypingIndicator;
      })
      .filter(indicator => indicator.userId !== currentUserId);

    callback(typingIndicators);
  }, (error) => {
    console.error('Error subscribing to typing indicators:', error);
  });
};

/**
 * Clean up stale typing indicators (older than 5 seconds)
 */
export const cleanupStaleTypingIndicators = async (
  conversationId: string
): Promise<void> => {
  try {
    const q = query(
      collection(db, TYPING_COLLECTION),
      where('conversationId', '==', conversationId)
    );

    const snapshot = await getDocs(q);
    const now = Date.now();
    const staleThreshold = 5000; // 5 seconds

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const timestamp = data.timestamp?.toDate?.()?.getTime() || 0;
      
      if (now - timestamp > staleThreshold) {
        await deleteDoc(doc.ref);
      }
    }
  } catch (error) {
    console.error('Error cleaning up stale typing indicators:', error);
  }
};

/**
 * Format last seen timestamp
 */
export const formatLastSeen = (lastSeen: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - lastSeen.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return lastSeen.toLocaleDateString();
};

/**
 * Initialize presence system for a user (call on app start)
 */
export const initializePresence = async (userId: string): Promise<void> => {
  try {
    await setUserOnline(userId);

    // Set up listener for app state changes
    // In React Native, you'd use AppState to handle background/foreground
  } catch (error) {
    console.error('Error initializing presence:', error);
    throw error;
  }
};

/**
 * Cleanup presence on logout
 */
export const cleanupPresence = async (userId: string): Promise<void> => {
  try {
    await setUserOffline(userId);
  } catch (error) {
    console.error('Error cleaning up presence:', error);
    throw error;
  }
};

