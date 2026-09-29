import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  auth,
  UserProfile,
  ensureUserDocument,
  getUserProfile,
  updateUserDisplayName,
  updateUserBudget,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  googleProvider,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  getFriendlyErrorMessage,
} from '../lib/firebase.ts';

interface ServerVerificationResult {
  success: boolean;
  message?: string;
  user?: {
    uid: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    auth_time: string;
    expires_at: string;
    issuer: string;
  };
  verifiedAt?: string;
  error?: string;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  isUpdatingProfile: boolean;
  authError: string | null;
  authErrorCode: string | null;
  clearAuthError: () => void;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateName: (newName: string) => Promise<void>;
  updateBudget: (newBudget: number) => Promise<void>;
  verifyTokenWithServer: () => Promise<ServerVerificationResult>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authErrorCode, setAuthErrorCode] = useState<string | null>(null);

  const clearAuthError = () => {
    setAuthError(null);
    setAuthErrorCode(null);
  };

  // Synchronize authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        try {
          const profile = await ensureUserDocument(user);
          setUserProfile(profile);
        } catch (err) {
          console.error('Failed to load user profile from Firestore:', err);
          // Fallback profile if Firestore read fails
          setUserProfile({
            uid: user.uid,
            displayName: user.displayName || user.email?.split('@')[0] || 'ผู้ใช้งาน',
            email: user.email || '',
            role: 'user',
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    clearAuthError();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const profile = await ensureUserDocument(userCredential.user);
      setUserProfile(profile);
    } catch (err: any) {
      const msg = getFriendlyErrorMessage(err);
      setAuthError(msg);
      setAuthErrorCode(err?.code || 'auth/unknown');
      throw new Error(msg);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name: string) => {
    clearAuthError();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), pass);
      const profile = await ensureUserDocument(userCredential.user, name.trim());
      setUserProfile(profile);
    } catch (err: any) {
      const msg = getFriendlyErrorMessage(err);
      setAuthError(msg);
      setAuthErrorCode(err?.code || 'auth/unknown');
      throw new Error(msg);
    }
  };

  const loginWithGoogle = async () => {
    clearAuthError();
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const profile = await ensureUserDocument(userCredential.user);
      setUserProfile(profile);
    } catch (err: any) {
      // Don't show error if user just closed popup
      if (err?.code === 'auth/popup-closed-by-user') {
        return;
      }
      const msg = getFriendlyErrorMessage(err);
      setAuthError(msg);
      setAuthErrorCode(err?.code || 'auth/unknown');
      throw new Error(msg);
    }
  };

  const logout = async () => {
    clearAuthError();
    try {
      await signOut(auth);
      setCurrentUser(null);
      setUserProfile(null);
    } catch (err: any) {
      const msg = getFriendlyErrorMessage(err);
      setAuthError(msg);
      setAuthErrorCode(err?.code || 'auth/unknown');
      throw new Error(msg);
    }
  };

  const resetPassword = async (email: string) => {
    clearAuthError();
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: any) {
      const msg = getFriendlyErrorMessage(err);
      setAuthError(msg);
      setAuthErrorCode(err?.code || 'auth/unknown');
      throw new Error(msg);
    }
  };

  const updateName = async (newName: string) => {
    if (!currentUser) throw new Error('กรุณาเข้าสู่ระบบก่อนดำเนินการ');
    setIsUpdatingProfile(true);
    try {
      await updateUserDisplayName(currentUser.uid, newName);
      // Reload fresh profile from Firestore
      const updated = await getUserProfile(currentUser.uid);
      if (updated) {
        setUserProfile(updated);
      } else {
        setUserProfile((prev) => (prev ? { ...prev, displayName: newName } : null));
      }
    } catch (err: any) {
      throw err;
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const updateBudget = async (newBudget: number) => {
    if (!currentUser) throw new Error('กรุณาเข้าสู่ระบบก่อนดำเนินการ');
    try {
      await updateUserBudget(currentUser.uid, newBudget);
      setUserProfile((prev) => (prev ? { ...prev, monthlyBudget: newBudget } : null));
    } catch (err: any) {
      throw err;
    }
  };

  const verifyTokenWithServer = async (): Promise<ServerVerificationResult> => {
    if (!currentUser) {
      return { success: false, error: 'ผู้ใช้ยังไม่ได้เข้าสู่ระบบ' };
    }

    try {
      const idToken = await currentUser.getIdToken(true);
      const response = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
      });

      const data = await response.json();
      return data;
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'ไม่สามารถติดต่อเซิร์ฟเวอร์ Node.js ได้',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        isUpdatingProfile,
        authError,
        authErrorCode,
        clearAuthError,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        resetPassword,
        updateName,
        updateBudget,
        verifyTokenWithServer,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
