import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:http/http.dart' as http;

import '../models/event_model.dart';
import '../../routes/app_pages.dart';
import 'notification_scheduler.dart';

/// Core notification channel ID
const _kChannelEventsId = 'utsav_events';

/// Root key for storage of scheduled notification metadata
const _kStorageKey = 'scheduled_notif_ids';
@pragma('vm:entry-point')
void notificationCallbackDispatcher() {
  // WorkManager is not used for scheduling in this implementation.
  // All notifications are pre-scheduled via flutter_local_notifications.
  // This dispatcher is kept as an extension point for future remote sync.
}

/// Centralised notification service.
///
/// Responsibilities:
///  1. Permission + channel setup
///  2. Displaying different notification types
///  3. Handling tap → deep link routing
///  4. Tracking scheduled IDs to avoid duplicates
class NotificationService {
  NotificationService._();
  static final NotificationService instance = NotificationService._();

  final _plugin = FlutterLocalNotificationsPlugin();
  final _storage = GetStorage();

  bool _initialized = false;

  // ─── Public API ────────────────────────────────────────────────────────────

  /// Must be called in main() before runApp(), after GetStorage.init().
  Future<void> init() async {
    if (_initialized) return;

    const androidSettings = AndroidInitializationSettings(
      '@mipmap/ic_launcher',
    );
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: false, // We ask manually at the right moment
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    await _plugin.initialize(
      const InitializationSettings(android: androidSettings, iOS: iosSettings),
      onDidReceiveNotificationResponse: _onTap,
      onDidReceiveBackgroundNotificationResponse: _onBackgroundTap,
    );

    _initialized = true;
    debugPrint('[Notifications] Initialized');
  }

  /// Request permission. Call this after first meaningful user interaction
  /// (e.g., after onboarding, not on cold launch).
  Future<bool> requestPermission() async {
    // Android 13+
    final android = _plugin
        .resolvePlatformSpecificImplementation<
          AndroidFlutterLocalNotificationsPlugin
        >();
    if (android != null) {
      final granted = await android.requestNotificationsPermission();
      return granted ?? false;
    }
    // iOS
    final ios = _plugin
        .resolvePlatformSpecificImplementation<
          IOSFlutterLocalNotificationsPlugin
        >();
    if (ios != null) {
      final granted = await ios.requestPermissions(
        alert: true,
        badge: true,
        sound: true,
      );
      return granted ?? false;
    }
    return false;
  }

  /// Schedule all smart notifications based on the loaded events.
  Future<void> scheduleForEvents(List<EventModel> events) async {
    await NotificationScheduler.instance.scheduleAll(
      events: events,
      plugin: _plugin,
      storage: _storage,
    );
  }

  /// Cancel all scheduled notifications & clear tracking state.
  Future<void> cancelAll() async {
    await _plugin.cancelAll();
    _storage.remove(_kStorageKey);
    debugPrint('[Notifications] All cancelled');
  }

  // ─── Internal Display Methods ──────────────────────────────────────────────

  /// Shows an immediate notification (used for testing / debug only).
  Future<void> showNow({
    required int id,
    required String title,
    required String body,
    String? payload,
    String? imageUrl,
    String channelId = _kChannelEventsId,
  }) async {
    final details = await _buildDetails(
      channelId: channelId,
      imageUrl: imageUrl,
    );
    await _plugin.show(id, title, body, details, payload: payload);
  }

  // ─── Notification Details Builder ──────────────────────────────────────────

  static Future<NotificationDetails> buildDetails({
    String channelId = _kChannelEventsId,
    String? imageUrl,
    Color? accentColor,
  }) async {
    return _buildDetailsStatic(
      channelId: channelId,
      imageUrl: imageUrl,
      accentColor: accentColor,
    );
  }

  static Future<NotificationDetails> _buildDetailsStatic({
    required String channelId,
    String? imageUrl,
    Color? accentColor,
  }) async {
    final bool isEvent = channelId == _kChannelEventsId;

    // Download the image for Big Picture style
    BigPictureStyleInformation? bigPicture;
    if (imageUrl != null && imageUrl.isNotEmpty) {
      try {
        final response = await http
            .get(Uri.parse(imageUrl))
            .timeout(const Duration(seconds: 8));
        if (response.statusCode == 200) {
          final ByteArrayAndroidBitmap bitmap = ByteArrayAndroidBitmap(
            response.bodyBytes,
          );
          bigPicture = BigPictureStyleInformation(
            bitmap,
            hideExpandedLargeIcon: true,
          );
        }
      } catch (e) {
        debugPrint('[Notifications] Image fetch failed: $e');
      }
    }

    // Android details
    final androidDetails = AndroidNotificationDetails(
      channelId,
      isEvent ? 'Festival Events' : 'Weekly Digest',
      channelDescription: isEvent
          ? 'Upcoming festival reminders and day-of alerts'
          : 'Your weekly and monthly cultural digest',
      importance: Importance.high,
      priority: Priority.high,
      color: accentColor,
      styleInformation: bigPicture,
      actions: const [
        AndroidNotificationAction('explore', 'Explore 🔍'),
        AndroidNotificationAction('share', 'Share 📲'),
      ],
      groupKey: 'utsav_group',
      category: AndroidNotificationCategory.event,
      // Only play sound for day-of notifications
      playSound: isEvent,
      enableLights: true,
      ledColor: accentColor,
      ledOnMs: 1000,
      ledOffMs: 500,
    );

    // iOS details
    final iosDetails = DarwinNotificationDetails(
      categoryIdentifier: isEvent ? 'FESTIVAL_EVENT' : 'DIGEST',
      presentSound: isEvent,
      presentBadge: true,
      threadIdentifier: channelId,
    );

    return NotificationDetails(android: androidDetails, iOS: iosDetails);
  }

  Future<NotificationDetails> _buildDetails({
    required String channelId,
    String? imageUrl,
    Color? accentColor,
  }) => _buildDetailsStatic(
    channelId: channelId,
    imageUrl: imageUrl,
    accentColor: accentColor,
  );

  // ─── Tap Handling ──────────────────────────────────────────────────────────

  static void _onTap(NotificationResponse response) {
    _handlePayload(response.payload);
  }

  @pragma('vm:entry-point')
  static void _onBackgroundTap(NotificationResponse response) {
    _handlePayload(response.payload);
  }

  /// Payload format: `"event:<slug>"`, `"calendar"`, or `"home"`.
  static void _handlePayload(String? payload) {
    if (payload == null || payload.isEmpty) return;

    if (payload.startsWith('event:')) {
      final slug = payload.replaceFirst('event:', '');
      Get.toNamed(Routes.eventDetails, arguments: {'slug': slug});
    } else if (payload == 'calendar') {
      Get.offAllNamed(Routes.dashboard);
    } else {
      Get.offAllNamed(Routes.home);
    }
  }

  // ─── Color helpers ─────────────────────────────────────────────────────────

  static Color categoryColor(EventModel event) {
    final code = event.category?.code ?? '';
    switch (code) {
      case 'festival':
        return const Color(0xFF8B5CF6); // purple
      case 'national':
        return const Color(0xFFF97316); // orange
      case 'cultural':
        return const Color(0xFFEC4899); // pink
      default:
        return const Color(0xFF6366F1); // indigo
    }
  }
}
