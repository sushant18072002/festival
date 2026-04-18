import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:get/get.dart';
import '../services/ambient_audio_service.dart';

import 'package:hive_flutter/hive_flutter.dart';
import 'package:get_storage/get_storage.dart';
import '../models/home_feed_model.dart';
import '../models/taxonomy_model.dart';
import '../models/calendar_model.dart';
import '../models/search_model.dart';
import '../models/event_model.dart';
import '../models/image_model.dart';
import '../models/greeting_model.dart';
import '../models/quote_model.dart';
import '../models/mantra_model.dart';
import '../models/quiz_model.dart';
import '../models/trivia_model.dart';
import '../models/gamification_config_model.dart';
import 'json_provider.dart';
import 'data_source.dart';
import '../../widgets/smart_lottie.dart';

class DataRepository extends GetxService {
  final DataSource _remoteProvider = JsonProvider();
  final _storage = GetStorage();
  late Box _cacheBox;

  final useRemote =
      true.obs; // Always fetch from AWS/CDN (offline handled by Hive cache)
  final currentLang = 'en'.obs;
  
  // Phase 5: Splash Screen Progressive Loading Lock
  final isReady = false.obs;

  // Sync cache for UI consumption
  Taxonomy? currentTaxonomy;

  // In-memory cache for synchronous access (e.g. for Favorites)
  final allEvents = <EventModel>[].obs;
  final allImages = <ImageModel>[].obs;
  final allGreetings = <GreetingModel>[].obs;
  final allQuotes = <QuoteModel>[].obs;
  final allMantras = <MantraModel>[].obs;
  
  // Master metadata maps for hydration
  final _audioCache = <String, AmbientAudio>{};
  final _mantraCache = <String, MantraModel>{};

  // Getters for compatibility
  List<EventModel> get events => allEvents;
  List<ImageModel> get gallery => allImages;

  Future<DataRepository> init() async {
    await _remoteProvider.init();
    _cacheBox = await Hive.openBox('app_data');
    currentLang.value = _storage.read('language') ?? 'en';

    // -- Deploy Health Check: clears Hive cache when a new backend deploy is detected --
    await _checkDeployHealth();

    // Hydra-load data to populate in-memory lists (fire and forget)
    _loadAllData();

    return this;
  }

  /// Fetches deploy_health.json from S3 and selectively clears Hive based on file hashes.
  Future<void> _checkDeployHealth() async {
    try {
      final deployHealth = await _remoteProvider.getDeployHealth();
      if (deployHealth == null) {
        return;
      }
      
      final remoteHash = deployHealth['deploy_hash'] as String?;
      if (remoteHash == null) {
        return;
      }
      
      final localHash = _storage.read('deploy_hash') as String?;
      if (localHash == remoteHash) {
        debugPrint('[DataRepository] Hash match. Cache is valid.');
        return; // No new deploy
      }

      debugPrint(
        '[DataRepository] New deploy detected ($localHash → $remoteHash). Running Selective Sync...',
      );

      // Map of { 'home/home_feed_en.json' : 'abc123hash' }
      final remoteFileHashes = deployHealth['file_hashes'] as Map<String, dynamic>?;
      
      if (remoteFileHashes != null) {
        int clearedCount = 0;
        final localFileHashes = _storage.read<Map<String, dynamic>>('file_hashes') ?? {};

        // Compare each remote file hash against the local one
        remoteFileHashes.forEach((filePath, newHash) {
          final oldHash = localFileHashes[filePath];
          
          if (oldHash != newHash) {
             // File changed! Determine the Hive cache key based on the file path
             final hiveKey = _mapFilePathToHiveKey(filePath);
             if (hiveKey != null) {
                _cacheBox.delete(hiveKey);
                clearedCount++;
             }
          }
        });
        
        debugPrint('[DataRepository] Selective Sync cleared $clearedCount outdated cache items.');
        
        // Save the new hashes for next time
        await _storage.write('file_hashes', remoteFileHashes);
        
      } else {
        // Fallback to legacy full wipe if deploy_health misses file_hashes
        debugPrint('[DataRepository] No file_hashes found, falling back to full cache wipe.');
        await _cacheBox.clear();
      }

      final remoteCache = await Hive.openBox('json_cache');
      await remoteCache.clear();
      await _storage.write('deploy_hash', remoteHash);
    } catch (e) {
      debugPrint('[DataRepository] deploy_health check failed (non-fatal): $e');
    }
  }

