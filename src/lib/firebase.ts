import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocFromServer,
  serverTimestamp,
} from 'firebase/firestore';
import {
  getDatabase,
  ref,
  set as setRtdb,
  update as updateRtdb,
} from 'firebase/database';
import firebaseConfig from '../../firebase-applet-config.json';
import { Transaction, UserPreferences } from '../types.ts';

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Cloud Firestore
export const db =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

// Initialize Realtime Database (matching user's databaseURL)
export const rtdb = getDatabase(app);

export const FIREBASE_PROJECT_INFO = {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  databaseURL: (firebaseConfig as any).databaseURL,
  consoleUrls: {
    overview: `https://console.firebase.google.com/project/${firebaseConfig.projectId}/overview`,
    auth: `https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/users`,
    firestore: `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore`,
    rtdb: `https://console.firebase.google.com/project/${firebaseConfig.projectId}/database`,
  },
};

// Google Auth Provider (Configured for seamless Gmail login)
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Test connection on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Please check your Firebase configuration or network connection.');
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt?: string;
  photoURL?: string | null;
  providerId?: string;
  monthlyBudget?: number;
}

/**
 * Translates Firebase Auth error codes into friendly Thai messages.
 */
export function getFriendlyErrorMessage(error: any): string {
  const code = error?.code || '';
  switch (code) {
    case 'auth/configuration-not-found':
      return 'ยังไม่ได้เปิดใช้งาน Firebase Authentication ใน Firebase Console: กรุณาเข้าไปกดปุ่ม "Get started" และเปิดใช้งาน Google หรือ Email/Password ในแท็บ Sign-in method';
    case 'auth/operation-not-allowed':
      return 'วิธีเข้าสู่ระบบนี้ยังไม่ถูกเปิดใช้งาน (Disabled) ใน Firebase Console: กรุณาไปที่ Authentication > Sign-in method แล้วเปิดใช้งาน (Enable)';
    case 'auth/unauthorized-domain':
      return 'โดเมนของเว็บไซต์นี้ยังไม่ได้รับอนุญาตใน Firebase Authentication: กรุณาไปที่ Firebase Console > Authentication > Settings > Authorized domains แล้วเพิ่มโดเมนนี้';
    case 'auth/invalid-email':
      return 'รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';
    case 'auth/user-disabled':
      return 'บัญชีผู้ใช้นี้ถูกระงับการใช้งาน';
    case 'auth/user-not-found':
      return 'ไม่พบบัญชีผู้ใช้นี้ในระบบ กรุณาสมัครสมาชิกก่อนเข้าสู่ระบบ';
    case 'auth/wrong-password':
      return 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง';
    case 'auth/invalid-credential':
      return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบข้อมูล';
    case 'auth/email-already-in-use':
      return 'อีเมลนี้ถูกใช้งานแล้วในระบบ กรุณาใช้อีเมลอื่นหรือเข้าสู่ระบบ';
    case 'auth/weak-password':
      return 'รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร';
    case 'auth/popup-closed-by-user':
      return 'หน้าต่างการเข้าสู่ระบบถูกปิดก่อนทำรายการเสร็จสิ้น';
    case 'auth/popup-blocked':
      return 'เบราว์เซอร์บล็อกหน้าต่างป๊อปอัป กรุณาอนุญาตป๊อปอัปสำหรับเว็บไซต์นี้';
    case 'auth/network-request-failed':
      return 'การเชื่อมต่อเครือข่ายล้มเหลว กรุณาตรวจสอบอินเทอร์เน็ต';
    case 'auth/too-many-requests':
      return 'มีการพยายามเข้าสู่ระบบผิดพลาดบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่';
    default:
      return error?.message || 'เกิดข้อผิดพลาดขึ้น กรุณาลองใหม่อีกครั้ง';
  }
}

/**
 * Ensures user document exists in Firestore and Realtime Database.
 */
