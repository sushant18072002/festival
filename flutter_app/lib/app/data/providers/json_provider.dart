import 'package:dio/dio.dart';
import 'package:dio_smart_retry/dio_smart_retry.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter/foundation.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'dart:convert';
import '../models/home_feed_model.dart';
import '../models/taxonomy_model.dart';
import '../models/calendar_model.dart';
import '../models/search_model.dart';
import '../models/greeting_model.dart';
import '../models/quote_model.dart';
import '../models/mantra_model.dart';
import '../models/event_model.dart';
import '../models/image_model.dart';
import '../models/quiz_model.dart';
import '../models/trivia_model.dart';
import '../models/gamification_config_model.dart';
import 'data_source.dart';
import 'json_parsers.dart';

class JsonProvider implements DataSource {
  late Dio _dio;
  late Box _cacheBox;
  final String _baseUrl = dotenv.env['API_BASE_URL'] ?? '';

  JsonProvider() {
    _dio = Dio(
      BaseOptions(
        baseUrl: _baseUrl,
        connectTimeout: const Duration(seconds: 10),
        receiveTimeout: const Duration(seconds: 10),
        responseType: ResponseType.plain,
      ),
    );

    _dio.interceptors.add(
      RetryInterceptor(
        dio: _dio,
        logPrint: debugPrint,
        retries: 3,
        retryDelays: const [
          Duration(seconds: 1),
          Duration(seconds: 2),
          Duration(seconds: 3),
        ],
      ),
    );
  }

  @override
  Future<void> init() async {
    _cacheBox = await Hive.openBox('json_cache');
  }

  @override
  Future<int> getVersion() async {
    try {
      final response = await _dio.get('/version/version.json');
      if (response.statusCode == 200) {
        final map =
            jsonDecode(response.data.toString()) as Map<String, dynamic>;
        return map['version'] as int? ?? 0;
      }
    } catch (_) {}
    return 0;
  }

  @override
  Future<Map<String, dynamic>?> getDeployHealth() async {
    // No Hive caching! We intentionally always fetch fresh — max-age=30s on S3 ensures low latency.
    try {
      final response = await _dio.get('/deploy_health.json');
      if (response.statusCode == 200) {
        return jsonDecode(response.data.toString()) as Map<String, dynamic>;
      }
    } catch (_) {}
    return null;
  }

  @override
  Future<HomeFeed?> getHomeFeed(String lang) async {
    final endpoint = '/home/home_feed_$lang.json';
    try {
      final response = await _dio.get(endpoint);
      if (response.statusCode == 200) {
        final String jsonStr = response.data.toString();
        await _cacheBox.put('home_feed_$lang', jsonStr);
        return await compute(parseHomeFeed, jsonStr);
      }
    } on DioException catch (e) {
      debugPrint(
        'Network Error (HomeFeed): ${e.message} - Status: ${e.response?.statusCode}',
      );
      debugPrint('Response Data: ${e.response?.data}');
    } catch (e) {
      debugPrint('Network Error: $e');
    }

    final cached = _cacheBox.get('home_feed_$lang');
    if (cached != null) {
      try {
        return await compute(parseHomeFeed, cached as String);
      } catch (e) {
        debugPrint(
          'Cache Error (HomeFeed): Corrupted data, clearing cache. $e',
        );
        await _cacheBox.delete('home_feed_$lang');
      }
    }

    return null;
  }

  @override
  Future<Taxonomy?> getTaxonomy(String lang) async {
    final endpoint = '/home/taxonomy_$lang.json';
    try {
      final response = await _dio.get(endpoint);
      if (response.statusCode == 200) {
        final String jsonStr = response.data.toString();
        await _cacheBox.put('taxonomy_$lang', jsonStr);
        return await compute(parseTaxonomy, jsonStr);
      }
    } on DioException catch (e) {
      debugPrint(
        'Network Error (Taxonomy): ${e.message} - Status: ${e.response?.statusCode}',
      );
      debugPrint('Response Data: ${e.response?.data}');
    } catch (e) {
      debugPrint('Network Error: $e');
    }

    final cached = _cacheBox.get('taxonomy_$lang');
    if (cached != null) {
      try {
        return await compute(parseTaxonomy, cached as String);
      } catch (e) {
        debugPrint(
          'Cache Error (Taxonomy): Corrupted data, clearing cache. $e',
        );
        await _cacheBox.delete('taxonomy_$lang');
      }
    }
    return null;
  }

