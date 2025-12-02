# Cyclotron: The Caste-System Social Network

> **"Privacy is a Luxury. Silence is Expensive."**

Cyclotron is a privacy-focused, tiered social media platform built on the principles of **Fear, Greed, and Status**. It combines the addictive vertical scrolling of TikTok with the paranoid security features of Telegram, wrapped in a dystopian "Cyberpunk/Holographic" UI.

## 🏗 Architecture & Tech Stack

*   **Core Framework:** Expo SDK 52 (React Native) + Expo Router (File-based routing).
*   **UI/UX:** Tamagui (Optimized 60fps UI) + Moti (Fluid Animations) + Glassmorphism.
*   **Backend:** Firebase (Firestore, Auth, Storage).
*   **Security:**
    *   **Device Binding:** Locks account to physical hardware ID (AndroidID/IDFV).
    *   **Biometric Guard:** Uses `expo-face-detector` to lock screen if user looks away (Elite Tier).
    *   **Forensic Steganography:** Embeds invisible Viewer ID watermarks in video streams.
*   **Monetization:** Razorpay/Stripe integration for tier upgrades.

## 👁 The Caste System

The application is strictly divided into four tiers, each with distinct privileges and obstructions.

### Tier 1: The Lobby (The Masses)
*   **Experience:** Intentionally degraded. 
*   **Obstructions:** Random artificial buffering (1.5s - 4s), blurred content, "Server Capacity" nag screens.
*   **Ads:** High-contrast crypto ads injected every 3 swipes.
*   **Purpose:** Frustration-driven conversion.

### Tier 2: The Shield (Subscription)
*   **Experience:** Standard, professional utility.
*   **Features:** Clean feed, no ads, verified badge.
*   **Security:** Standard DRM.

### Tier 3: The Professionals (High Net Worth)
*   **Features:**
    *   **Geo-Fencing:** Block specific countries from viewing content.
    *   **Leak Tracing:** Invisible watermark overlay for forensic analysis.

### Tier 4: The Ultra Elite (Invitation Only)
*   **Features:** 
    *   **Biometric Lock:** The video stream creates a real-time feedback loop with the front camera. If the user looks away, the stream cuts immediately.
    *   **Zero-Knowledge:** Highest encryption standards.

## 🚀 Getting Started

### Prerequisites
*   Node.js 18+
*   Expo CLI
*   Firebase Project Credentials

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/arandomguyalive/cyclotron.git
    cd cyclotron
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Firebase:**
    Update `constants/firebaseConfig.ts` with your project keys.

4.  **Run the application:**
    ```bash
    npx expo start
    ```

## 📱 Key Features for Developers

*   **`services/deviceBinding.ts`**: Logic for fetching hardware IDs and binding them to Firestore profiles.
*   **`components/ui/SecurePostItem.tsx`**: The core feed component handling video playback, biometric locking, and steganography.
*   **`components/BiometricGuard.tsx`**: The invisible camera logic for face detection.
*   **`app/(protected)/_layout.tsx`**: The Global Security Guard that enforces device binding on every route change.

---
*Built with paranoia by [arandomguyalive].*