  /// Maps an S3 JSON relative path to its corresponding Hive cache key
  String? _mapFilePathToHiveKey(String filePath) {
    // Example: 'home/home_feed_en.json' -> 'home_feed_en'
    if (filePath.contains('home_feed_')) {
      final lang = filePath.split('_').last.replaceAll('.json', '');
      return 'home_feed_$lang';
    }
    if (filePath.contains('taxonomy_')) {
      final lang = filePath.split('_').last.replaceAll('.json', '');
      return 'taxonomy_$lang';
    }
    if (filePath.contains('calendar_')) {
      final lang = filePath.split('_').last.replaceAll('.json', '');
      return 'calendar_data_$lang';
    }
    if (filePath.contains('search_')) {
      final lang = filePath.split('_').last.replaceAll('.json', '');
      return 'search_index_$lang';
    }
    if (filePath.contains('greetings_')) {
      final lang = filePath.split('_').last.replaceAll('.json', '');
      return 'greetings_$lang';
    }
    if (filePath.contains('quotes_')) {
      final lang = filePath.split('_').last.replaceAll('.json', '');
      return 'quotes_$lang';
    }
    if (filePath.contains('mantras_')) {
      final lang = filePath.split('_').last.replaceAll('.json', '');
      return 'mantras_$lang';
    }
    if (filePath.contains('quiz_')) {
      final lang = filePath.split('_').last.replaceAll('.json', '');
      return 'quiz_$lang';
    }
    if (filePath.contains('trivia_')) {
      final lang = filePath.split('_').last.replaceAll('.json', '');
      return 'trivia_$lang';
    }
    if (filePath.contains('gamification_')) {
      final lang = filePath.split('_').last.replaceAll('.json', '');
      return 'gamification_$lang';
    }
    // Note: events catalog and image catalog are parsed directly from remoteCache and don't use 'app_data' box caching keys directly yet, 
    // but the `json_cache` clear handles their network invalidation.
    return null;
  }

  Future<void> changeLanguage(String lang) async {
    if (currentLang.value == lang) return;
    currentLang.value = lang;
    await _storage.write('language', lang);
    // Set loading flag
    isReady.value = false;
    
    // Clear language-specific caches that have early-return guards.
    // Events and Images are handled by _mergeDataInIsolate's assignAll (fetch-then-swap).
    allGreetings.clear();
    allQuotes.clear();
    allMantras.clear();
    currentTaxonomy = null;
    
    // Fetch new language data
    await _loadAllData();
  }

  Future<void> _loadAllData() async {
    final lang = currentLang.value;

    try {
      // 1. Mandatory Core Data (Taxonomy)
      // We await this outside the parallel block if it's strictly required for UI stability
      await getTaxonomy(lang);

      // 2. Parallel Loading of secondary content
      final futures = await Future.wait([
        getHomeFeed(lang),
        getEventsCatalog(lang),
        getImageCatalog(lang),
        getGreetings(lang),
        getQuotes(lang),
      ], eagerError: false).catchError((e) {
        debugPrint('[DataRepository] Partial load failure (secondary data): $e');
        return [null, null, null, null, null];
      });

      final home = futures[0] as HomeFeed?;
      final catalog = futures[1] as Map<String, EventModel>? ?? {};
      final imgList = futures[2] as List<ImageModel>? ?? [];

      // 3. Background Isolate Merge
      try {
        final mergedData = await compute(_mergeDataInIsolate, {
          'home': home,
          'catalog': catalog,
          'imgList': imgList,
          'existingEvents': allEvents.toList(),
          'existingImages': allImages.toList(),
        });

        allEvents.assignAll(mergedData['events'] as List<EventModel>);
        allImages.assignAll(mergedData['images'] as List<ImageModel>);
      } catch (e) {
        debugPrint('[DataRepository] Isolate Merge failed: $e');
      }
      
      // 4. Content Hydration
      await _hydrateData().catchError((e) {
        debugPrint('[DataRepository] Hydration failed: $e');
      });

    } catch (e) {
      debugPrint('[DataRepository] Critical load failure: $e');
    } finally {
      // Release the splash screen UI lock regardless of secondary failures
      isReady.value = true;
      
      // Post-load tasks (prime cache for tomorrow)
      _prewarmNextMajorFestival();
    }
  }

