# Backend Documentation

## 1. Overview
The backend is a **Static Content Generator**. It uses Node.js scripts to read from a local MongoDB and generate optimized JSON files and images for the mobile app.

## 2. Key Commands
| Command | Description |
| :--- | :--- |
| `npm run build` | **Regenerates EVERYTHING**. Runs seed, feed, calendar, and search scripts in order. |
| `npm run seed` | Populates MongoDB with event data from `data/events_seed_...json`. |
| `npm run start` | Generates `home_feed.json` and `home_feed_hi.json` (Hindi). |
| `npm run calendar` | Generates `calendar_data.json`. |
| `npm run search` | Generates `search_index.json`. |
| `npm run optimize` | Optimizes images in `assets/raw` to `assets/optimized` (WebP + Thumbnails). |
| `npm run deploy` | Uploads generated content to AWS S3. |

## 3. Data Structure
### Event Schema (`src/models/Event.js`)
*   **Localization**: `translations: { hi: { title, description } }`
*   **References**: `references: [{ source, url }]` for Wiki/Source links.
*   **History**: `historical_significance: { year, fact }` for "This Day in History".

### Seed Data (`data/events_seed_2025_2026.json`)
This is the **Source of Truth**. Edit this file to add/update events, then run `npm run seed`.

## 4. Workflow
1.  **Add Event**: Edit `events_seed_2025_2026.json`.
2.  **Add Images**: Drop images into `assets/raw`.
3.  **Build**: Run `npm run optimize` then `npm run build`.
4.  **Deploy**: Run `npm run deploy`.

## 5. Future Expansion
*   **Micro-API**: For dynamic translations, we can build a Lambda function that reads the `translations` field on the fly.
*   **New Languages**: Add language code to `Event.js` schema and update `generate_feed.js` loop.
