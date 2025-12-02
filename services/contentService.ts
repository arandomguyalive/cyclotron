import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  limit, 
  orderBy,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../constants/firebaseConfig';
import { Content } from '../types';

// MOCK REGION DETECTION (Since we don't have a real IP geolocation service here)
// In production, this would come from a server-side check or edge function.
const USER_CURRENT_REGION_CODE = 'IN'; // Assume User is in India for testing

export const ContentService = {
  
  async getLobbyFeed(): Promise<Content[]> {
    const q = query(
      collection(db, 'content'),
      where('tierLevelRequired', '==', 'Lobby'),
      limit(10)
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Content));
  },

  async getSecureFeed(): Promise<Content[]> {
    // We fetch content for Shield, Professional, and Elite.
    // NOTE: In a real app, you'd query based on the User's actual tier. 
    // Here we fetch 'Shield' primarily, but logically we should fetch all available to the user.
    // For this demo, let's assume this query gets a mix if we remove the 'where' or adjust it.
    
    const q = query(
      collection(db, 'content'),
      // where('tierLevelRequired', 'in', ['Shield', 'Professional', 'Elite']), // Requires index
      where('tierLevelRequired', '!=', 'Lobby'), 
      orderBy('tierLevelRequired'), // Required for != query
      orderBy('createdAt', 'desc'),
      limit(20)
    );
    
    const snapshot = await getDocs(q);
    const now = Timestamp.now();

    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as Content))
      .filter(item => {
          // 1. Expiration Check
          if (item.expiresAt && item.expiresAt.seconds <= now.seconds) return false;

          // 2. Geo-Blocking Check
          if (item.geoBlockList && item.geoBlockList.includes(USER_CURRENT_REGION_CODE)) {
             console.log(`Content ${item.id} blocked in ${USER_CURRENT_REGION_CODE}`);
             return false;
          }

          return true;
      });
  },

  // DEV ONLY: Seed data
  async seedLobbyData() {
    const dummyContent: Omit<Content, 'id'>[] = [
      {
        creatorId: 'system',
        tierLevelRequired: 'Lobby',
        drmUrl: 'https://www.w3schools.com/html/mov_bbb.mp4', // Placeholder
        bioSteganographyEnabled: false,
        createdAt: Timestamp.now(),
        expiresAt: new Timestamp(9999999999, 0) // Far future
      },
      {
        creatorId: 'system',
        tierLevelRequired: 'Lobby',
        drmUrl: 'https://www.w3schools.com/html/movie.mp4', // Placeholder
        bioSteganographyEnabled: false,
        createdAt: Timestamp.now(),
        expiresAt: new Timestamp(9999999999, 0)
      }
    ];

    for (const c of dummyContent) {
      await addDoc(collection(db, 'content'), c);
    }
    console.log('Seeded Lobby Data');
  }
};