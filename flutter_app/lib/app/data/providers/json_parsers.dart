import 'dart:convert';
import 'package:flutter/foundation.dart';
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

// ─── Top-Level Parser Functions (Required for compute Isolate) ──────────────

HomeFeed parseHomeFeed(String jsonStr) {
  try {
    final decoded = jsonDecode(jsonStr);
    return HomeFeed.fromJson(decoded);
  } catch (e) {
    _logParseError('HomeFeed', jsonStr, e);
    return HomeFeed(version: '1.0', language: 'en', sections: []); // Return empty default
  }
}

Taxonomy parseTaxonomy(String jsonStr) {
  try {
    return Taxonomy.fromJson(jsonDecode(jsonStr));
  } catch (e) {
    _logParseError('Taxonomy', jsonStr, e);
    return Taxonomy(categories: [], tags: [], vibes: []);
  }
}

CalendarData parseCalendarData(String jsonStr) {
  final dynamic decoded = jsonDecode(jsonStr);
  Map<String, dynamic> data;

  if (decoded is String) {
    data = Map<String, dynamic>.from(jsonDecode(decoded));
  } else if (decoded is Map) {
    data = Map<String, dynamic>.from(decoded);
  } else {
    throw Exception('Unexpected JSON format: ${decoded.runtimeType}');
  }

  return CalendarData.fromJson(data);
}

List<SearchItem> parseSearchIndex(String jsonStr) {
  try {
    final List data = jsonDecode(jsonStr);
    return data.map((e) => SearchItem.fromJson(e)).toList();
  } catch (e) {
    _logParseError('SearchIndex', jsonStr, e);
    return [];
  }
}

Map<String, EventModel> parseEventsCatalog(String jsonStr) {
  try {
    final decoded = jsonDecode(jsonStr) as Map<String, dynamic>;
    final List eventsJson = decoded['events'] as List? ?? [];

    final map = <String, EventModel>{};
    for (final e in eventsJson) {
      final event = EventModel.fromJson(e as Map<String, dynamic>);
      if (event.slug.isNotEmpty) map[event.slug] = event;
    }
    return map;
  } catch (e) {
    _logParseError('EventsCatalog', jsonStr, e);
    return {};
  }
}

List<ImageModel> parseImageList(String jsonStr) {
  try {
    final decoded = jsonDecode(jsonStr) as Map<String, dynamic>;
    final List imagesList = decoded['images'] as List? ?? [];
    return imagesList
        .map((img) => ImageModel.fromJson(img as Map<String, dynamic>))
        .toList();
  } catch (e) {
    _logParseError('ImageList', jsonStr, e);
    return [];
  }
}

List<GreetingModel> parseGreetings(String jsonStr) {
  try {
    final decoded = jsonDecode(jsonStr);
    final List data = decoded is Map
        ? (decoded['greetings'] as List? ?? [])
        : decoded as List;
    return data.map((e) => GreetingModel.fromJson(e)).toList();
  } catch (e) {
    _logParseError('Greetings', jsonStr, e);
    return [];
  }
}

List<QuoteModel> parseQuotes(String jsonStr) {
  try {
    final decoded = jsonDecode(jsonStr);
    final List data = decoded is Map
        ? (decoded['quotes'] as List? ?? [])
        : decoded as List;
    return data.map((e) => QuoteModel.fromJson(e)).toList();
  } catch (e) {
    _logParseError('Quotes', jsonStr, e);
    return [];
  }
}

List<MantraModel> parseMantras(String jsonStr) {
  try {
    final decoded = jsonDecode(jsonStr);
    final List data = decoded is Map
        ? (decoded['mantras'] as List? ?? [])
        : decoded as List;
    return data.map((e) => MantraModel.fromJson(e)).toList();
  } catch (e) {
    _logParseError('Mantras', jsonStr, e);
    return [];
  }
}

List<QuizModel> parseQuizzes(String jsonStr) {
  final decoded = jsonDecode(jsonStr);
  final List data = decoded is Map
      ? (decoded['quizzes'] as List? ?? [])
      : decoded as List;
  return data.map((e) => QuizModel.fromJson(e)).toList();
}

List<TriviaModel> parseTrivia(String jsonStr) {
  final decoded = jsonDecode(jsonStr);
  final List data = decoded is Map
      ? (decoded['trivia'] as List? ?? [])
      : decoded as List;
  return data.map((e) => TriviaModel.fromJson(e)).toList();
}

GamificationConfigModel parseGamificationConfig(String jsonStr) {
  try {
    final decoded = jsonDecode(jsonStr);
    return GamificationConfigModel.fromJson(decoded);
  } catch (e) {
    _logParseError('GamificationConfig', jsonStr, e);
    return GamificationConfigModel(version: 1);
  }
}

void _logParseError(String type, String content, dynamic error) {
  debugPrint('================================================================');
  debugPrint('[JSON Parser] Critical Error in $type');
  debugPrint('Error: $error');
  debugPrint('Snippet (First 100 chars):');
  debugPrint(content.length > 100 ? content.substring(0, 100) : content);
  debugPrint('================================================================');
}