  /// Resolves slugs (like ambient_audio_slug) into full objects using master seeds.
  Future<void> _hydrateData() async {
    try {
      // 1. Load Audio Seeds if not cached
      if (_audioCache.isEmpty) {
        final audioData = await _remoteProvider.getAmbientAudioSeeds();
        if (audioData != null) {
          for (var item in audioData) {
            final audio = AmbientAudio.fromJson(item);
            _audioCache[audio.slug] = audio;
          }
        }
      }

      // 2. Load Mantra Seeds if not cached
      if (_mantraCache.isEmpty) {
        final mantraData = await _remoteProvider.getMantraSeeds();
        if (mantraData != null) {
          for (var item in mantraData) {
            final mantra = MantraModel.fromJson(item);
            _mantraCache[mantra.slug] = mantra;
          }
        }
      }

      // 3. Hydrate allEvent objects
      final hydratedEvents = allEvents.map((event) {
        if (event.ambientAudioSlug == null || event.ambientAudioSlug!.isEmpty) {
          return event;
        }

        final audio = _audioCache[event.ambientAudioSlug];
        if (audio == null) return event;

        // Return a copy of the event with the hydrated audio object
        return event.copyWith(ambientAudio: audio);
      }).toList();

      allEvents.assignAll(hydratedEvents);
      debugPrint('[DataRepository] Hydration Complete: ${allEvents.length} events processed.');
    } catch (e) {
      debugPrint('[DataRepository] Hydration Failed: $e');
    }
  }

  /// Primes the local cache for festivals happening in the next 48 hours.
  void _prewarmNextMajorFestival() {
    final now = DateTime.now();
    // Find events happening in the next 48 hours
    final upcoming = allEvents.where((e) {
      final dt = e.nextOccurrence ?? e.date;
      return dt != null &&
          dt.isAfter(now) &&
          dt.difference(now).inHours <= 48;
    }).toList();

    if (upcoming.isEmpty) {
      return;
    }

    // 1. Collect all unique Lottie keys/urls
    final lotties = upcoming
        .where((e) => e.lottieOverlay != null)
        .map((e) => e.lottieOverlay!.s3Key.isNotEmpty
            ? e.lottieOverlay!.s3Key
            : e.lottieOverlay!.filename)
        .toSet()
        .toList();

    if (lotties.isNotEmpty) {
      debugPrint(
        '[DataRepository] Proactively pre-warming ${lotties.length} Lottie assets for the next 48 hours...',
      );
      SmartLottie.preCache(lotties);
    }

    // 2. Collect and pre-warm Ambient Audio assets
    final audioUrls = upcoming
        .where((e) => e.ambientAudio?.s3Key.isNotEmpty == true)
        .map((e) => e.ambientAudio!.s3Key)
        .toSet()
        .toList();

    if (audioUrls.isNotEmpty) {
      debugPrint(
        '[DataRepository] Proactively pre-warming ${audioUrls.length} Audio assets for the next 48 hours...',
      );
      for (final url in audioUrls) {
        AmbientAudioService.to.preCache(url);
      }
    }

    // 3. Collect and pre-warm Mantra assets
    final mantraUrls = upcoming
        .expand((e) => e.mantras)
        .where((m) => m.audioFile.isNotEmpty)
        .map((m) => m.audioFile)
        .toSet()
        .toList();

    if (mantraUrls.isNotEmpty) {
      debugPrint(
        '[DataRepository] Proactively pre-warming ${mantraUrls.length} Mantra assets for the next 48 hours...',
      );
      for (final url in mantraUrls) {
        AmbientAudioService.to.preCache(url);
      }
    }
  }

