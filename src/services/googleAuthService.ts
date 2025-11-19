import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID, GOOGLE_ANDROID_CLIENT_ID } from '@env';

WebBrowser.maybeCompleteAuthSession();

/**
 * Sign in with Google using Expo AuthSession
 * 
 * Make sure you have created OAuth clients in Google Cloud Console:
 * - Web Application (for Firebase)
 * - iOS (with your bundle ID)
 * - Android (with your package name and SHA-1)
 * 
 * See GOOGLE_SIGNIN_SETUP.md for detailed instructions
 */
export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: GOOGLE_WEB_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID, 
    androidClientId: GOOGLE_ANDROID_CLIENT_ID || GOOGLE_WEB_CLIENT_ID,
  });

  return { request, response, promptAsync };
};

/**
 * Handle Google Sign-In response and authenticate with Firebase
 */
export const handleGoogleSignIn = async (response: any) => {
  if (response?.type === 'success') {
    const { id_token } = response.params;
    
    try {
      const credential = GoogleAuthProvider.credential(id_token);
      const userCredential = await signInWithCredential(auth, credential);
      const user = userCredential.user;

      // Check if user profile exists in Firestore
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      // If new user, create profile
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'User',
          bio: '',
          genre: [],
          role: [],
          rolesNeeded: [],
          profileImage: user.photoURL || '',
          createdAt: new Date().toISOString(),
        });
      }

      return user;
    } catch (error: any) {
      console.error('Google sign-in error:', error);
      throw new Error(error.message);
    }
  }
  
  return null;
};

