import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../data/models/home_feed_model.dart';
import '../../data/models/image_model.dart';
import '../../data/models/event_model.dart';
import '../../data/providers/data_repository.dart';
import '../../modules/favorites/favorites_controller.dart';

class HomeController extends GetxController {
  final DataRepository _repository = Get.find<DataRepository>();

  final isLoading = true.obs;
  final hasError = false.obs;
  final homeFeed = Rxn<HomeFeed>();
  RxString get currentLang => _repository.currentLang;

  // Context-Aware: Happening Now
  final happeningNowEvent = Rxn<EventModel>();

  // Festival Day Takeover — shown once per session
  final showTakeover = false.obs;

  // Filtering
  final selectedVibe = 'all'.obs;
  final filteredImages = <ImageModel>[].obs;
  final isForYouView =
      true.obs; // Tracks if we are showing smart-sorted default feed

  // Daily Blessing
  final dailyBlessingGreeting = Rxn<String>();
  final dailyBlessingQuote = Rxn<String>();

  String get timeGreeting {
    final hour = DateTime.now().hour;
    if (hour >= 21) return 'starry_night'.tr;
    if (hour >= 17) return 'good_evening'.tr;
    if (hour >= 12) return 'good_afternoon'.tr;
    return 'good_morning'.tr;
  }

  @override
  void onInit() {
    super.onInit();
    fetchFeed();
  }

  Future<void> fetchFeed() async {
    isLoading.value = true;
    hasError.value = false;
    try {
      final feed = await _repository.getHomeFeed(currentLang.value);
      if (feed != null) {
        homeFeed.value = feed;
        _checkHappeningNow(); // Inject context-aware active event
        _generateDailyBlessing(); // Inject Daily Blessing
        filterImages(); // Initial population
      } else {
        hasError.value = true;
      }
    } catch (e) {
      debugPrint('Error fetching feed: $e');
      hasError.value = true;
    } finally {
      isLoading.value = false;
    }
  }

  void changeLanguage(String lang) async {
    if (_repository.currentLang.value == lang) return;
    isLoading.value = true;

    // Update GetX UI Locale — map each language code to correct Locale
    final localeMap = {
      'en': const Locale('en', 'US'),
      'hi': const Locale('hi', 'IN'),
      'mr': const Locale('mr', 'IN'),
      'gu': const Locale('gu', 'IN'),
      'bn': const Locale('bn', 'BD'),
      'ta': const Locale('ta', 'IN'),
      'te': const Locale('te', 'IN'),
      'kn': const Locale('kn', 'IN'),
      'ml': const Locale('ml', 'IN'),
    };
    Get.updateLocale(localeMap[lang] ?? const Locale('en', 'US'));

    // Update Data payload language
    await _repository.changeLanguage(lang);
    await fetchFeed();
  }

  void selectVibe(String vibeCode) {
    selectedVibe.value = vibeCode;
    filterImages();
  }

  void _checkHappeningNow() {
    final now = DateTime.now();
    // Search the full repository cache for any event happening exactly today
    final todayEvent = _repository.allEvents.firstWhereOrNull((e) {
      if (e.date == null) return false;
      return e.date!.year == now.year &&
          e.date!.month == now.month &&
          e.date!.day == now.day;
    });
    happeningNowEvent.value = todayEvent;
    if (todayEvent != null) showTakeover.value = true;
  }

  bool get isFestivalDay => happeningNowEvent.value != null;

  void dismissTakeover() => showTakeover.value = false;

  void _generateDailyBlessing() {
    final greetings = _repository.allGreetings;
    final quotes = _repository.allQuotes;

    // Seed by day of year so it stays consistent for 24h
    final now = DateTime.now();
    final dayOfYear = now.difference(DateTime(now.year, 1, 1)).inDays;

    if (greetings.isNotEmpty) {
      dailyBlessingGreeting.value =
          greetings[dayOfYear % greetings.length].text;
    } else {
      dailyBlessingGreeting.value = "Embrace the joy of today.";
    }

    if (quotes.isNotEmpty) {
      dailyBlessingQuote.value =
          quotes[(dayOfYear + 5) % quotes.length].text; // offset for variety
    } else {
      dailyBlessingQuote.value = "Every moment is a fresh beginning.";
    }
  }

  void filterImages() {
    final feed = homeFeed.value;
    if (feed == null) return;

    // Find trending section
    final trendingSection = feed.sections.firstWhereOrNull(
      (s) => s.code == 'trending',
    );
    if (trendingSection == null) {
      filteredImages.clear();
      return;
    }

    final allImages = trendingSection.items.whereType<ImageModel>().toList();

    List<ImageModel> targetList;

    if (selectedVibe.value == 'all') {
      targetList = List<ImageModel>.from(allImages);
    } else {
      targetList = allImages.where((img) {
        // Check if image vibes contain the selected vibe code
        return img.vibes.contains(selectedVibe.value);
      }).toList();
    }

    // Apply Unified Smart Sort (Time-of-Day + User Favorites)
    if (selectedVibe.value == 'all') {
      isForYouView.value = true;
      _applySmartSort(targetList);
    } else {
      isForYouView.value = false;
    }

    filteredImages.assignAll(targetList);
  }

  /// Sorts images contextually based on the time of day and user favorites
  void _applySmartSort(List<ImageModel> images) {
    if (selectedVibe.value != 'all') {
      // Don't auto-sort if user explicitly selected a specific filter
      return;
    }

    // 1. Time-of-Day Vibes
    final hour = DateTime.now().hour;
    List<String> todVibes = [];
    if (hour >= 5 && hour < 12) {
      todVibes = ['spiritual', 'peaceful', 'morning', 'puja', 'serene'];
    } else if (hour >= 18 && hour <= 23) {
      todVibes = [
        'high-energy',
        'party',
        'night',
        'lights',
        'aarti',
        'concert',
      ];
    }

    // 2. Gather User Favorite Vibes
    final favoriteVibes = <String, int>{};
    if (Get.isRegistered<FavoritesController>()) {
      final faves = Get.find<FavoritesController>();
      for (var img in faves.favoriteImages) {
        for (var v in img.vibes) {
          favoriteVibes[v.toLowerCase()] =
              (favoriteVibes[v.toLowerCase()] ?? 0) + 1;
        }
      }
      for (var event in faves.favoriteEvents) {
        for (var tag in event.tags) {
          favoriteVibes[tag.name.toLowerCase()] =
              (favoriteVibes[tag.name.toLowerCase()] ?? 0) + 1;
        }
        for (var vibe in event.vibes) {
          favoriteVibes[vibe.name.toLowerCase()] =
              (favoriteVibes[vibe.name.toLowerCase()] ?? 0) + 1;
        }
      }
    }

    // 3. Score and Sort
    images.sort((a, b) {
      int getScore(ImageModel img) {
        int score = 0;
        for (var v in img.vibes) {
          final vLower = v.toLowerCase();
          // Huge priority for Time of Day
          if (todVibes.contains(vLower)) score += 1000;

          // Micro-boosts for every favorited occurrence
          score += (favoriteVibes[vLower] ?? 0) * 10;
        }
        return score;
      }

      int scoreA = getScore(a);
      int scoreB = getScore(b);

      // Keep original order if scores are tied
      if (scoreA == scoreB) return 0;
      return scoreB.compareTo(scoreA); // Descending
    });
  }
}
