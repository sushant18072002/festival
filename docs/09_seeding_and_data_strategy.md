# Data Seeding & Content Strategy (2-Year Roadmap)

## 1. The Challenge: "Panchang" vs. Gregorian
Indian festivals (Diwali, Holi, Raksha Bandhan) follow the Lunar calendar (Tithi). They do not fall on the same date every year.
*   **Strategy**: We will **pre-calculate** and hardcode the dates for the next 2 years (2025-2027) into our seed data. We will not build a complex Tithi engine in the app; we will simply feed it the correct dates.

## 2. Seed Data Categories
We need to populate the database with ~500 events across these categories:

### A. Major Indian Festivals (Tier 1 Priority)
*   **North**: Diwali, Holi, Raksha Bandhan, Dussehra, Janmashtami, Maha Shivratri.
*   **South**: Pongal, Onam, Ugadi, Vishu.
*   **East**: Durga Puja, Saraswati Puja, Rath Yatra.
*   **West**: Ganesh Chaturthi, Gudi Padwa, Navratri.
*   **Islamic**: Eid-ul-Fitr, Eid-ul-Adha, Muharram, Milad-un-Nabi.
*   **Christian**: Christmas, Good Friday, Easter.
*   **Sikh**: Gurpurab (Guru Nanak Jayanti), Baisakhi.

### B. National & Government Days (Fixed Dates)
*   Republic Day (Jan 26)
*   Independence Day (Aug 15)
*   Gandhi Jayanti (Oct 2)
*   Ambedkar Jayanti (Apr 14)
*   Teachers' Day (Sep 5)
*   Children's Day (Nov 14)
*   Army/Navy/Air Force Days.

### C. International & Modern Days (Youth Appeal)
*   New Year's Eve / New Year (Jan 1)
*   Valentine's Week (Feb 7-14) - *Huge sharing volume*
*   Mother's Day, Father's Day, Friendship Day.
*   Yoga Day (Jun 21), Environment Day.

### D. "Daily" Content (The Filler)
*   **Days of Week**: "Shubh Somwar" (Monday/Shiva), "Mangalwar" (Hanuman), "Shanivar" (Shani Dev).
*   **Daily Routine**: Good Morning (Suprabhat), Good Night (Shubh Ratri).

## 3. The Seeding Script (`seed_events.js`)
We will create a JSON file `events_seed_2025_2026.json` and a script to load it into MongoDB.

### JSON Structure
```json
[
  {
    "title": "Maha Shivratri",
    "category": "Religious",
    "tags": ["shiva", "bhole", "hindu"],
    "dates": [
      { "year": 2025, "date": "2025-02-26" },
      { "year": 2026, "date": "2026-02-15" }
    ],
    "description": "Celebrating the marriage of Lord Shiva and Parvati.",
    "priority": 10
  },
  {
    "title": "Republic Day",
    "category": "National",
    "tags": ["india", "patriotic", "flag"],
    "dates": [
      { "year": 2025, "date": "2025-01-26" },
      { "year": 2026, "date": "2026-01-26" }
    ],
    "description": "Honoring the date on which the Constitution of India came into effect.",
    "priority": 10
  }
]
```

### Execution Logic
1.  **Script**: `node scripts/seed_events.js`
2.  **Process**:
    *   Reads the JSON.
    *   Checks if event exists in MongoDB (by Title).
    *   If yes, updates dates.
    *   If no, creates new Event.
    *   Logs output: "Seeded 150 events for 2025-2026".

## 4. "Best Fit" for User Needs (Hyper-Relevance Strategy)
To truly fit the user's needs, we must go beyond just dates.

### A. The "WhatsApp Status" Ratio
*   **Requirement**: Users want to look good on WhatsApp.
*   **Solution**: All images generated/uploaded MUST be **9:16 Vertical (1080x1920)**. Square images are "old school".
*   **Feature**: "Direct to Status" button (using WhatsApp Intent `watsapp://send?text=...` is generic, but using `FileProvider` to share directly to the 'Status' tab flow is better).

### B. Vernacular is King
*   **Insight**: A user in Bihar prefers "Chhath Puja" wishes in Bhojpuri/Hindi, not English.
*   **Strategy**:
    *   Tag every image with language: `hi`, `en`, `mr` (Marathi), `gu` (Gujarati).
    *   App Filter: "Show me content in [Hindi]".
    *   **Auto-Translate**: Use a script to translate generic "Good Morning" quotes into 10 Indian languages and overlay them on images automatically.

### C. The "Name on Image" Feature (The Killer Feature)
*   **Insight**: Users love seeing their name on the wish. "Happy Diwali from [Sushant]".
*   **Solution**:
    *   Add a simple "Text Editor" overlay in the app before sharing.
    *   User types name -> App places it at the bottom right in a nice font -> Generates image -> Shares.
    *   *This increases the perceived value of the app 10x.*

### D. Low Data Mode
*   **Insight**: 1.5GB/day limit.
*   **Solution**:
    *   Thumbnails: 5KB (BlurHash).
    *   Full Image: < 80KB (WebP, 80% quality).
    *   **"Text Only" Mode**: Allow users to copy just the *Shayari* or *Wish* text if they don't want to download the image.