  // Top-level function for Isolate explicitly
  static Map<String, dynamic> _mergeDataInIsolate(Map<String, dynamic> args) {
    final home = args['home'] as HomeFeed?;
    final catalog = args['catalog'] as Map<String, EventModel>;
    final imgList = args['imgList'] as List<ImageModel>;

    final events = List<EventModel>.from(
      args['existingEvents'] as List<EventModel>,
    );
    final images = List<ImageModel>.from(
      args['existingImages'] as List<ImageModel>,
    );

    // 1. Merge HomeFeed
    if (home != null) {
      for (final section in home.sections) {
        for (final item in section.items) {
          if (item is EventModel) {
            if (!events.any((e) => e.id == item.id)) events.add(item);
          } else if (item is ImageModel) {
            if (!images.any((i) => i.id == item.id)) images.add(item);
          }
        }
      }
    }

    // 2. Merge Events Catalog
    for (final event in catalog.values) {
      final idx = events.indexWhere((e) => e.id == event.id);
      if (idx >= 0) {
        events[idx] = event;
      } else {
        events.add(event);
      }
    }

    // 3. Merge flat Image list — deduplicate by id
    for (final image in imgList) {
      if (!images.any((i) => i.id == image.id)) {
        images.add(image);
      }
    }

    return {'events': events, 'images': images};
  }

  /// Get all images as a flat list.
  Future<List<ImageModel>?> getImageCatalog([String lang = 'en']) async {
    final remote = await _remoteProvider.getImageCatalog(lang);
    if (remote != null && remote.isNotEmpty) {
      return remote;
    }
    return null;
  }

  void toggleRemote(bool value) {
    useRemote.value = value;
    _storage.write('use_remote', value);
  }

  // Generic fetcher with fallback strategy
  // 1. If Online Mode: Try Remote -> Cache -> Asset
  // 2. If Offline Mode: Try Cache -> Asset -> Remote (Optional)

  Future<HomeFeed?> getHomeFeed(String lang) async {
    final remote = await _remoteProvider.getHomeFeed(lang);
    if (remote != null) {
      return remote;
    }

    // Try Cache
    final cached = _cacheBox.get('home_feed_$lang');
    if (cached != null) {
      try {
        final feed = HomeFeed.fromJson(jsonDecode(cached));
        // Validate cache
        if (feed.sections.isNotEmpty && feed.sections.first.items.isNotEmpty) {
          return feed;
        }
      } catch (e) {
        debugPrint('Cache parse error: $e');
      }
    }

    return null;
  }

  Future<Taxonomy?> getTaxonomy(String lang) async {
    final remote = await _remoteProvider.getTaxonomy(lang);
    if (remote != null) {
      currentTaxonomy = remote;
      return remote;
    }

    final cached = _cacheBox.get('taxonomy_$lang');
    if (cached != null) {
      currentTaxonomy = Taxonomy.fromJson(jsonDecode(cached));
      return currentTaxonomy;
    }

    return null;
  }

  Future<CalendarData?> getCalendarData(String lang) async {
    final remote = await _remoteProvider.getCalendarData(lang);
    if (remote != null) return remote;

    final cached = _cacheBox.get('calendar_data_$lang');
    if (cached != null) {
      return CalendarData.fromJson(jsonDecode(cached));
    }

    return null;
  }

  Future<List<SearchItem>?> getSearchIndex(String lang) async {
    final remote = await _remoteProvider.getSearchIndex(lang);
    if (remote != null) return remote;

    final cached = _cacheBox.get('search_index_$lang');
    if (cached != null) {
      final data = jsonDecode(cached) as List;
      return data.map((e) => SearchItem.fromJson(e)).toList();
    }

    return null;
  }

  // ─── Overlays & Content ───────────────────────────────────────────────────

  Future<List<GreetingModel>?> getGreetings(String lang) async {
    if (allGreetings.isNotEmpty) return allGreetings;

    final remote = await _remoteProvider.getGreetings(lang);
    if (remote != null) {
      allGreetings.assignAll(remote);
      return remote;
    }

    final cached = _cacheBox.get('greetings_$lang');
    if (cached != null) {
      final data = jsonDecode(cached) as List;
      final list = data.map((e) => GreetingModel.fromJson(e)).toList();
      allGreetings.assignAll(list);
      return list;
    }

    return null;
  }

