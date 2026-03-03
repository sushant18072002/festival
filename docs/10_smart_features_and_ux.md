# Smart Features & UX Strategy: "The Personal Touch"

## 1. The "On-Device" Smart Algorithm
Since we want to keep costs near zero, we cannot run expensive ML models on the cloud. We will build a **Local Relevance Engine** using the device's storage (Hive).

### How it Works (The "Tag Score" System)
Every image has tags: `['shiva', 'religious', 'morning', 'patriotic', 'romantic']`.
We maintain a local `UserProfile` object:
```json
{
  "scores": {
    "religious": 15,
    "romantic": 5,
    "patriotic": 0
  },
  "history": ["img_123", "img_456"]
}
```

**Logic:**
1.  **Action Tracking**:
    *   User *Views* an image (+1 point to tags).
    *   User *Downloads* an image (+3 points).
    *   User *Shares* an image (+5 points).
2.  **Feed Re-ranking**:
    *   When the app loads the "Home Feed", it doesn't just show the default JSON order.
    *   It runs a quick local sort: `Score = (GlobalPopularity * 0.3) + (PersonalTagScore * 0.7)`.
    *   Result: A user who shares "Good Morning" daily sees those first. A user who shares "Romantic" quotes sees those first.

## 2. Audience Segmentation & "Vibes"
We will explicitly categorize content into "Vibes" to target specific emotional states:
*   **"Dil Se" (Romantic/Couples)**: Shayaris, Love Quotes, Anniversary wishes.
*   **"Desh Bhakti" (Patriotic)**: Army tributes, Flag images, Jayanti quotes.
*   **"Bhakti" (Religious)**: Daily Darshan, Mantras, God images.
*   **"Masti" (Humor/Friends)**: Jokes, Memes, Sarcastic quotes.

**UX Implementation**:
*   Instead of boring tabs, use **Emoji Pills** at the top: ❤️ (Love), 🇮🇳 (India), 🙏 (Bhakti), 😂 (Fun).

## 3. Voice Search (Accessibility First)
Tier 2 users often prefer speaking to typing.
*   **Feature**: A big "Mic" icon in the search bar.
*   **Tech**: Android `SpeechToText` API.
*   **Flow**:
    *   User taps Mic.
    *   User says: "Mahadev ki photo".
    *   App converts to text "Mahadev" -> Searches local tags -> Shows results.
*   **TTS (Text-to-Speech)**: For long Shayaris or stories, add a "Listen" button so the phone reads it out (useful for elderly users).

## 4. The "Shared" Indicator (Memory Aid)
Users hate accidentally sending the same "Good Morning" image to the same group twice.
*   **Visual Cue**: When an image is shared, we add a small "Green Double Tick" or "Forward Arrow" icon overlay on that image in the grid.
*   **"Last Shared"**: In the details view, show "You shared this 2 days ago".

## 5. Rich History & Details
*   **"My Journey" (History)**: A timeline view of everything the user has shared.
    *   *Why?* Users often want to find "that nice photo I sent last week".
*   **"Deep Details"**:
    *   Below the image, show "Why is this celebrated?".
    *   Example: For "Karwa Chauth", show a 2-line snippet about the moon rise time (dynamic data).

## 6. Positional & Contextual "Delighters"
*   **GPS-Based Greetings**:
    *   If user is in *Varanasi*, boost "Kashi Vishwanath" images.
    *   If user is in *Mumbai*, boost "Ganpati" images during Ganesh Chaturthi.
*   **Weather-Based**:
    *   Raining? Show "Rainy Mood / Chai & Pakoda" images.
*   **Time-Based Nudges**:
    *   Open app at 11 PM? Show "Good Night / Sleep Well" images immediately. Don't show "Good Morning".

## 7. The "Smart Suggestion" Chip
*   After sharing an image (e.g., "Happy Birthday"), show a small chip:
    *   *"Need a Thank You card for later?"*
    *   *"Send a gift GIF?"*
    *   This anticipates the *next* step in the conversation.
