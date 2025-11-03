import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile } from '../services/authService';
import { Profile } from '../types/profile';

interface FirestoreUserProfile {
  uid: string;
  email?: string;
  displayName?: string;
  bio?: string;
  profileImage?: string;
  genre?: string[];
  role?: string[];
  rolesNeeded?: string[];
  createdAt?: string;
}

export const useUserProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const firestoreProfile = await getUserProfile(user.uid) as FirestoreUserProfile | null;

        if (firestoreProfile) {
          // Map Firestore profile to Profile type
          const mappedProfile: Profile = {
            id: firestoreProfile.uid,
            username: firestoreProfile.email?.split('@')[0] || 'user',
            displayName: firestoreProfile.displayName || user.displayName || 'User',
            bio: firestoreProfile.bio || '',
            avatarUrl: firestoreProfile.profileImage || user.photoURL || undefined,
            songs: [], // TODO: Fetch songs from Firestore if needed
            connections: [], // TODO: Fetch connections from Firestore if needed
            followersCount: 0, // TODO: Calculate from Firestore
            followingCount: 0, // TODO: Calculate from Firestore
          };
          setProfile(mappedProfile);
        } else {
          // If no Firestore profile exists, create one from Firebase Auth data
          const fallbackProfile: Profile = {
            id: user.uid,
            username: user.email?.split('@')[0] || 'user',
            displayName: user.displayName || 'User',
            bio: '',
            avatarUrl: user.photoURL || undefined,
            songs: [],
            connections: [],
            followersCount: 0,
            followingCount: 0,
          };
          setProfile(fallbackProfile);
        }
        setError(null);
      } catch (err: any) {
        console.error('Error fetching user profile:', err);
        setError(err.message);
        // Fallback to Firebase Auth data
        if (user) {
          const fallbackProfile: Profile = {
            id: user.uid,
            username: user.email?.split('@')[0] || 'user',
            displayName: user.displayName || 'User',
            bio: '',
            avatarUrl: user.photoURL || undefined,
            songs: [],
            connections: [],
            followersCount: 0,
            followingCount: 0,
          };
          setProfile(fallbackProfile);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  return {
    profile,
    loading: authLoading || loading,
    error,
    refresh: async () => {
      if (user) {
        const firestoreProfile = await getUserProfile(user.uid) as FirestoreUserProfile | null;
        if (firestoreProfile) {
          const mappedProfile: Profile = {
            id: firestoreProfile.uid,
            username: firestoreProfile.email?.split('@')[0] || 'user',
            displayName: firestoreProfile.displayName || user?.displayName || 'User',
            bio: firestoreProfile.bio || '',
            avatarUrl: firestoreProfile.profileImage || user?.photoURL || undefined,
            songs: [],
            connections: [],
            followersCount: 0,
            followingCount: 0,
          };
          setProfile(mappedProfile);
        }
      }
    },
  };
};

