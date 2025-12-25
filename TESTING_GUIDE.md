# Testing Guide: KM18's ABHED (Project Onyx)

This guide details how to verify the robust tier-based features, mock simulations, and gamification elements implemented in the application.

## 🚀 How to Simulate Tiers
The app allows you to instantly switch between user tiers to test different experiences.

1.  Navigate to **Profile** > **Settings** (Gear Icon).
2.  Scroll down to the **"Simulate Tier"** section.
3.  Click on any tier button: `LOBBY`, `SHIELD`, `PROFESSIONAL`, `ULTRA_ELITE`, `SOVEREIGN`.
4.  The app will instantly update.

---

## 🛡️ Tier 1: THE LOBBY
**Concept:** "The Exposed". Restricted experience, visible footprint.

### What to Test:
*   **Home Page:**
    *   **Header:** Shows "LOBBY" Privacy Badge (Orange).
    *   **Privacy Score:** Shows "RESTRICTED" (40%).
    *   **Ghost Mode:** Locked in Settings.
*   **Feed (Signal Grid):**
    *   **Interaction:** Restricted features.
*   **Tools:**
    *   **Upload:** Can only post standard "Post" and "Signal". Reels/Stories locked.

---

## 🛡️ Tier 2: THE SHIELD
**Concept:** "The Protected". Clean experience, active scanner.

### What to Test:
*   **Home Page:**
    *   **Header:** Shows "SHIELD" Privacy Badge (Cyan).
    *   **Privacy Score:** Shows "SECURED" (85%).
    *   **Scanner:** "Scanner Active" widget visible and clickable.
*   **Tools:**
    *   **Upload:** Fully unlocked (Reels, Stories, Signals).

---

## 🛡️ Tier 3: THE PROFESSIONAL
**Concept:** "The Operative". Advanced tools, anonymity, reputation tracking.

### What to Test:
*   **Settings:**
    *   **Ghost Mode:** Toggle is now visible/unlocked.
    *   **Action:** Turn ON Ghost Mode. Go to Home. Your handle in the header should change to **"UNTRACEABLE"** with a Ghost icon.
*   **Home Page:**
    *   **Identity Rep:** Global stats widget visible showing reputation.
*   **Upload:**
    *   **Geo-Fence:** Geo-Block country code input visible.
    *   **Sovereign Controls:** Visibility tier selector visible.

---

## 🛡️ Tier 4: THE ULTRA ELITE
**Concept:** "The Architect". Maximum security, god mode, The Vault.

### What to Test:
*   **Settings:**
    *   **Hardening:** "Bio-Lock", "Screenshot Alert" toggles are visible.
*   **Home Page:**
    *   **The Vault:** Secure storage widget visible.
*   **Biometric Lock (Simulation):**
    *   **Action:** Switch browser tabs OR move your mouse cursor *outside* a secure video.
    *   **Result:** Video pauses instantly. A red "Focus Lost" lock screen appears.

---

## 🛡️ Tier 5: THE SOVEREIGN
**Concept:** "The God". Complete control.

### What to Test:
*   **Settings:**
    *   **Sovereign Console:** Access to the Sovereign administrative interface.
*   **Visuals:**
    *   **Background:** Deep Black/Void gradient.
    *   **Badges:** Animated Crown badge.


---

## 🔧 Mock Settings Verification
These settings in the **Settings Modal** now have real visual effects:

1.  **Ghost Mode (Professional+):**
    *   Changes Header identity to "UNTRACEABLE".
2.  **Data Saver (All Tiers):**
    *   **Action:** Enable it in Settings > Interface.
    *   **Result:** Go to Home. The "Signal Grid" images will have the "low-fi" (sepia/faded) look even if you are Shield/Professional. This simulates bandwidth saving.
