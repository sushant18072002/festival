# Implementation Plan: Utsav Share (Updated)

## Phase 1: Foundation & Backend (COMPLETED ✅)
**Goal**: Get the data structure ready and the "Publish" pipeline working.
- [x] **Setup Workspace**: Initialized `backend` and `admin-dashboard`.
- [x] **Define Models**: Created `Event` and `Image` schemas with localization & history support.
- [x] **Develop Generation Scripts**: `generate_feed.js`, `optimize_images.js`, `generate_calendar.js`, `generate_search_index.js`.
- [x] **AWS Setup**: Scripts ready for S3/CloudFront deployment.

## Phase 1.5: Admin Dashboard (COMPLETED ✅)
**Goal**: Operational Dashboard to manage content.
- [x] **Events Management**: List, Add, Edit events.
- [x] **Image Library**: Upload images, link to events.
- [x] **Deployment**: Trigger backend build/deploy from UI.
- [x] **Build Status**: Verified `npm run build` passes.

## Phase 2: Mobile App Core (NEXT STEP 🚀)
**Goal**: A working app that reads from the live JSON.

1.  **Flutter Init**:
    - Create new Flutter project `utsav_app`.
    - Setup folder structure (Clean Architecture).
    - Install dependencies: `dio`, `cached_network_image`, `provider`/`bloc`, `share_plus`.
2.  **Data Layer**:
    - Implement `Dio` client.
    - Create `EventRepository` to fetch and parse `home_feed.json`.
3.  **Home Screen**:
    - Build the dynamic widget renderer (Banner, Horizontal List, Grid).
    - Connect it to the real JSON URL (or local mock for dev).
4.  **Image Viewer**:
    - Implement `PhotoView` with `cached_network_image`.
    - Add "Share to WhatsApp" button (functionality first, UI later).

## Phase 3: Advanced Features & Polish
**Goal**: Feature parity with requirements (Calendar, Search, Offline).

1.  **Calendar View**:
    - Implement the monthly grid UI.
    - Fetch and parse `calendar_data.json`.
2.  **Offline Mode**:
    - Integrate `Hive`.
    - Cache the JSON responses.
3.  **Search & Wiki**:
    - Add Search Bar (client-side filter initially).
    - Add "Read More" WebView or `url_launcher` for Wiki links.
4.  **UI Polish**:
    - Add animations, transitions, and festive colors.
    - Implement "Skeleton Loaders" for images.

## Phase 4: Launch & Growth
**Goal**: Production ready & Viral Loop activation.

1.  **Content Population**:
    - Manually add the next 3 months of festivals into the Admin Dashboard.
    - Upload ~500 high-quality images.
2.  **Testing**:
    - Test on low-end Android device (2GB RAM).
    - Test on slow network (2G/3G simulation).
3.  **Release**:
    - Generate Signed APK/AAB.
    - Publish to Play Store.
