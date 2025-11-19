import React, { createContext, useState, useEffect, useContext } from 'react';
import { User } from 'firebase/auth';
import { onAuthChange } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  bypassAuth: () => void;
  isDevUser: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  bypassAuth: () => {},
  isDevUser: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDevUser, setIsDevUser] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const bypassAuth = () => {
    // Create a mock user for development/testing
    const mockUser = {
      uid: 'dev-user-123',
      email: 'dev@example.com',
      displayName: 'Dev User',
      emailVerified: true,
      isAnonymous: false,
      metadata: {},
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => 'mock-token',
      getIdTokenResult: async () => ({ token: 'mock-token', claims: {}, signInProvider: 'mock', signInSecondFactor: null, issuedAtTime: '', expirationTime: '', authTime: '', firebase: {} }),
      reload: async () => {},
      toJSON: () => ({}),
      phoneNumber: null,
      photoURL: null,
      providerId: 'mock',
    } as User;

    setUser(mockUser);
    setIsDevUser(true);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, loading, bypassAuth, isDevUser }}>
      {children}
    </AuthContext.Provider>
  );
};

