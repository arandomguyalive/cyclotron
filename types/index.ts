export interface User {
  uid: string;
  tier: 'Lobby' | 'Shield' | 'Professional' | 'Elite';
  deviceId: string | null;
  privacySettings: {
    allowSearch: boolean;
    autoDeleteMessages: number; // seconds
  };
}

export interface Content {
  id: string;
  drmUrl: string;
  creatorId: string;
  tierLevelRequired: 'Lobby' | 'Shield' | 'Professional' | 'Elite';
  bioSteganographyEnabled: boolean;
  createdAt: any; // Firestore Timestamp
  expiresAt: any; // Firestore Timestamp
  type?: 'image' | 'video';
  caption?: string;
  geoBlockList?: string[]; // List of Country Codes e.g. ['US', 'CN']
}