  @override
  Future<CalendarData?> getCalendarData(String lang) async {
    final endpoint = lang == 'en'
        ? '/calendar/calendar_data.json'
        : '/calendar/calendar_data_$lang.json';
    try {
      final response = await _dio.get(endpoint);
      if (response.statusCode == 200) {
        final String jsonStr = response.data.toString();
        await _cacheBox.put('calendar_data_$lang', jsonStr);
        return await compute(parseCalendarData, jsonStr);
      }
    } catch (e) {
      debugPrint('Network Error: $e');
    }

    final cached = _cacheBox.get('calendar_data_$lang');
    if (cached != null) {
      try {
        return await compute(parseCalendarData, cached as String);
      } catch (e) {
        debugPrint(
          'Cache Error (Calendar): Corrupted data, clearing cache. $e',
        );
        await _cacheBox.delete('calendar_data_$lang');
      }
    }
    return null;
  }

  @override
  Future<List<SearchItem>?> getSearchIndex(String lang) async {
    final endpoint = lang == 'en'
        ? '/search/search_index.json'
        : '/search/search_index_$lang.json';
    try {
      final response = await _dio.get(endpoint);
      if (response.statusCode == 200) {
        final String jsonStr = response.data.toString();
        await _cacheBox.put('search_index_$lang', jsonStr);
        return await compute(parseSearchIndex, jsonStr);
      }
    } catch (e) {
      debugPrint('Network Error: $e');
    }

    final cached = _cacheBox.get('search_index_$lang');
    if (cached != null) {
      return await compute(parseSearchIndex, cached as String);
    }
    return null;
  }

  @override
  Future<List<GreetingModel>?> getGreetings(String lang) async {
    final endpoint = '/greetings/greetings_$lang.json';
    try {
      final response = await _dio.get(endpoint);
      if (response.statusCode == 200) {
        final String jsonStr = response.data.toString();
        await _cacheBox.put('greetings_$lang', jsonStr);
        return await compute(parseGreetings, jsonStr);
      }
    } catch (e) {
      debugPrint('Network Error: $e');
    }
    final cached = _cacheBox.get('greetings_$lang');
    if (cached != null) {
      return await compute(parseGreetings, cached as String);
    }
    return null;
  }

  @override
  Future<List<QuoteModel>?> getQuotes(String lang) async {
    final endpoint = '/quotes/quotes_$lang.json';
    try {
      final response = await _dio.get(endpoint);
      if (response.statusCode == 200) {
        final String jsonStr = response.data.toString();
        await _cacheBox.put('quotes_$lang', jsonStr);
        return await compute(parseQuotes, jsonStr);
      }
    } catch (e) {
      debugPrint('Network Error: $e');
    }
    final cached = _cacheBox.get('quotes_$lang');
    if (cached != null) {
      return await compute(parseQuotes, cached as String);
    }
    return null;
  }

  @override
  Future<List<MantraModel>?> getMantras(String lang) async {
    final endpoint = '/mantras/mantras_$lang.json';
    try {
      final response = await _dio.get(endpoint);
      if (response.statusCode == 200) {
        final String jsonStr = response.data.toString();
        await _cacheBox.put('mantras_$lang', jsonStr);
        return await compute(parseMantras, jsonStr);
      }
    } catch (e) {
      debugPrint('Network Error: $e');
    }
    final cached = _cacheBox.get('mantras_$lang');
    if (cached != null) {
      return await compute(parseMantras, cached as String);
    }
    return null;
  }

