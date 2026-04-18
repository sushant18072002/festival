import 'dart:io';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:get_storage/get_storage.dart';
import 'package:path_provider/path_provider.dart';
import 'package:add_2_calendar/add_2_calendar.dart' as calendar;
import '../../data/providers/data_repository.dart';
import '../../theme/app_colors.dart';
import '../../data/services/notification_service.dart';
import '../../data/services/notification_settings_model.dart';
import '../../theme/app_spacing.dart';
import '../../routes/app_pages.dart';
import '../home/home_controller.dart';
import '../calendar/calendar_controller.dart';
import '../explore/explore_controller.dart';

class SettingsController extends GetxController {
  final _storage = GetStorage();
  late final NotificationSettingsModel _notifSettings;

  final currentLang = 'en'.obs;

  // ─── Notification observables ─────────────────────────────────────────────
  final notificationsEnabled = true.obs; // master toggle
  final festivalEventNotifs = true.obs;
  final countdownNotifs = true.obs;
  final weeklyDigestNotifs = true.obs;
  final monthlyDigestNotifs = true.obs;

  // ─── Theme & Accessibility (Phase 19) ───────────────────────────────────
  final highContrast = false.obs;
  final largeText = false.obs;
  final reduceAnimations = false.obs;
  final isDarkMode = false.obs;

  // ─── My Festivals (Phase 19) ────────────────────────────────────────────
  // List of event IDs the user wants to prioritize
  final myFestivals = <String>[].obs;

  // ─── Cache Management ───────────────────────────────────────────────────
  final cacheSize = 'Calculating...'.obs;

  @override
  void onInit() {
    super.onInit();
    currentLang.value = _storage.read('lang') ?? 'en';
    // Sanitize legacy lang codes (en_US → en)
    if (currentLang.value.length > 2) {
      currentLang.value = currentLang.value.substring(0, 2);
      _storage.write('lang', currentLang.value);
    }

    _notifSettings = Get.find<NotificationSettingsModel>();

    festivalEventNotifs.value = _notifSettings.festivalEvents;
    countdownNotifs.value = _notifSettings.countdown;
    weeklyDigestNotifs.value = _notifSettings.weeklyDigest;
    monthlyDigestNotifs.value = _notifSettings.monthlyDigest;

    // Master toggle: on if any sub-type is on
    notificationsEnabled.value = _notifSettings.anyEnabled;

    // Load v2 settings
    highContrast.value = _storage.read('high_contrast') ?? false;
    largeText.value = _storage.read('large_text') ?? false;
    reduceAnimations.value = _storage.read('reduce_animations') ?? false;
    isDarkMode.value = _storage.read('is_dark_mode') ?? Get.isPlatformDarkMode;

    myFestivals.assignAll(
      List<String>.from(_storage.read('my_festivals') ?? []),
    );
    _calculateCacheSize();
  }

  // ─── Language ─────────────────────────────────────────────────────────────

  void changeLanguage(String lang) async {
    currentLang.value = lang;
    _storage.write('lang', lang);
    Get.updateLocale(Locale(lang));

    // Inform DataRepository to clear memory and reload in new language
    final repo = Get.find<DataRepository>();
    await repo.changeLanguage(lang);

    // Also instruct Home controller to refresh its feed
    if (Get.isRegistered<HomeController>()) {
      Get.find<HomeController>().fetchFeed();
    }

    // Refresh calendar data in new language too
    if (Get.isRegistered<CalendarController>()) {
      Get.find<CalendarController>().fetchCalendarData();
    }

    // Refresh explore data in new language too
    if (Get.isRegistered<ExploreController>()) {
      Get.find<ExploreController>().fetchData();
    }
  }

  // ─── Notification Toggles ─────────────────────────────────────────────────

  void toggleNotifications(bool value) {
    notificationsEnabled.value = value;
    // Toggle all sub-types together
    _notifSettings.festivalEvents = value;
    _notifSettings.countdown = value;
    _notifSettings.weeklyDigest = value;
    _notifSettings.monthlyDigest = value;
    festivalEventNotifs.value = value;
    countdownNotifs.value = value;
    weeklyDigestNotifs.value = value;
    monthlyDigestNotifs.value = value;
    _reschedule();
  }

  void toggleFestivalEvents(bool value) {
    festivalEventNotifs.value = value;
    _notifSettings.festivalEvents = value;
    _updateMaster();
    _reschedule();
  }

  void toggleCountdown(bool value) {
    countdownNotifs.value = value;
    _notifSettings.countdown = value;
    _updateMaster();
    _reschedule();
  }

  void toggleWeeklyDigest(bool value) {
    weeklyDigestNotifs.value = value;
    _notifSettings.weeklyDigest = value;
    _updateMaster();
    _reschedule();
  }

  void toggleMonthlyDigest(bool value) {
    monthlyDigestNotifs.value = value;
    _notifSettings.monthlyDigest = value;
    _updateMaster();
    _reschedule();
  }

  void _updateMaster() {
    notificationsEnabled.value = _notifSettings.anyEnabled;
  }

  void _reschedule() async {
    final service = Get.find<NotificationService>();
    if (!_notifSettings.anyEnabled) {
      await service.cancelAll();
      return;
    }
    final events = Get.find<DataRepository>().allEvents;
    await service.scheduleForEvents(events);
  }

