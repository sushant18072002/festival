import 'package:flutter/services.dart';
import 'package:flutter/foundation.dart';
import 'dart:convert';
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
import 'data_source.dart';
import 'json_parsers.dart';

class AssetDataSource implements DataSource {
  // ─── In-memory catalog cache (loaded once, keyed by slug) ───────────────
  // Lang → slug → EventModel
  final Map<String, Map<String, EventModel>> _catalogCache = {};

  @override
  Future<void> init() async {
    // No-op for assets
  }

  @override
  Future<int> getVersion() async {
    try {
      final jsonStr = await rootBundle.loadString(
        'assets/data/version/version.json',
      );
      final map = jsonDecode(jsonStr) as Map<String, dynamic>;
      return map['version'] as int? ?? 0;
    } catch (_) {
      return 0;
    }
  }

  @override
  Future<Map<String, dynamic>?> getDeployHealth() async => null; // No deploy health for local assets

  // Lang → slug → List<ImageModel>
  final Map<String, Map<String, List<ImageModel>>> _imageCatalogCache = {};

  // ─── Home Feed ────────────────────────────────────────────────────────────
  @override
  Future<HomeFeed?> getHomeFeed(String lang) async {
    try {
      final jsonStr = await rootBundle.loadString(
        'assets/data/home/home_feed.json',
      );
      return await compute(parseHomeFeed, jsonStr);
    } catch (e) {
      debugPrint('Asset Error (HomeFeed): $e');
      return null;
    }
  }

  // ─── Taxonomy ─────────────────────────────────────────────────────────────
  @override
  Future<Taxonomy?> getTaxonomy(String lang) async {
    try {
      final jsonStr = await rootBundle.loadString(
        'assets/data/home/taxonomy.json',
      );
      return await compute(parseTaxonomy, jsonStr);
    } catch (e) {
      debugPrint('Asset Error (Taxonomy): $e');
      return null;
    }
  }

  // ─── Calendar ─────────────────────────────────────────────────────────────
  @override
  Future<CalendarData?> getCalendarData(String lang) async {
    try {
      final jsonStr = await rootBundle.loadString(
        'assets/data/calendar/calendar_data.json',
      );
      return await compute(parseCalendarData, jsonStr);
    } catch (e) {
      debugPrint('Asset Error (Calendar): $e');
      return null;
    }
  }

  // ─── Search Index ─────────────────────────────────────────────────────────
  @override
  Future<List<SearchItem>?> getSearchIndex(String lang) async {
    try {
      final jsonStr = await rootBundle.loadString(
        'assets/data/search/search_index.json',
      );
      return await compute(parseSearchIndex, jsonStr);
    } catch (e) {
      debugPrint('Asset Error (Search): $e');
      return null;
    }
  }

  // ─── Events Catalog (single file per language) ───────────────────────────
  //
  // Loads events_catalog_{lang}.json → falls back to events_catalog.json (en).
  // Files live in assets/data/events/catalog/ (separate from per-event images).
  // Result is cached in memory — O(1) lookups after first load.

  @override
  Future<Map<String, EventModel>> getEventsCatalog(String lang) async {
    // Return cached version if available for this language
    if (_catalogCache.containsKey(lang)) return _catalogCache[lang]!;

    final paths = lang != 'en'
        ? [
            'assets/data/events/catalog/events_catalog_$lang.json',
            'assets/data/events/catalog/events_catalog.json',
          ]
        : ['assets/data/events/catalog/events_catalog.json'];

    for (final assetPath in paths) {
      try {
        final jsonStr = await rootBundle.loadString(assetPath);
        final map = await compute(parseEventsCatalog, jsonStr);

        _catalogCache[lang] = map;
        debugPrint(
          'Loaded events_catalog ($lang): ${map.length} events from $assetPath',
        );
        return map;
      } catch (_) {
        // Try next path
      }
    }

    debugPrint('Asset Error (EventsCatalog): No catalog found for lang: $lang');
    _catalogCache[lang] = {}; // Prevent repeated failed loads
    return {};
  }

  @override
  Future<EventModel?> getEventBySlug(String slug, String lang) async {
    final catalog = await getEventsCatalog(lang);
    return catalog[slug];
  }