  Future<List<QuoteModel>?> getQuotes(String lang) async {
    if (allQuotes.isNotEmpty) return allQuotes;

    final remote = await _remoteProvider.getQuotes(lang);
    if (remote != null) {
      allQuotes.assignAll(remote);
      return remote;
    }

    final cached = _cacheBox.get('quotes_$lang');
    if (cached != null) {
      final data = jsonDecode(cached) as List;
      final list = data.map((e) => QuoteModel.fromJson(e)).toList();
      allQuotes.assignAll(list);
      return list;
    }

    return null;
  }

  Future<List<MantraModel>?> getMantras(String lang) async {
    if (allMantras.isNotEmpty) return allMantras;

    final remote = await _remoteProvider.getMantras(lang);
    if (remote != null) {
      allMantras.assignAll(remote);
      return remote;
    }

    final cached = _cacheBox.get('mantras_$lang');
    if (cached != null) {
      final data = jsonDecode(cached) as List;
      final list = data.map((e) => MantraModel.fromJson(e)).toList();
      allMantras.assignAll(list);
      return list;
    }

    return null;
  }

  Future<Map<String, EventModel>> getEventsCatalog([String lang = 'en']) async {
    final remote = await _remoteProvider.getEventsCatalog(lang);
    if (remote != null && remote.isNotEmpty) {
      return remote;
    }
    return {};
  }

  /// Find a full EventModel by ID.
  /// Strategy: in-memory allEvents (already seeded with catalog) → O(1) map lookup.
  Future<EventModel?> getEventById(String id) async {
    // 1. In-memory list (seeded from catalog at startup)
    final matches = allEvents.where((e) => e.id == id);
    if (matches.isNotEmpty) {
      final cached = matches.first;
      if (cached.description.isNotEmpty) return cached;
      // Partial event — try catalog by slug
      if (cached.slug.isNotEmpty) {
        final full = await getEventBySlug(cached.slug, currentLang.value);
        if (full != null) return full;
      }
    }

    // 2. Try catalog directly (brute-force by id)
    final catalog = await getEventsCatalog(currentLang.value);
    final fromCatalog = catalog.values.where((e) => e.id == id);
    if (fromCatalog.isNotEmpty) return fromCatalog.first;

    return null;
  }

  /// Get event detail by slug — O(1) catalog lookup.
  Future<EventModel?> getEventBySlug(String slug, [String lang = 'en']) async {
    return await _remoteProvider.getEventBySlug(slug, lang);
  }

  // ── Gamification Endpoints ────────────────────────────────────────────────

  Future<List<QuizModel>?> getQuizzes(String lang) async {
    final remote = await _remoteProvider.getQuizzes(lang);
    if (remote != null) return remote;

    final cached = _cacheBox.get('quiz_$lang');
    if (cached != null) {
      final data = jsonDecode(cached) as Map<String, dynamic>;
      final listData = data['quizzes'] as List? ?? [];
      return listData.map((e) => QuizModel.fromJson(e)).toList();
    }
    return null;
  }

  Future<List<TriviaModel>?> getTrivia(String lang) async {
    final remote = await _remoteProvider.getTrivia(lang);
    if (remote != null) return remote;

    final cached = _cacheBox.get('trivia_$lang');
    if (cached != null) {
      final data = jsonDecode(cached) as Map<String, dynamic>;
      final listData = data['trivia'] as List? ?? [];
      return listData.map((e) => TriviaModel.fromJson(e)).toList();
    }
    return null;
  }

  Future<GamificationConfigModel?> getGamificationConfig(String lang) async {
    final remote = await _remoteProvider.getGamificationConfig(lang);
    if (remote != null) return remote;

    final cached = _cacheBox.get('gamification_$lang');
    if (cached != null) {
      return GamificationConfigModel.fromJson(jsonDecode(cached));
    }
    return null;
  }
}
