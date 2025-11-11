import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';
import { updateUserProfile } from './authService';

/**
 * Upload profile image to Firebase Storage and update user profile
 */
export const uploadProfileImage = async (userId: string, imageUri: string): Promise<string> => {
  try {
    
    // Fetch the image as a blob
    const response = await fetch(imageUri);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    
    const storageRef = ref(storage, `profile-images/${userId}/${Date.now()}.jpg`);
    
    await uploadBytes(storageRef, blob);
    
    const downloadURL = await getDownloadURL(storageRef);
    
    await updateUserProfile(userId, {
      profileImage: downloadURL,
    });

    return downloadURL;
  } catch (error: any) {
    if (error.code === 'storage/unauthorized') {
      throw new Error('Permission denied. Please check Firebase Storage rules.');
    } else if (error.code === 'storage/unknown') {
      throw new Error('Firebase Storage error. Make sure Storage is enabled in Firebase Console.');
    }
    
    throw new Error(error.message || 'Failed to upload profile image');
  }
};

