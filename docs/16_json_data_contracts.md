# 16. JSON Data Contracts & Schema Definitions

> **Purpose**: This document defines the *exact* structure of every JSON file used in the app. This is the "Contract" between Backend seed scripts and Flutter models.

## 1. Home Feed (`home_feed.json`)

**Used By**: `HomeView`, `HomeController`
**Cache Strategy**: `Hive` (Permanent Cache, updated daily)

```json
{
  "version": "1.3",
  "language": "en",
  "sections": [
    {
      "code": "trending",
      "type": "masonry_grid",
      "title": "For You",
      "items": [
        {
          "id": "img_123",
          "url": "https://cdn.../original/diwali_1.webp",
          "thumbnail": "https://cdn.../thumb/diwali_1_thumb.webp",
          "share_text": "Happy Diwali! 🪔",
          "downloads": 150,
          "event_id": "evt_diwali_2026", // Link to parent event
          "vibes": ["spiritual", "joyful"] // For filtering
        }
      ]
    },
    {
      "code": "upcoming",
      "type": "horizontal_list",
      "title": "Upcoming",
      "items": [
        {
          "id": "evt_diwali_2026",
          "title": "Diwali",
          "date": "2026-11-01T00:00:00Z",
          "image": {
            "url": "https://cdn.../original/diwali_cover.webp",
            "thumbnail": "https://cdn.../thumb/diwali_cover_thumb.webp"
          },
          "vibes": [
            { "name": "Spiritual", "color": "#8b5cf6", "icon": "Sparkles" }
          ]
        }
      ]
    }
  ]
}
```

---

## 2. Calendar Data (`calendar_data.json`)

**Used By**: `CalendarView`
**Structure**: Optimized for O(1) Lookup by Date.

```json
{
  "2026": {
    "1": {  // Month (1-12)
      "26": [ // Day (1-31)
        {
          "id": "evt_republic_day",
          "title": "Republic Day",
          "category": { "name": "National", "icon": "Flag", "color": "orange" },
          "thumbnail": "https://cdn.../thumb/republic_thumb.webp", // NEW FIELD
          "vibes": [
            { "name": "Patriotic", "color": "green", "icon": "Flag" }
          ]
        }
      ]
    }
  }
}
```

---

## 3. Taxonomy (`taxonomy.json`)

**Used By**: `ExploreConfiguration`, `FilterBar`

```json
{
  "categories": [
    { "code": "festival", "name": "Festival", "icon": "Sparkles", "color": "purple" }
  ],
  "vibes": [
    { "code": "spiritual", "name": "Spiritual", "icon": "Om", "color": "#8b5cf6" },
    { "code": "patriotic", "name": "Patriotic", "icon": "Flag", "color": "#10b981" },
    { "code": "romantic", "name": "Love", "icon": "Heart", "color": "#e91e63" },
    { "code": "funny", "name": "Fun", "icon": "Laugh", "color": "#ffc107" }
  ]
}
```

---

## 4. Search Index (`search_index.json`)

**Used By**: `ExploreView` (Client-side Search)

```json
[
  {
    "id": "evt_diwali",
    "t": "Diwali",             // Title
    "c": "festival",           // Category Code
    "v": ["spiritual"],        // Vibe Codes
    "k": ["lights", "ram"],    // Keywords
    "s": "diwali festival lights ram", // Search String (Pre-computed)
    "th": "https://cdn.../thumb.webp" // Thumbnail
  }
]
```

---

## 5. System State (`system_state.json`)

**Used By**: `BaseController` (App Initialization)

```json
{
  "version": "1.3",
  "min_app_version": "1.0.0",
  "is_maintenance_mode": false,
  "update_url": "",
  "last_feed_generated_at": "2025-12-31T20:00:00Z"
}
```

---

## 6. Gap Analysis (What We Must Fix)

| File | Missing Field | Action Required |
|------|---------------|-----------------|
| `home_feed.json` (Item) | `event_id` | Update `Image` model to link to Event |
| `calendar_data.json` | `thumbnail` | Update `generate_calendar.js` to fetch image |
| `calendar_data.json` | `category` (Object) | Update script to populate object not string |
