# Mobile App Documentation (Flutter)

## 1. Architecture
The app follows a **Clean Architecture** principle with a focus on offline-first capability.

### Layers
1.  **Presentation Layer**: UI Widgets, BLoC/Provider for state management.
2.  **Domain Layer**: Entities (Event, ImageModel), Use Cases (GetHomeFeed, ShareImage).
3.  **Data Layer**: Repositories, API Service (Dio), Local Storage (Hive).

## 2. Tech Stack
- **Framework**: Flutter (Latest Stable).
- **State Management**: BLoC (Business Logic Component) or Riverpod.
- **Networking**: Dio (for fetching JSONs).
- **Image Loading**: `cached_network_image` (critical for caching WebP).
- **Local Database**: Hive (for storing Favorites and cached feed).
- **Permissions**: `permission_handler`.
- **Sharing**: `share_plus` and `url_launcher`.

## 3. Key Modules

### A. Feed Module (Smart)
- **Responsibility**: Fetch `home_feed.json`, parse it, and render the dynamic sections.
- **Local Relevance Engine**:
    - **Logic**:
        - Load `home_feed.json`.
        - Fetch `UserProfile` from Hive.
        - Re-sort the "Daily Mix" list: `Score = (GlobalRank * 0.3) + (UserTagScore * 0.7)`.
- **Logic**:
    - Check if `home_feed.json` exists in Hive (Cache).
    - If yes, show cached data immediately.
    - In background, fetch fresh JSON from CloudFront.

### B. Search Module (Voice Enabled)
- **Tech**: `speech_to_text` package.
- **UI**: Floating Mic button in Search Bar.
- **Logic**:
    - Listen to speech -> Convert to Text -> Search local tags.
    - If no results, show "Try saying 'Good Morning'".

### C. Calendar Module
- **Responsibility**: Render the monthly grid.
- **Logic**:
    - Fetch `calendar_data.json`.
    - Map dates to events.
    - On date tap, show a bottom sheet with event list.

### C. Image Viewer Module
- **Responsibility**: Full-screen image experience.
- **Features**:
    - **Zoom**: `PhotoView` widget.
    - **Swipe**: `PageView` to browse through gallery.
    - **Share**:
        - Download image to temporary directory.
        - Call `Share.shareXFiles`.
        - Append text: "Happy Diwali! 🪔 Shared via Utsav App: [Link]".

### D. Notification Module
- **Service**: Firebase Cloud Messaging (FCM) or OneSignal.
- **Local Notifications**: `flutter_local_notifications` for the 9 AM scheduled reminder.
- **Logic**:
    - App checks "Tomorrow's Events" from local data.
    - Schedules a local notification for 8 PM tonight: "Tomorrow is [Event]!".

## 4. UI/UX Guidelines (Tier 2 Focus)
- **Language**: Support dynamic localization. All strings should come from the JSON or local `.arb` files.
- **Typography**: Use bold, clear fonts (e.g., Hind for Hindi, Roboto for English).
- **Colors**: Vibrant, festive colors (Saffron, Deep Blue, Gold). Avoid sterile white/grey minimalism.
- **Touch Targets**: Large buttons (min 48x48dp).

## 5. Directory Structure
```
lib/
  core/
    constants/
    theme/
    utils/
  data/
    models/
    repositories/
    datasources/
  domain/
    entities/
    usecases/
  presentation/
    blocs/
    pages/
      home/
      calendar/
      detail/
    widgets/
  main.dart
```

## 6. Optimization for Low-End Devices
- **Image Resizing**: Request specific sizes if CloudFront supports it (or just use the optimized WebP).
- **Memory Management**: Call `clearLiveImages()` in `cached_network_image` when navigating away from a heavy gallery.
- **APK Size**: Use `flutter build apk --split-per-abi` to generate smaller APKs for ARMv7/ARM64.