  /// Invalidate catalog cache for a specific language (call on language change).
  void invalidateCatalogCache([String? lang]) {
    if (lang != null) {
      _catalogCache.remove(lang);
      _imageCatalogCache.remove(lang);
    } else {
      _catalogCache.clear();
      _imageCatalogCache.clear();
    }
  }

  // ─── Global Image Catalog (single file per language) ────────────────────
  //
  // Loads images_{lang}.json → falls back to images_en.json.
  // Files live in assets/data/images/ (consolidated lists).
  //
  @override
  Future<Map<String, List<ImageModel>>> getImageCatalog(String lang) async {
    if (_imageCatalogCache.containsKey(lang)) return _imageCatalogCache[lang]!;

    final paths = lang != 'en'
        ? [
            'assets/data/images/images_$lang.json',
            'assets/data/images/images_en.json',
          ]
        : ['assets/data/images/images_en.json'];

    for (final assetPath in paths) {
      try {
        final jsonStr = await rootBundle.loadString(assetPath);
        final map = await compute(parseImageCatalog, jsonStr);

        _imageCatalogCache[lang] = map;
        debugPrint(
          'Loaded image_catalog ($lang): ${map.length} events from $assetPath',
        );
        return map;
      } catch (_) {
        // Try next
      }
    }

    debugPrint('Asset Error (ImageCatalog): No image catalog found for: $lang');
    _imageCatalogCache[lang] = {};
    return {};
  }

  // ─── Overlays & Content ───────────────────────────────────────────────────
  @override
  Future<List<GreetingModel>> getGreetings(String lang) async {
    final paths = lang != 'en'
        ? [
            'assets/data/greetings/greetings_$lang.json',
            'assets/data/greetings/greetings_en.json',
          ]
        : ['assets/data/greetings/greetings_en.json'];
    for (final path in paths) {
      try {
        final jsonStr = await rootBundle.loadString(path);
        return await compute(parseGreetings, jsonStr);
      } catch (_) {}
    }
    return [];
  }

  @override
  Future<List<QuoteModel>> getQuotes(String lang) async {
    final paths = lang != 'en'
        ? [
            'assets/data/quotes/quotes_$lang.json',
            'assets/data/quotes/quotes_en.json',
          ]
        : ['assets/data/quotes/quotes_en.json'];
    for (final path in paths) {
      try {
        final jsonStr = await rootBundle.loadString(path);
        return await compute(parseQuotes, jsonStr);
      } catch (_) {}
    }
    return [];
  }

  @override
  Future<List<MantraModel>> getMantras(String lang) async {
    final paths = lang != 'en'
        ? [
            'assets/data/mantras/mantras_$lang.json',
            'assets/data/mantras/mantras_en.json',
          ]
        : ['assets/data/mantras/mantras_en.json'];
    for (final path in paths) {
      try {
        final jsonStr = await rootBundle.loadString(path);
        return await compute(parseMantras, jsonStr);
      } catch (_) {}
    }
    return [];
  }

  @override
  Future<List<QuizModel>?> getQuizzes(String lang) async {
    final paths = lang != 'en'
        ? [
            'assets/data/quiz/quiz_$lang.json',
            'assets/data/quiz/quiz_en.json',
          ]
        : ['assets/data/quiz/quiz_en.json'];
    for (final path in paths) {
      try {
        final jsonStr = await rootBundle.loadString(path);
        return await compute(parseQuizzes, jsonStr);
      } catch (_) {}
    }
    return [];
  }

  @override
  Future<List<TriviaModel>?> getTrivia(String lang) async {
    final paths = lang != 'en'
        ? [
            'assets/data/trivia/trivia_$lang.json',
            'assets/data/trivia/trivia_en.json',
          ]
        : ['assets/data/trivia/trivia_en.json'];
    for (final path in paths) {
      try {
        final jsonStr = await rootBundle.loadString(path);
        return await compute(parseTrivia, jsonStr);
      } catch (_) {}
    }
    return [];
  }

  @override
  Future<GamificationConfigModel?> getGamificationConfig(String lang) async {
    final paths = lang != 'en'
        ? [
            'assets/data/gamification/gamification_$lang.json',
            'assets/data/gamification/gamification_en.json',
          ]
        : ['assets/data/gamification/gamification_en.json'];
    for (final path in paths) {
      try {
        final jsonStr = await rootBundle.loadString(path);
        return await compute(parseGamificationConfig, jsonStr);
      } catch (_) {}
    }
    return null;
  }
}