  // ─── Remote Data ──────────────────────────────────────────────────────────

  void toggleRemote(bool value) {
    Get.find<DataRepository>().toggleRemote(value);
    if (Get.isRegistered<HomeController>()) {
      Get.find<HomeController>().fetchFeed();
    }
    if (Get.isRegistered<CalendarController>()) {
      Get.find<CalendarController>().fetchCalendarData();
    }
    if (Get.isRegistered<ExploreController>()) {
      Get.find<ExploreController>().fetchData();
    }
  }

  // ─── Theme & Accessibility ────────────────────────────────────────────────

  void toggleTheme(bool value) {
    isDarkMode.value = value;
    _storage.write('is_dark_mode', value);
    Get.changeThemeMode(value ? ThemeMode.dark : ThemeMode.light);
  }

  void toggleHighContrast(bool value) {
    highContrast.value = value;
    _storage.write('high_contrast', value);
  }

  void toggleLargeText(bool value) {
    largeText.value = value;
    _storage.write('large_text', value);
  }

  void toggleReduceAnimations(bool value) {
    reduceAnimations.value = value;
    _storage.write('reduce_animations', value);
  }

  // ─── Data Management ──────────────────────────────────────────────────────

  Future<void> _calculateCacheSize() async {
    try {
      final dir = await getTemporaryDirectory();
      int totalBytes = 0;
      if (await dir.exists()) {
        await for (final entity in dir.list(
          recursive: true,
          followLinks: false,
        )) {
          if (entity is File) {
            totalBytes += await entity.length();
          }
        }
      }
      if (totalBytes < 1024) {
        cacheSize.value = '$totalBytes B';
      } else if (totalBytes < 1024 * 1024) {
        cacheSize.value = '${(totalBytes / 1024).toStringAsFixed(1)} KB';
      } else {
        cacheSize.value =
            '${(totalBytes / (1024 * 1024)).toStringAsFixed(1)} MB';
      }
    } catch (e) {
      cacheSize.value = 'Unknown';
    }
  }

  void clearCache() async {
    try {
      final dir = await getTemporaryDirectory();
      if (await dir.exists()) {
        await for (final entity in dir.list()) {
          if (entity is File) {
            await entity.delete();
          } else if (entity is Directory) {
            await entity.delete(recursive: true);
          }
        }
      }
      Get.snackbar(
        'Cache Cleared',
        'Successfully freed space.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: AppColors.surfaceGlass(Get.context!),
        colorText: AppColors.textAdaptive(Get.context!),
        margin: const EdgeInsets.all(AppSpacing.md),
        borderRadius: 12,
      );
      _calculateCacheSize();
    } catch (e) {
      // ignore
    }
  }

  void toggleFestivalSelection(String id) {
    if (myFestivals.contains(id)) {
      myFestivals.remove(id);
    } else {
      myFestivals.add(id);
    }
    _storage.write('my_festivals', myFestivals.toList());
  }

  void exportCalendar() async {
    if (myFestivals.isEmpty) {
      Get.snackbar(
        'Nothing to Export',
        'Add festivals to "My Festivals" first.',
        snackPosition: SnackPosition.BOTTOM,
        backgroundColor: AppColors.surfaceGlass(Get.context!),
        colorText: AppColors.textAdaptive(Get.context!),
        margin: const EdgeInsets.all(AppSpacing.md),
        borderRadius: 12,
      );
      return;
    }

    Get.snackbar(
      'Exporting',
      'Exporting ${myFestivals.length} festivals to calendar...',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: AppColors.surfaceGlass(Get.context!),
      colorText: AppColors.textAdaptive(Get.context!),
      margin: const EdgeInsets.all(AppSpacing.md),
      borderRadius: 12,
    );

    final repo = Get.find<DataRepository>();
    for (String id in myFestivals) {
      final event = await repo.getEventById(id);
      if (event != null && event.nextOccurrence != null) {
        final calEvent = calendar.Event(
          title: event.title,
          description: event.description.isNotEmpty
              ? event.description
              : 'Festival celebration',
          location: 'India',
          startDate: event.nextOccurrence!,
          endDate: event.nextOccurrence!.add(const Duration(hours: 24)),
          allDay: true,
        );
        await calendar.Add2Calendar.addEvent2Cal(calEvent);
      }
    }
  }

  void clearAllData() async {
    // 1. Wipe GetStorage
    await _storage.erase();
    
    // 2. Clear Notification Settings
    _notifSettings.festivalEvents = true;
    _notifSettings.countdown = true;
    _notifSettings.weeklyDigest = true;
    _notifSettings.monthlyDigest = true;
    
    // 3. Clear file cache
    try {
      final dir = await getTemporaryDirectory();
      if (await dir.exists()) {
        await dir.delete(recursive: true);
      }
    } catch (e) {
      // Ignore cache deletion errors
    }

    // 4. Restart app state by forcing reload
    Get.offAllNamed(Routes.initialLoad);
    
    Get.snackbar(
      'Data Cleared',
      'All local data has been successfully deleted.',
      snackPosition: SnackPosition.BOTTOM,
      backgroundColor: AppColors.errorAdaptive(Get.context!).withValues(alpha: 0.15),
      colorText: AppColors.errorAdaptive(Get.context!),
      margin: const EdgeInsets.all(AppSpacing.md),
      borderRadius: 12,
    );
  }
}