  @override
  Future<Map<String, EventModel>?> getEventsCatalog(String lang) async {
    final endpoint = '/events/catalog/events_catalog_$lang.json';
    try {
      final response = await _dio.get(endpoint);
      if (response.statusCode == 200) {
        final String jsonStr = response.data.toString();
        await _cacheBox.put('events_catalog_$lang', jsonStr);
        return await compute(parseEventsCatalog, jsonStr);
      }
    } catch (e) {
      debugPrint('Network Error: $e');
    }
    final cached = _cacheBox.get('events_catalog_$lang');
    if (cached != null) {
      return await compute(parseEventsCatalog, cached as String);
    }
    return null;
  }

  @override
  Future<EventModel?> getEventBySlug(String slug, String lang) async {
    final catalog = await getEventsCatalog(lang);
    return catalog?[slug];
  }

  @override
  Future<List<ImageModel>?> getImageCatalog(String lang) async {
    final endpoint = '/images/images_$lang.json';
    try {
      final response = await _dio.get(endpoint);
      if (response.statusCode == 200) {
        final String jsonStr = response.data.toString();
        await _cacheBox.put('images_$lang', jsonStr);
        return await compute(parseImageList, jsonStr);
      }
    } catch (e) {
      debugPrint('Network Error: $e');
    }
    final cached = _cacheBox.get('images_$lang');
    if (cached != null) {
      return await compute(parseImageList, cached as String);
    }
    return null;
  }

  @override
  Future<List<QuizModel>?> getQuizzes(String lang) async {
    final endpoint = '/quiz/quiz_$lang.json';
    try {
      final response = await _dio.get(endpoint);
      if (response.statusCode == 200) {
        final String jsonStr = response.data.toString();
        await _cacheBox.put('quiz_$lang', jsonStr);
        return await compute(parseQuizzes, jsonStr);
      }
    } catch (e) {
      debugPrint('Network Error: $e');
    }
    final cached = _cacheBox.get('quiz_$lang');
    if (cached != null) {
      return await compute(parseQuizzes, cached as String);
    }
    return null;
  }

  @override
  Future<List<TriviaModel>?> getTrivia(String lang) async {
    final endpoint = '/trivia/trivia_$lang.json';
    try {
      final response = await _dio.get(endpoint);
      if (response.statusCode == 200) {
        final String jsonStr = response.data.toString();
        await _cacheBox.put('trivia_$lang', jsonStr);
        return await compute(parseTrivia, jsonStr);
      }
    } catch (e) {
      debugPrint('Network Error: $e');
    }
    final cached = _cacheBox.get('trivia_$lang');
    if (cached != null) {
      return await compute(parseTrivia, cached as String);
    }
    return null;
  }

  @override
  Future<GamificationConfigModel?> getGamificationConfig(String lang) async {
    final endpoint = '/gamification/gamification_$lang.json';
    try {
      final response = await _dio.get(endpoint);
      if (response.statusCode == 200) {
        final String jsonStr = response.data.toString();
        await _cacheBox.put('gamification_$lang', jsonStr);
        return await compute(parseGamificationConfig, jsonStr);
      }
    } catch (e) {
      debugPrint('Network Error: $e');
    }
    final cached = _cacheBox.get('gamification_$lang');
    if (cached != null) return parseGamificationConfig(cached.toString());
    return null;
  }

  @override
  Future<List<dynamic>?> getAmbientAudioSeeds() async {
    const endpoint = '/ambient_audio_seed.json';
    try {
      final response = await _dio.get(endpoint);
      if (response.statusCode == 200) {
        return jsonDecode(response.data.toString()) as List<dynamic>;
      }
    } catch (e) {
      debugPrint('Error fetching Audio Seeds: $e');
    }
    return null;
  }

  @override
  Future<List<dynamic>?> getMantraSeeds() async {
    const endpoint = '/mantras_seed.json';
    try {
      final response = await _dio.get(endpoint);
      if (response.statusCode == 200) {
        return jsonDecode(response.data.toString()) as List<dynamic>;
      }
    } catch (e) {
      debugPrint('Error fetching Mantra Seeds: $e');
    }
    return null;
  }
}
