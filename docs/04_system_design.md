# System Design: Utsav Share Architecture

## 1. High-Level Architecture
The system follows a **Serverless, Static-First** architecture designed to minimize running costs while ensuring high availability and low latency.

### Components
1.  **Mobile App (Flutter)**: The client interface. Fetches JSON configurations and images from CloudFront.
2.  **Admin Dashboard (Local/Web)**: A React/Next.js app running locally or on a private S3 bucket. It connects to a local MongoDB for data management.
3.  **Content Generation Engine (Node.js)**: A script that transforms MongoDB data into static JSON files.
4.  **Storage Layer (AWS S3)**: Stores the generated JSON files and optimized WebP images.
5.  **Delivery Layer (AWS CloudFront)**: Caches content globally to reduce S3 requests and improve speed.
6.  **Compute Layer (AWS Lambda)**: (Optional) Handles dynamic requests like Search or "Message of the Day" if static JSON becomes too large.

## 2. Data Flow

### A. Content Creation & Publishing Flow
1.  **Seeding (One-Time/Yearly)**:
    - **Admin** runs `seed_events.js` to populate the local MongoDB with 2 years of festival dates (2025-2027).
    - This handles the complex "Tithi" (Lunar Calendar) logic by pre-calculating dates.
2.  **Daily Management**:
    - **Admin** adds new images or tweaks descriptions via the **Admin Dashboard**.
    - Images are processed locally (resized to 9:16 vertical, converted to WebP).
3.  **Publishing**:
    - **Admin** clicks "Publish".
    - **Generation Engine**:
        - Queries MongoDB for active events.
        - Generates `home_feed.json`, `calendar_2025.json`, `event_diwali_2025.json`.
        - Uploads these JSON files to `s3://utsav-app-content/data/`.
        - Uploads new images to `s3://utsav-app-content/images/`.
    - **CloudFront** cache invalidation is triggered (selectively) to propagate changes.

### B. User Consumption Flow
1.  **User** opens the app.
2.  **App** requests `https://cdn.utsavapp.com/data/config.json` to get the latest version info and base URLs.
3.  **App** requests `https://cdn.utsavapp.com/data/home_feed.json`.
4.  **CloudFront** serves the file from the nearest edge location (Latency < 50ms).
5.  **App** parses JSON and renders the UI.
6.  **Images** are lazy-loaded from `https://cdn.utsavapp.com/images/...` as the user scrolls.

## 3. Database Schema (MongoDB - Local)

### Collection: `events`
```json
{
  "_id": "ObjectId",
  "title": "Diwali",
  "date": "2025-10-20",
  "category": "Festival",
  "description": "Festival of Lights...",
  "wiki_link": "https://en.wikipedia.org/wiki/Diwali",
  "tags": ["lights", "hindu", "celebration"],
  "priority": 10, // Higher shows first
  "is_active": true
}
```

### Collection: `images`
```json
{
  "_id": "ObjectId",
  "event_id": "ObjectId(events._id)",
  "file_name": "diwali_01.webp",
  "s3_path": "images/festivals/diwali_01.webp",
  "caption": "Happy Diwali to you and your family!",
  "language": "en",
  "likes_count": 0, // Synced periodically if needed
  "downloads_count": 0
}
```

## 4. API Design (Static JSON Structure)

### `home_feed.json`
```json
{
  "version": "1.0",
  "generated_at": "2025-12-16T10:00:00Z",
  "sections": [
    {
      "type": "banner_carousel",
      "items": [ ... ]
    },
    {
      "type": "horizontal_list",
      "title": "Upcoming Festivals",
      "items": [ ... ]
    },
    {
      "type": "grid",
      "title": "Daily Wishes",
      "items": [ ... ]
    }
  ]
}
```

### `calendar_data.json`
```json
{
  "2025": {
    "10": { // October
      "20": [ { "id": "evt_123", "title": "Diwali", "type": "festival" } ],
      "21": [ { "id": "evt_124", "title": "Govardhan Puja", "type": "festival" } ]
    }
  }
}
```

## 5. Cost Optimization Strategy
- **S3 Intelligent Tiering**: Automatically moves rarely accessed images to cheaper storage classes.
- **CloudFront Caching**: Set `Cache-Control: max-age=31536000` (1 year) for images. JSON files get `max-age=3600` (1 hour).
- **Client-Side Caching**: The app caches JSON responses for 1 hour and images indefinitely (until space is needed).
- **No Always-On Server**: We pay $0 for EC2/RDS. Only pay for S3 storage and Data Transfer (free tier covers a lot).

## 6. Scalability
- **Reads**: Infinite scalability via CloudFront. Can handle millions of concurrent users.
- **Writes**: Single admin writer (initially). Can scale to a multi-admin web dashboard if needed later.