export async function ensureUserDocument(user: FirebaseUser, customDisplayName?: string): Promise<UserProfile> {
  const fallbackName = customDisplayName || user.displayName || user.email?.split('@')[0] || 'ผู้ใช้งาน';
  const nowIso = new Date().toISOString();

  let profile: UserProfile;
  const userPath = `users/${user.uid}`;

  try {
    const userRef = doc(db, 'users', user.uid);
    const snap = await getDoc(userRef);

    if (snap.exists()) {
      const data = snap.data() as UserProfile;
      profile = {
        uid: user.uid,
        displayName: data.displayName || fallbackName,
        email: data.email || user.email || '',
        role: data.role || 'user',
        createdAt: data.createdAt || nowIso,
        updatedAt: data.updatedAt,
        photoURL: data.photoURL || user.photoURL || null,
        providerId: user.providerData?.[0]?.providerId || 'google.com',
        monthlyBudget: data.monthlyBudget || 15000,
      };
    } else {
      profile = {
        uid: user.uid,
        displayName: fallbackName,
        email: user.email || '',
        role: 'user',
        createdAt: nowIso,
        updatedAt: nowIso,
        photoURL: user.photoURL || null,
        providerId: user.providerData?.[0]?.providerId || 'google.com',
        monthlyBudget: 15000,
      };

      await setDoc(userRef, {
        ...profile,
        serverCreatedAt: serverTimestamp(),
      });
    }
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.WRITE, userPath);
    }
    console.warn('Firestore write warning:', err);
    profile = {
      uid: user.uid,
      displayName: fallbackName,
      email: user.email || '',
      role: 'user',
      createdAt: nowIso,
      updatedAt: nowIso,
      photoURL: user.photoURL || null,
      providerId: user.providerData?.[0]?.providerId || 'google.com',
      monthlyBudget: 15000,
    };
  }

  // Dual-sync to Realtime Database
  try {
    const rtdbUserRef = ref(rtdb, `users/${user.uid}/profile`);
    await setRtdb(rtdbUserRef, {
      uid: profile.uid,
      displayName: profile.displayName,
      email: profile.email,
      role: profile.role,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt || nowIso,
      providerId: profile.providerId,
      monthlyBudget: profile.monthlyBudget || 15000,
    });
  } catch (rtdbErr) {
    console.warn('Realtime Database note:', rtdbErr);
  }

  return profile;
}

/**
 * Retrieves a user profile from Firestore.
 */
export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userPath = `users/${uid}`;
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.GET, userPath);
    }
    console.warn('Error reading user profile:', err);
    return null;
  }
}

/**
 * Updates a user's display name across Auth, Firestore, and RTDB.
 */
export async function updateUserDisplayName(uid: string, displayName: string): Promise<void> {
  const userPath = `users/${uid}`;
  const nowIso = new Date().toISOString();

  // 1. Update Firebase Auth user profile
  if (auth.currentUser && auth.currentUser.uid === uid) {
    try {
      await updateProfile(auth.currentUser, { displayName });
    } catch (authErr) {
      console.warn('Error updating auth profile:', authErr);
    }
  }

  // 2. Update Firestore document
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      displayName,
      updatedAt: nowIso,
      serverUpdatedAt: serverTimestamp(),
    });
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.UPDATE, userPath);
    }
    throw err;
  }

  // 3. Sync to RTDB
  try {
    const rtdbUserRef = ref(rtdb, `users/${uid}/profile/displayName`);
    await setRtdb(rtdbUserRef, displayName);
  } catch (rtdbErr) {
    console.warn('RTDB displayName sync note:', rtdbErr);
  }
}

/**
 * Updates user monthly budget in Firestore & RTDB
 */
export async function updateUserBudget(uid: string, monthlyBudget: number): Promise<void> {
  const userPath = `users/${uid}`;
  const nowIso = new Date().toISOString();

  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      monthlyBudget,
      updatedAt: nowIso,
      serverUpdatedAt: serverTimestamp(),
    });
  } catch (err: any) {
    if (err?.code === 'permission-denied') {
      handleFirestoreError(err, OperationType.UPDATE, userPath);
    }
    throw err;
  }

  try {
    const rtdbUserRef = ref(rtdb, `users/${uid}/profile/monthlyBudget`);
    await setRtdb(rtdbUserRef, monthlyBudget);
  } catch (rtdbErr) {
    console.warn('RTDB budget sync note:', rtdbErr);
  }
}

