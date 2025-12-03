import { collection, getDocs, query, where, limit, orderBy, doc, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Post, User } from '../types';

/**
 * Fetch all users from Firebase (excluding current user)
 * This is used to discover other artists on the platform
 */
export const getAllUsers = async (currentUserId: string): Promise<User[]> => {
  try {
    console.log('[getAllUsers] Fetching users from Firestore...');
    const usersRef = collection(db, 'users');
    const q = query(usersRef, limit(50)); // Limit to 50 users for performance

    const snapshot = await getDocs(q);
    console.log(`[getAllUsers] Retrieved ${snapshot.size} documents from Firestore`);

    const users: User[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();

      // Skip current user
      if (doc.id === currentUserId) return;

      // Only include users with profiles set up (have genres or roles)
      if (data.genre?.length > 0 || data.role?.length > 0) {
        users.push({
          id: doc.id,
          name: data.displayName || 'Unknown Artist',
          role: data.role || [],
          skills: [], // TODO: Add skills field to user profiles
          genres: data.genre || [],
          location: data.location || '', // TODO: Add location to user profiles
          avatar: data.profileImage || undefined,
        });
      }
    });

    console.log(`[getAllUsers] Returning ${users.length} valid users`);
    return users;
  } catch (error: any) {
    console.error('[getAllUsers] Error:', error.code, error.message);
    console.error('[getAllUsers] Full error:', error);
    throw error;
  }
};

/**
 * Create mock posts for each user
 * In production, you would fetch actual posts from a 'posts' collection
 * For now, we create one post per user to populate the feed
 */
export const getPostsForUsers = async (users: User[]): Promise<Post[]> => {
  const posts: Post[] = users.map((user, index) => ({
    id: `post_${user.id}_${index}`,
    creator_id: user.id,
    creator_name: user.name,
    creator_role: user.role,
    // Using placeholder audio - in production, users would upload their own
    audio_clip_url: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${(index % 8) + 1}.mp3`,
    genre: user.genres[0] || 'other',
    tags: user.role,
    roles_needed: getRolesNeeded(user.role),
    created_at: new Date(Date.now() - index * 60 * 1000).toISOString(), // Stagger by minutes
  }));

  return posts;
};

/**
 * Helper function to determine what roles a user is looking for
 * Based on their current role, suggest complementary roles
 */
const getRolesNeeded = (userRoles: string[]): string[] => {
  const rolesMap: { [key: string]: string[] } = {
    'producer': ['vocalist', 'songwriter', 'rapper'],
    'vocalist': ['producer', 'mixing engineer', 'beat-maker'],
    'rapper': ['producer', 'beat-maker', 'mixing engineer'],
    'guitarist': ['vocalist', 'producer', 'bassist'],
    'pianist': ['vocalist', 'mixing engineer'],
    'songwriter': ['producer', 'vocalist'],
    'mixing engineer': ['producer', 'mastering engineer'],
    'mastering engineer': ['mixing engineer', 'producer'],
    'beat-maker': ['rapper', 'vocalist'],
    'dj': ['vocalist', 'producer'],
  };

  const needed = new Set<string>();
  userRoles.forEach(role => {
    const complementary = rolesMap[role.toLowerCase()];
    if (complementary) {
      complementary.forEach(r => needed.add(r));
    }
  });

  return Array.from(needed);
};

/**
 * Add a connection between two users
 * Creates a bidirectional connection in Firestore
 */
export const addConnection = async (userId: string, targetUserId: string): Promise<void> => {
  try {
    // Create connection document for current user
    const connectionRef1 = doc(db, 'connections', `${userId}_${targetUserId}`);
    await setDoc(connectionRef1, {
      userId: userId,
      connectedUserId: targetUserId,
      createdAt: new Date().toISOString(),
      status: 'connected',
    });

    // Create reverse connection for target user
    const connectionRef2 = doc(db, 'connections', `${targetUserId}_${userId}`);
    await setDoc(connectionRef2, {
      userId: targetUserId,
      connectedUserId: userId,
      createdAt: new Date().toISOString(),
      status: 'connected',
    });

    console.log(`Connection created between ${userId} and ${targetUserId}`);
  } catch (error) {
    console.error('Error adding connection:', error);
    throw error;
  }
};

/**
 * Check if a connection exists between two users
 */
export const checkConnectionExists = async (userId: string, targetUserId: string): Promise<boolean> => {
  try {
    const connectionRef = doc(db, 'connections', `${userId}_${targetUserId}`);
    const docSnap = await getDoc(connectionRef);
    return docSnap.exists();
  } catch (error) {
    console.error('Error checking connection:', error);
    return false;
  }
};

/**
 * Get all connections for a user
 */
export const getUserConnections = async (userId: string): Promise<string[]> => {
  try {
    console.log('[getUserConnections] Fetching connections for user:', userId);
    const connectionsRef = collection(db, 'connections');
    const q = query(connectionsRef, where('userId', '==', userId));

    const snapshot = await getDocs(q);
    console.log(`[getUserConnections] Retrieved ${snapshot.size} connection documents`);

    const connectionIds: string[] = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.connectedUserId) {
        connectionIds.push(data.connectedUserId);
      }
    });

    console.log(`[getUserConnections] Returning ${connectionIds.length} connections`);
    return connectionIds;
  } catch (error: any) {
    console.error('[getUserConnections] Error:', error.code, error.message);
    console.error('[getUserConnections] Full error:', error);
    throw error;
  }
};

/**
 * Remove a connection between two users
 */
export const removeConnection = async (userId: string, targetUserId: string): Promise<void> => {
  try {
    // Delete both directions of the connection
    const connectionRef1 = doc(db, 'connections', `${userId}_${targetUserId}`);
    const connectionRef2 = doc(db, 'connections', `${targetUserId}_${userId}`);

    await deleteDoc(connectionRef1);
    await deleteDoc(connectionRef2);

    console.log(`Connection removed between ${userId} and ${targetUserId}`);
  } catch (error) {
    console.error('Error removing connection:', error);
    throw error;
  }
};
