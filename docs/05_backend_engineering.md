# Backend Engineering Guide

## 1. Environment Setup
Since the backend is primarily a "Static Site Generator" for the app, the setup is local.

### Prerequisites
- **Node.js**: v18+
- **MongoDB**: Community Edition (Local) or MongoDB Atlas (Free Tier).
- **AWS CLI**: Configured with an IAM user having `S3FullAccess` and `CloudFrontFullAccess`.

### Project Structure
```
/backend
  /src
    /models       # Mongoose models (Event, Image, Category)
    /scripts      # Generation scripts
      generate_feed.js
      generate_calendar.js
      optimize_images.js
      upload_s3.js
    /config       # AWS config, DB connection strings
  /data           # Temporary folder for generated JSONs
  /assets         # Raw images before optimization
  package.json
```

## 2. Database Models (Mongoose)

### `Event.js`
```javascript
const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true }, // For fixed date events
  date_type: { type: String, enum: ['fixed', 'tithi_based'], default: 'fixed' },
  description: String,
  wiki_url: String,
  tags: [String],
  priority: { type: Number, default: 0 },
  active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Event', EventSchema);
```

### `Image.js`
```javascript
const mongoose = require('mongoose');

const ImageSchema = new mongoose.Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  filename: String, // e.g., "diwali_2025_01.webp"
  s3_key: String,   // e.g., "images/festivals/diwali_2025_01.webp"
  caption: String,
  language: { type: String, default: 'hi' },
  tags: [String]
});

module.exports = mongoose.model('Image', ImageSchema);
```

## 3. The Generation Pipeline (`npm run publish`)

### Step 1: Image Optimization (`optimize_images.js`)
- Uses `sharp` library.
- Scans `/assets/raw`.
- Resizes to max width 1080px (vertical) or 1920px (horizontal).
- Converts to WebP with quality 80.
- Moves to `/assets/optimized`.

### Step 2: JSON Generation (`generate_feed.js`)
- Fetches all active Events sorted by date (nearest first).
- Fetches top 10 images for each event.
- Constructs the `home_feed.json` structure.
- Writes to `/data/home_feed.json`.

### Step 3: Calendar Generation (`generate_calendar.js`)
- Iterates through all events.
- Groups them by Year -> Month -> Day.
- Writes to `/data/calendar_data.json`.

### Step 4: Data Seeding (`seed_events.js`)
- **Purpose**: Populates the local MongoDB with the next 2 years of festival data.
- **Source**: Reads from `data/events_seed_2025_2026.json`.
- **Logic**: Upserts events based on "Title" to avoid duplicates. Handles multiple date entries for recurring events.

### Step 5: Deployment (`upload_s3.js`)
- Uses `aws-sdk`.
- Uploads `/assets/optimized/*.webp` to S3 bucket `images/`.
- Uploads `/data/*.json` to S3 bucket `data/`.
- Sets `Cache-Control` headers.
- **Optional**: Calls CloudFront Invalidation API for `data/*.json`.

## 4. AWS Lambda Functions (Serverless Features)

### A. Search Function (`search-handler`)
- **Trigger**: API Gateway GET `/search?q=diwali`
- **Logic**:
    - Loads a lightweight `search_index.json` from S3 (cached in memory).
    - Performs fuzzy search.
    - Returns list of matching events/images.
- **Cost**: Free tier includes 1M requests/month.

### B. Dynamic Share Link (`share-handler`)
- **Trigger**: HTTP GET `/share/{imageId}`
- **Logic**:
    - Returns an HTML page with Open Graph (OG) tags.
    - Ensures when shared on WhatsApp, the specific image preview shows up.
    - Redirects user to the App Store or App (Deep Link) if clicked.

## 5. Security
- **S3 Bucket Policy**: Public Read for `images/` and `data/`.
- **IAM User**: The local script uses an IAM user with restricted permissions (only write to specific bucket).
- **CloudFront**: HTTPS only.
