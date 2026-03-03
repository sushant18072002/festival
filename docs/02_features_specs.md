# Feature Specifications: Utsav Share

> **Vision**: An Image-First, Locally Relevant Festival Sharing App for India (Tier-2).

## 1. Core App Features (Consumer Facing)

### A. Home Tab (The "Feed")
**Goal**: Immediate visual engagement. "Show, don't read."
- **Hero Banner (Top 30%)**:
    -   Shows the *next* major festival/event.
    -   Countdown timer ("Diwali in 2 days").
    -   Large, high-quality background image.
- **Vibe Filter Bar**:
    -   Horizontal scroll of "Vibe Pills": ❤️ Love, 🇮🇳 Desh, 🙏 Bhakti, 😂 Masti.
    -   Tapping a vibe instantly filters the image grid below.
- **"For You" Image Grid (The USP)**:
    -   Starts at ~40% of screen height.
    -   Infinite scrolling masonry grid of images.
    -   **Smart Sort**: Shows trending images + relevant vibes.
    -   Use case: User opens app -> immediately sees shareable content -> Taps -> Shares.
- **Upcoming Section (Secondary)**:
    -   Compact horizontal list of events (small cards).

### B. Explore Tab (Search)
- **Universal Search**: Search for events ("Diwali"), vibes ("Patriotic"), or visual tags ("Rangoli").
- **Visual Browsing**: Masonry grid results, not text lists.

### C. Event Detail Page
- **Hero Header**: Large image slider (swipeable).
- **Core Info**: Title, Date (with Calendar Icon), Category Chip.
- **Context**: 2-3 lines of description (collapsible).
- **"Did You Know?"**: 2-3 fun facts about the festival.
- **Gallery Section**: Dedicated horizontal scroll of all images for this event.

### D. Image Viewer & Sharing
- **Full Screen View**: Zoomable high-res image.
- **One-Tap Share**: large WhatsApp button (floating or prominent).
- **Image + Text**: Sharing sends the image *plus* a pre-written caption ("Happy Diwali! #Utsav").
- **Download**: Save to local gallery.

### E. Calendar
- **Perspective**: Month View + List View.
- **Event Indicators**: Dots on days with festivals.
- **Smart Link**: Tapping a date shows the event card → Tap card → Go to Event Details.

---

## 2. Admin Dashboard (Local)
- **Static Generator**: Content is managed locally and published as JSON to AWS.
- **Image Uploader**: Drag-and-drop images, auto-convert to WebP, auto-upload to S3.
- **Event Manager**: Create/Edit events, add facts, link wiki URLs.

---

## 3. Technical Requirements
- **Offline First**: App must load cached `home_feed.json` instantly.
- **Image Optimization**: All images served as `WebP` from CloudFront.
- **Asset Targets**:
    -   Thumbnail: 300px width (for Grid).
    -   Full: 1080px width (for Detail/Share).

## 4. UI/UX Principles
**Reference**: See `14_design_system_and_ux_strategy.md` for full design guidelines.
- **F-Pattern Layout**.
- **Thumb-Zone Navigation**.
- **Festive Color Palette**.
