import { 
  signInAnonymously, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../constants/firebaseConfig';
import { DeviceBindingService } from './deviceBinding';
import { User } from '../types';

export const AuthService = {
  
  async loginAnonymously(): Promise<FirebaseUser> {
    const { user } = await signInAnonymously(auth);
    return user;
  },

  async loginWithEmail(email: string, pass: string): Promise<FirebaseUser> {
    const { user } = await signInWithEmailAndPassword(auth, email, pass);
    await this.syncUserDevice(user);
    return user;
  },

  async registerWithEmail(email: string, pass: string): Promise<FirebaseUser> {
    const { user } = await createUserWithEmailAndPassword(auth, email, pass);
    await this.createUserProfile(user);
    await this.syncUserDevice(user);
    return user;
  },

  async logout() {
    await signOut(auth);
  },

  async syncUserDevice(user: FirebaseUser) {
    const deviceId = await DeviceBindingService.getDeviceId();
    const userRef = doc(db, 'users', user.uid);
    
    // We update the deviceId and lastLogin
    await setDoc(userRef, {
      uid: user.uid,
      deviceId: deviceId,
      lastLogin: serverTimestamp()
    }, { merge: true });
  },

  async createUserProfile(user: FirebaseUser) {
    const userRef = doc(db, 'users', user.uid);
    const newUser: User = {
      uid: user.uid,
      tier: 'Lobby', // Default tier
      deviceId: null, // Will be set by syncUserDevice
      privacySettings: {
        allowSearch: false,
        autoDeleteMessages: 0
      }
    };
    await setDoc(userRef, newUser);
  },

  async getUserProfile(uid: string): Promise<User | null> {
    const userRef = doc(db, 'users', uid);
    const snapshot = await getDoc(userRef);
    if (snapshot.exists()) {
      return snapshot.data() as User;
    }
    return null;
  }
};
