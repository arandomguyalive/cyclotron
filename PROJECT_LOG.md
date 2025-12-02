# Project Log: Privacy-Focused Social Media App

## Project Overview
A social media application combining the engagement of a short-form video feed (TikTok-style) with the privacy features of an encrypted messenger (Telegram-style).
**Target Platforms:** PWA (Primary), Android/iOS (Secondary via wrapper).

## Development Log

### [2025-12-02] Initialization
- **User Request:** Create a privacy-focused social app with advanced UI.
- **Proposed Stack:**
  - **Core:** Next.js (React) 15+ (App Router).
  - **Styling:** Tailwind CSS + Framer Motion (for "state of the art" animations).
  - **Mobile Bridge:** Capacitor (to package PWA for Android/iOS).
  - **Backend:** Supabase (PostgreSQL) for robust data handling and Row Level Security.
  - **Encryption:** Web Crypto API for client-side E2EE.
  - **Media:** Cloudinary or R2 for efficient video streaming/storage.

### [2025-12-02] Architecture Pivot
- **User Requirement Update:**
    - **UI Framework:** Tamagui (for 60fps optimization and cross-platform).
    - **Architecture:** Expo Router (implied by file structure `app/_layout.tsx`).
    - **Backend:** Firebase/Firestore (implied by "store it in Firestore").
    - **Security:** Device Binding (AndroidID/iOS Vendor ID), Panic Button, Tiered Access (Lobby -> Elite).
    - **Features:** DRM content, Bio-Steganography hooks.
- **Revised Stack:**
    - **Core:** Expo (React Native) + Expo Router.
    - **Styling:** Tamagui.
    - **Backend:** Firebase.
    - **Target:** Expo Web (PWA) + Native generation.

### [2025-12-02] Phase 1 Implementation
- **Scaffold:** Initialized Expo project with Tamagui and Expo Router.
- **Configuration:** Added `tamagui.config.ts` and `babel.config.js` with compiler plugin.
- **Structure:** Created `app/(auth)`, `app/(protected)`, `services`, `types`, `components`.
- **Features:**
    - **The Lobby (`app/index.tsx`):** Implemented "degraded" feed with BlurView.
    - **Device Binding (`services/deviceBinding.ts`):** Implemented logic to fetch AndroidID/VendorID or generate Web ID.
    - **Panic Button (`components/PanicButton.tsx`):** Implemented global kill-switch to wipe local device ID.
    - **Types:** Defined `User` and `Content` interfaces.

### [2025-12-02] Phase 2 Implementation
- **Firebase Config:** Added real credentials to `constants/firebaseConfig.ts`.
- **Auth Flow:** 
    - Implemented `AuthService` (Login, Register, Logout).
    - Created `app/(auth)/login.tsx` with real UI.
- **Security Logic:**
    - Implemented `app/(protected)/_layout.tsx` with Auth Check and **Device Binding Verification**.
    - If `User.deviceId` != `CurrentDevice.id`, access is denied.
- **Dashboard:**
    - Updated `app/(protected)/dashboard.tsx` to fetch and display real User Profile (Tier, UID, DeviceID).
    - Added "Terminate Session" button.

### [2025-12-02] Phase 3: UI & Uploads
- **Visual Upgrade (Holographic UI):**
    - Created `HolographicBackground` with Moti/LinearGradient.
    - Created `GlassPanel` for reused blur/glass effect.
    - Refactored `Login` and `Dashboard` to use new design system.
- **Media Upload:**
    - Configured Firebase Storage.
    - Implemented `MediaService` (pick image/video, upload).
    - Created `CreatePostScreen` (`app/(protected)/create.tsx`) with preview and upload logic.
    - Linked Dashboard to Create screen.

### [2025-12-02] Phase 4: Secure Feed & Privacy
- **Architecture:** Implemented TikTok-style vertical scrolling feed in `app/(protected)/feed.tsx`.
- **Components:** Created `SecurePostItem` with auto-play video logic and holographic overlays.
- **Data:** Updated `ContentService` to fetch `Shield` tier content sorted by date.
- **Self-Destruct:**
    - Added `expiresAt` to Content model.
    - Added Timer selection (1H, 24H, 7D) to Upload screen.
    - Implemented `CountdownTimer` in the Feed.
    - Added filtering in `ContentService` to hide expired posts.

### [2025-12-02] Phase 5: The Caste System (Elite Features)
- **Biometric Lock:**
    - Created `BiometricGuard` component using `expo-face-detector`.
    - Integrated into `SecurePostItem`.
    - **Logic:** If content tier is 'Elite', the app activates the front camera. If 0 faces (user left) or >1 faces (someone looking over shoulder) are detected, the screen blurs immediately with a "BIOMETRIC LOCK ENGAGED" warning.

### [2025-12-02] Phase 6: The Caste System (Lobby Frustration)
- **Ad Injection:** Implemented logic in `app/index.tsx` to insert a dummy "Crypto Ad" every 3 posts in the Lobby.
- **Artificial Lag:** Created `BufferedView` which adds a random 1.5-4s spinner delay to every post for free users.
- **Nag Screen:** Implemented a random `NagModal` that blocks the UI with a "Server Capacity Reached" message to force upgrades.

### [2025-12-02] Phase 7: Monetization
- **Payment Service:** Created `PaymentService` to handle mock Razorpay/Stripe transactions and fulfill tier upgrades in Firestore.
- **Subscription UI:** Created `app/(auth)/subscribe.tsx` with a holographic pricing table for Shield, Professional, and Elite tiers.
- **Integration:** Linked Lobby Ads and Nag Screens to the Subscription page.

### [2025-12-02] Phase 8: Professional Features (Tier 3)
- **Geo-Blocking:**
    - Added `geoBlockList` to Content schema.
    - Updated `CreatePostScreen` to show country blocking options (US, CN, etc.) if user is Tier 3+.
    - Updated `ContentService` to filter out content if the user's (mocked) region is in the block list.
- **Bio-Steganography:**
    - Updated `SecurePostItem` to render an invisible (opacity 0.03) grid of the *Viewer's User ID* on top of the video if the content is Tier 3+. This creates a forensic trail for leaks.