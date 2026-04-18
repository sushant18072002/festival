import 'dart:math';
import 'package:flutter/material.dart';
import 'package:get/get.dart';
import '../../data/models/home_feed_model.dart';
import '../../data/models/image_model.dart';
import '../../data/models/event_model.dart';
import '../../widgets/smart_lottie.dart';
import '../../data/providers/data_repository.dart';
import 'package:get_storage/get_storage.dart';
import '../../modules/favorites/favorites_controller.dart';
import '../../data/services/ambient_audio_service.dart';

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
  final isGridView = true.obs;

  // Context-Aware Engagement Card Logic
  final showEngagementCards = false.obs;
  final primaryCard = 'quiz'.obs;

  void toggleViewMode() => isGridView.value = !isGridView.value;

  // Daily Blessing
  final dailyBlessingGreeting = Rxn<String>();
  final dailyBlessingQuote = Rxn<String>();

  // Dynamic Home Greeting — rotates on every page visit/feed refresh
  final currentHomeGreeting = RxString('');

  String get timeGreeting => currentHomeGreeting.value.isNotEmpty
      ? currentHomeGreeting.value
      : _staticFallbackGreeting;

  /// Fallback when backend greetings are empty (no data yet)
  String get _staticFallbackGreeting {
    final hour = DateTime.now().hour;
    if (hour >= 21) return 'starry_night'.tr;
    if (hour >= 17) return 'good_evening'.tr;
    if (hour >= 12) return 'good_afternoon'.tr;
    return 'good_morning'.tr;
  }

  @override
  void onInit() {
    super.onInit();
    _computePrimaryCard();
    Future.delayed(const Duration(milliseconds: 300), () {
      fetchFeed();
    });
  }

  void _computePrimaryCard() {
    final box = GetStorage();
    
    // 0. Global sessions for onboarding (wait 2 sessions before showing engagement cards)
    int globalSessions = box.read<int>('homeCtx_globalSessions') ?? 0;
    globalSessions++;
    box.write('homeCtx_globalSessions', globalSessions);
    
    if (globalSessions <= 2) {
      showEngagementCards.value = false;
      return; // Cards are hidden, no need to compute order yet
    } else {
      showEngagementCards.value = true;
    }

    final lastActivity = box.read<String>('homeCtx_lastActivity') ?? '';
    final sessionsToday = box.read<int>('homeCtx_sessionsToday') ?? 0;
    final lastDate = box.read<String>('homeCtx_lastDate') ?? '';

    final now = DateTime.now();
    final todayStr = '${now.year}-${now.month}-${now.day}';

    int sessions = sessionsToday;
    if (lastDate != todayStr) {
      sessions = 0;
      box.write('homeCtx_lastDate', todayStr);
    }
    
    sessions++;
    box.write('homeCtx_sessionsToday', sessions);

    // 1. Alternate based on last activity
    if (lastActivity == 'quiz') {
      primaryCard.value = 'trivia';
      return;
    } else if (lastActivity == 'trivia') {
      primaryCard.value = 'quiz';
      return;
    }

    // 2. Time of day
    final hour = now.hour;
    if (hour >= 6 && hour < 12) {
      primaryCard.value = 'quiz';
      return;
    } else if (hour >= 19 && hour <= 23) {
      primaryCard.value = 'trivia';
      return;
    }

    // 3. Frequency
    if (sessions <= 1) {
      primaryCard.value = 'quiz';
    } else {
      primaryCard.value = 'trivia';
    }
  }

  void recordActivity(String mode) {
    GetStorage().write('homeCtx_lastActivity', mode);
  }

  Future<void> fetchFeed() async {
    if (homeFeed.value == null) {
      isLoading.value = true;
    }
    hasError.value = false;
    try {
      final feed = await _repository.getHomeFeed(currentLang.value);
      if (feed != null) {
        homeFeed.value = feed;
        _checkHappeningNow();
        _generateDailyBlessing();
        _refreshHomeGreeting(); // Pick a fresh random greeting
        filterImages();
        _prewarmUpcomingAssets();
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

  /// Silently pre-caches Lottie assets for the next few upcoming festivals.
  void _prewarmUpcomingAssets() {
    final feed = homeFeed.value;
    if (feed == null) return;

    final upcomingSection = feed.sections.firstWhereOrNull((s) => s.code == 'upcoming');
    if (upcomingSection == null) return;

    final lottieUrls = upcomingSection.items
        .whereType<EventModel>()
        .where((e) => e.lottieOverlay != null)
        .map((e) => e.lottieOverlay!.s3Key.isNotEmpty 
            ? e.lottieOverlay!.s3Key 
            : e.lottieOverlay!.filename)
        .take(3)
        .toList();

    if (lottieUrls.isNotEmpty) {
      debugPrint('[HomeController] Pre-warming ${lottieUrls.length} Lottie assets...');
      SmartLottie.preCache(lottieUrls);
    }
  }

  void changeLanguage(String lang) async {
    if (_repository.currentLang.value == lang) return;
    isLoading.value = true;

    Get.updateLocale(Locale(lang));

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
    if (todayEvent != null) {
      showTakeover.value = true;
      // Auto-play ambient audio for the festival day
      // Wrapped in Future.microtask to avoid build-cycle collisions
      Future.microtask(() => AmbientAudioService.to.playForEvent(todayEvent));
    }
  }

  bool get isFestivalDay => happeningNowEvent.value != null;

  void dismissTakeover() => showTakeover.value = false;

  /// Picks a fresh random greeting from the backend-provided array.
  /// On festival days, festival greetings are prioritized automatically.
  void _refreshHomeGreeting() {
    final feed = homeFeed.value;
    if (feed == null || feed.greetings.isEmpty) return;

    final rng = Random();
    final hour = DateTime.now().hour;

    // Determine the time-of-day bucket
    String bucket;
    if (hour >= 21) {
      bucket = 'night';
    } else if (hour >= 17) {
      bucket = 'evening';
    } else if (hour >= 12) {
      bucket = 'afternoon';
    } else {
      bucket = 'morning';
    }

    // On a festival day, prioritize festival greetings (50% chance)
    List<String> candidates = [];
    if (isFestivalDay && feed.greetings['festival']?.isNotEmpty == true) {
      final festivalList = feed.greetings['festival']!;
      final timeList = feed.greetings[bucket] ?? [];
      // Interleave: festival greetings appear twice as often
      candidates = [...festivalList, ...festivalList, ...timeList];
    } else {
      candidates = feed.greetings[bucket] ?? feed.greetings['general'] ?? [];
    }

    // Fallback to general if the time bucket is empty
    if (candidates.isEmpty) {
      candidates = feed.greetings['general'] ?? [];
    }

    if (candidates.isNotEmpty) {
      currentHomeGreeting.value = candidates[rng.nextInt(candidates.length)];
    }
  }

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
        // Check if image tags contain the selected vibe code
        return img.tags.contains(selectedVibe.value);
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
        for (var t in img.tags) {
          favoriteVibes[t.toLowerCase()] =
              (favoriteVibes[t.toLowerCase()] ?? 0) + 1;
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
        for (var t in img.tags) {
          final vLower = t.toLowerCase();
          if (todVibes.contains(vLower)) score += 1000;
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
