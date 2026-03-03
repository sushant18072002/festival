import 'package:flutter/foundation.dart';
import 'package:get_storage/get_storage.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:workmanager/workmanager.dart';
import '../providers/data_repository.dart';
import 'notification_service.dart';
import 'widget_service.dart';

const syncTaskName = "com.utsav.sync_events";

@pragma('vm:entry-point')
void callbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    debugPrint("[SyncEngine] Background task started: $task");

    try {
      if (task == syncTaskName) {
        // Initialize local storage required by repository
        await GetStorage.init();
        await Hive.initFlutter();

        // Initialize the repository which automatically syncs latest data
        final repo = DataRepository();
        await repo.init();

        // Also re-trigger notification scheduling based on fresh data
        final notifService = NotificationService.instance;
        await notifService.init();
        await notifService.scheduleForEvents(repo.allEvents);

        // Live widget refresh
        try {
          final now = DateTime.now();
          final upcoming = repo.allEvents.where((e) {
            final dt = e.nextOccurrence ?? e.date;
            return dt != null && dt.isAfter(now);
          }).toList();

          upcoming.sort(
            (a, b) => (a.nextOccurrence ?? a.date!).compareTo(
              b.nextOccurrence ?? b.date!,
            ),
          );

          await WidgetService.instance.init();
          await WidgetService.instance.updateWidgetWithEvent(
            upcoming.isNotEmpty ? upcoming.first : null,
          );
        } catch (e) {
          debugPrint("[SyncEngine] Widget update failed: $e");
        }

        debugPrint("[SyncEngine] Background sync completed successfully.");
      }
      return Future.value(true);
    } catch (e) {
      debugPrint("[SyncEngine] Sync failed: $e");
      return Future.value(false);
    }
  });
}

class SyncEngine {
  SyncEngine._();

  static Future<void> init() async {
    await Workmanager().initialize(
      callbackDispatcher,
      isInDebugMode: kDebugMode,
    );

    // Schedule a daily sync at 6 AM
    // Using a flex interval to allow Android to optimize battery
    await Workmanager().registerPeriodicTask(
      "1",
      syncTaskName,
      frequency: const Duration(hours: 24),
      initialDelay: _calculateTimeUntilNext6AM(),
      constraints: Constraints(networkType: NetworkType.connected),
    );
    debugPrint("[SyncEngine] Initialized and task scheduled.");
  }

  static Duration _calculateTimeUntilNext6AM() {
    final now = DateTime.now();
    var next6AM = DateTime(now.year, now.month, now.day, 6, 0);

    // If it's already past 6 AM today, schedule for 6 AM tomorrow
    if (now.isAfter(next6AM)) {
      next6AM = next6AM.add(const Duration(days: 1));
    }

    return next6AM.difference(now);
  }
}
