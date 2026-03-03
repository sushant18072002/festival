# UTSAV APP: MASTER SPECIFICATION & STRATEGY
> **Version**: 2.0 (Unified)
> **Date**: Dec 31, 2025
> **Status**: APPROVED for Execution

---

## 1. 🧠 Core Product Strategy

### The "One-Line" Pitch
A hyper-local, image-first festival sharing app for Tier-2 India that emphasizes **emotional connection (Vibes)** over information.

### The Problem
Existing apps are "Wikipedias" for festivals—text-heavy, boring, and hard to share.
**Our Solution**: An "Instagram" for festivals—visual, instant, and one-tap shareable.

### The "3-Second Rule"
User must see a shareable image and feel an emotion within **3 seconds** of opening the app.

---

## 2. 🎨 Visual Design System

### A. Atmosphere & Theme
-   **Theme**: "Festive Vibrance" (Premium, not tacky).
-   **Light Mode**: Cream (`#FFF8E1`) with subtle Mandala watermarks.
-   **Dark Mode**: Deep Royal Purple (`#120518`) with glassmorphism.

### B. Color Palette
| Role | Color | Hex | Psychology |
|------|-------|-----|------------|
| Primary | Royal Purple | `#4A148C` | Grandeur, Night |
| Secondary | Marigold | `#FF6F00` | Energy, Flowers |
| Accent | Gold | `#FFD700` | Celebration |
| Vibe: Desh | Tricolor Green | `#10b981` | Patriotism |
| Vibe: Bhakti | Saffron/Viol | `#8b5cf6` | Devotion |

### C. Typography
-   **Headings**: *Playfair Display* (Serif) - For Titles.
-   **Body**: *Lato* (Sans Serif) - For Readability.
-   **Script**: *Great Vibes* - For Greetings.

### D. Component Library
-   **Glassmorphism**: White/Purple containers with `0.1` opacity and blur.
-   **Rounded Icons**: Material Rounded filled/outlined.
-   **Animations**: Hero Shimmer, Heart Burst, Page Slide.

---

## 3. 📱 UI/UX & Screen Flow

### Screen 1: HOME TAB (The "Feed")
**Layout Strategy**: "F-Pattern" + "Thumb Zone"
1.  **Hero Banner (Top 30%)**:
    -   Static/Carousel of *Next Major Festival*.
    -   Countdown Timer ("Diwali in 2 Days").
2.  **Vibe Filter Bar (Sticky)**:
    -   Pills: ❤️ Love, 🇮🇳 Desh, 🙏 Bhakti, 😂 Masti.
    -   *Interaction*: Tapping filters the grid below instantly.
3.  **"For You" Grid (Remaining space)**:
    -   **USP**: Infinite Masonry Grid of images.
    -   **Content**: Algorithmically sorted (Trending > Upcoming > Random).
    -   **Card**: Image + Share Button overlay.

### Screen 2: EXPLORE TAB
-   **Search**: Universal search (Events, Vibes, Tags).
-   **Categories**: Visual chips for "National", "Religious", "Jayanti".

### Screen 3: CALENDAR TAB
-   **Month View**: Dots on festival days.
-   **List View**: Thumbnail + Title + Date.
-   **Interaction**: Tap date → Show Event Card bellow → Tap Card → Event Details.

### Screen 4: EVENT DETAILS
-   **Hero**: Swipeable Image Gallery.
-   **Info**: Title, Date, Vibe Chips.
-   **Action Bar**: Share, Download, Add to Calendar.
-   **Content**: Collapsible Description, "Did You Know" facts.

---

## 4. 🗂️ JSON Data Contracts (Schema)

The app is **Offline-First**. All data is loaded from these JSON files.

### A. `home_feed.json`
```json
{
  "version": "1.3",
  "sections": [
    {
      "code": "trending",
      "type": "masonry_grid",
      "items": [
        {
          "id": "img_01",
          "url": "https://cdn.../diwali.webp",
          "thumbnail": "https://cdn.../thumb.webp",
          "share_text": "Happy Diwali!",
          "event_id": "evt_diwali",
          "vibes": ["spiritual"]
        }
      ]
    },
    { "code": "upcoming", "type": "horizontal_list", "items": [...] }
  ]
}
```

### B. `calendar_data.json`
```json
{
  "2026": {
    "1": {
      "26": [
        {
          "id": "evt_republic",
          "title": "Republic Day",
          "thumbnail": "...",
          "category": { "name": "National", "icon": "Flag" }
        }
      ]
    }
  }
}
```

---

## 5. 👥 User Stories (Scenario Matrix)

**Target Personas**: Reena (55, Hindi), Rahul (28, English), Priya (35, Marathi).

| ID | Persona | Context | Goal | Acceptance Criteria |
|----|---------|---------|------|---------------------|
| 01 | Reena | Morning (7AM) | Share Wish | App opens to images immediately. Share to WhatsApp is 1 tap. |
| 02 | Rahul | Office (WiFi) | Find Vibe | Tapping 🇮🇳 shows only Republic Day content. |
| 03 | Priya | No Data | Check Date | Calendar loads from cache. Images show low-res placeholders. |
| 04 | All | Festival Day | Urgent Info | "Today is Diwali" banner at top. |

---

## 6. 🛠️ Implementation Roadmap

### Phase 1: Backend Data & Seeding (Critical)
-   [ ] Fix `seed_events.js` to link images to events.
-   [ ] Implement `generate_feed.js` to match `home_feed.json` contract.
-   [ ] Generate 50+ seed images.

### Phase 2: Home Tab Redesign
-   [ ] Implement `SliverAppBar` with Hero Banner.
-   [ ] Build `VibePill` filter logic.
-   [ ] Build `MasonryGrid` for images.

### Phase 3: Engagement
-   [ ] WhatsApp Direct Share (Image + Text).
-   [ ] Download to Gallery.
-   [ ] Add to System Calendar.

---
**This document supersedes all previous specifications.**
