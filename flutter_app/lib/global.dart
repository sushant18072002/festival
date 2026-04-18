import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'app/data/providers/data_repository.dart';
import 'app/data/services/notification_service.dart';
import 'app/data/services/notification_settings_model.dart';
import 'app/data/services/sync_engine.dart';
import 'app/data/services/widget_service.dart';
import 'app/data/services/ad_service.dart';
import 'app/data/services/analytics_service.dart';
import 'app/modules/favorites/favorites_controller.dart';
import 'app/modules/profile/profile_controller.dart';
import 'app/data/services/ambient_audio_service.dart';
import 'app/data/services/asset_service.dart';

class Global {
  static Future<void> init() async {
    await GetStorage.init();
    await Hive.initFlutter();

    // Core data (CRITICAL - needs to block UI until basic data is there)
    final repo = await Get.putAsync(() => DataRepository().init());

    // Non-critical UI controllers should be loaded lazily on demand
    Get.lazyPut<FavoritesController>(() => FavoritesController(), fenix: true);
    Get.lazyPut<ProfileController>(() => ProfileController(), fenix: true);
    Get.lazyPut<AmbientAudioService>(() => AmbientAudioService(), fenix: true);
    Get.lazyPut<AssetService>(() => AssetService(), fenix: true);
    Get.lazyPut(() => NotificationSettingsModel(), fenix: true);

    // Notification service
    final notifService = NotificationService.instance;
    Get.put(notifService, permanent: true);

    // Defer heavy SDKs like Ads and Analytics to free up the Main Thread for the first frame
    Future.microtask(() async {
      Get.put<AdService>(AdService(), permanent: true);
      final analytics = Get.put<AnalyticsService>(
        AnalyticsService(),
        permanent: true,
      );
      await analytics.init();
    });

    // Run non-critical background tasks AFTER the UI is rendering
    _initDeferredTasks(repo, notifService);
  }

  /// Fire-and-forget background initialization to speed up cold boot
  static void _initDeferredTasks(
    DataRepository repo,
    NotificationService notifService,
  ) async {
    // Give the UI time to render the first interactive frames
    await Future.delayed(const Duration(seconds: 2));

    await notifService.init();
    await SyncEngine.init();

    _scheduleNotificationsLater(repo, notifService);
    _scheduleWidgetUpdate(repo);
  }

  /// Schedules notifications after startup completes, in the background.
  static void _scheduleNotificationsLater(
    DataRepository repo,
    NotificationService service,
  ) async {
    await Future.delayed(const Duration(seconds: 3));
    final events = repo.allEvents;
    if (events.isEmpty) return;
    await service.scheduleForEvents(events);
  }

  static void _scheduleWidgetUpdate(DataRepository repo) async {
    await Future.delayed(const Duration(seconds: 4));
    final now = DateTime.now();
    final upcoming = repo.allEvents.where((e) {
      final dt = e.nextOccurrence ?? e.date;
      return dt != null && dt.isAfter(now);
    }).toList();
    upcoming.sort(
      (a, b) =>
          (a.nextOccurrence ?? a.date!).compareTo(b.nextOccurrence ?? b.date!),
    );

    final ws = WidgetService.instance;
    await ws.init();
    await ws.updateWidgetWithEvent(upcoming.isNotEmpty ? upcoming.first : null);
  }
}