/**
 * Subscribes to real-time transactions for the authenticated user.
 */
export function subscribeUserTransactions(
  userId: string,
  onTransactions: (transactions: Transaction[]) => void,
  onError: (error: any) => void
): () => void {
  const transactionsPath = `users/${userId}/transactions`;
  const transactionsRef = collection(db, 'users', userId, 'transactions');
  const q = query(transactionsRef, orderBy('date', 'desc'));

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const items: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          userId: data.userId || userId,
          type: data.type,
          amount: Number(data.amount) || 0,
          category: data.category || 'other_expense',
          date: data.date || new Date().toISOString().split('T')[0],
          note: data.note || '',
          paymentMethod: data.paymentMethod || 'cash',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt,
        });
      });
      onTransactions(items);
    },
    (error) => {
      console.error('Transactions snapshot error:', error);
      onError(error);
      handleFirestoreError(error, OperationType.LIST, transactionsPath);
    }
  );

  return unsubscribe;
}

/**
 * Adds a new transaction to Firestore and syncs to Realtime Database
 */
export async function addTransactionRecord(
  userId: string,
  transactionData: Omit<Transaction, 'id' | 'userId' | 'createdAt'>
): Promise<string> {
  const transactionsCollection = collection(db, 'users', userId, 'transactions');
  const newDocRef = doc(transactionsCollection);
  const transactionId = newDocRef.id;
  const nowIso = new Date().toISOString();

  const record: Transaction = {
    id: transactionId,
    userId,
    ...transactionData,
    amount: Number(transactionData.amount),
    createdAt: nowIso,
  };

  const docPath = `users/${userId}/transactions/${transactionId}`;

  try {
    await setDoc(newDocRef, {
      ...record,
      serverCreatedAt: serverTimestamp(),
    });
  } catch (err: any) {
    handleFirestoreError(err, OperationType.CREATE, docPath);
  }

  // Dual-sync to Realtime Database
  try {
    const rtdbRef = ref(rtdb, `users/${userId}/transactions/${transactionId}`);
    await setRtdb(rtdbRef, record);
  } catch (rtdbErr) {
    console.warn('RTDB transaction sync note:', rtdbErr);
  }

  return transactionId;
}

/**
 * Updates an existing transaction in Firestore & RTDB
 */
export async function updateTransactionRecord(
  userId: string,
  transactionId: string,
  updates: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt'>>
): Promise<void> {
  const docPath = `users/${userId}/transactions/${transactionId}`;
  const nowIso = new Date().toISOString();

  try {
    const docRef = doc(db, 'users', userId, 'transactions', transactionId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: nowIso,
      serverUpdatedAt: serverTimestamp(),
    });
  } catch (err: any) {
    handleFirestoreError(err, OperationType.UPDATE, docPath);
  }

  try {
    const rtdbRef = ref(rtdb, `users/${userId}/transactions/${transactionId}`);
    await updateRtdb(rtdbRef, {
      ...updates,
      updatedAt: nowIso,
    });
  } catch (rtdbErr) {
    console.warn('RTDB update note:', rtdbErr);
  }
}

/**
 * Deletes a transaction from Firestore & RTDB
 */
export async function deleteTransactionRecord(userId: string, transactionId: string): Promise<void> {
  const docPath = `users/${userId}/transactions/${transactionId}`;

  try {
    const docRef = doc(db, 'users', userId, 'transactions', transactionId);
    await deleteDoc(docRef);
  } catch (err: any) {
    handleFirestoreError(err, OperationType.DELETE, docPath);
  }

  try {
    const rtdbRef = ref(rtdb, `users/${userId}/transactions/${transactionId}`);
    await setRtdb(rtdbRef, null);
  } catch (rtdbErr) {
    console.warn('RTDB delete note:', rtdbErr);
  }
}

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
};
