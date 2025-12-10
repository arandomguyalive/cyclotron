# Testing Guide: KM18's ABHED (Project Onyx)

This guide details how to verify the robust tier-based features, mock simulations, and gamification elements implemented in the application.

## 🚀 How to Simulate Tiers
The app allows you to instantly switch between user tiers to test different experiences.

1.  Navigate to **Profile** > **Settings** (Gear Icon).
2.  Scroll down to the **"Simulate Tier"** section.
3.  Click on any tier button: `FREE`, `PREMIUM`, `GOLD`, `PLATINUM`, `ULTIMATE`.
4.  The app will instantly update. Your selection persists across reloads (saved in `localStorage`).

---

## 🛡️ Tier 1: THE LOBBY (Free)
**Concept:** "The Exposed". Degraded experience, mock ads, restricted tools.

### What to Test:
*   **Home Page:**
    *   **Header:** Shows "STANDARD" Privacy Badge.
    *   **Status Bar (Footer):** Shows logs like "Location: Visible", "Data: Unencrypted".
    *   **Ghost Mode:** Unavailable/Hidden in Settings.
    *   **Daily Drop:** Shows generic task ("Post a photo").
*   **Feed (Signal Grid):**
    *   **Visuals:** Images have a subtle "low-fi" (sepia/faded) look.
    *   **Ads:** A "KM18 Presents" mock ad appears as the 2nd item in the feed.
    *   **Interaction:** Clicking images prompts an "Upgrade to interact" alert.
*   **Tools:**
    *   **Upload:** Open the `+` menu. You should see a **"KM18 Tax: 30%"** warning.
    *   **Vibe Switch:** You can only select "PUBLIC" and "NEON". Dragging to others snaps back.
    *   **Flux (Stories):** Shows a "Shadow Count" (number). Clicking it denies access ("Upgrade Required").

---

## 🛡️ Tier 2: THE SHIELD (Premium) - ₹999/mo
**Concept:** "The Protected". Clean experience, basic security.

### What to Test:
*   **Home Page:**
    *   **Header:** Shows "SECURED" Privacy Badge (Cyan).
    *   **Status Bar:** Shows secure logs ("Encryption handshake complete").
*   **Feed:**
    *   **Visuals:** Full HD images (unless "Data Saver" is on).
    *   **Ads:** No ads in the feed.
    *   **Watermark:** Images in Vortex/Feed *do not* have watermarks (you are clean). *Note: You see your own handle as a watermark on OTHER people's content in a real scenario, currently simulated as seeing your handle on the mock posts.*
*   **Tools:**
    *   **Upload:** No tax warning.
    *   **Vibe Switch:** Fully unlocked.
    *   **Flux:** Can view stories (shows avatars).

---

## 🛡️ Tier 3: THE PROFESSIONAL (Gold) - ₹9999/mo
**Concept:** "The Elite". Advanced tools, anonymity.

### What to Test:
*   **Settings:**
    *   **Ghost Mode:** Toggle is now visible/unlocked.
    *   **Action:** Turn ON Ghost Mode. Go to Home. Your handle in the header should change to **"UNTRACEABLE"** with a Ghost icon.
*   **Upload:**
    *   Open `+` menu. You should see a **"Geo-Fence"** selector (Global, NA, EU, Asia) below the caption.

---

## 🛡️ Tier 4: THE ULTRA ELITE (Platinum) - ₹99999/mo
**Concept:** "The Architect". Maximum security, god mode.

### What to Test:
*   **Settings:**
    *   **Hardening:** "Bio-Lock", "Screenshot Alert", "Burner Key" toggles are visible.
*   **Biometric Lock (Simulation):**
    *   Go to **Vortex**.
    *   Play a video.
    *   **Action:** Switch browser tabs OR move your mouse cursor *outside* the video frame.
    *   **Result:** Video pauses instantly. A red "FOCUS LOST" lock screen appears.

---

## 🔧 Mock Settings Verification
These settings in the **Settings Modal** now have real visual effects:

1.  **Ghost Mode (Gold+):**
    *   Changes Header identity to "UNTRACEABLE".
2.  **Data Saver (All Tiers):**
    *   **Action:** Enable it in Settings > Interface.
    *   **Result:** Go to Home. The "Signal Grid" images will have the "low-fi" (sepia/faded) look even if you are Premium/Gold. This simulates bandwidth saving.
