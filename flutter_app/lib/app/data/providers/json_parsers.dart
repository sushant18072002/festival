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

// ─── Top-Level Parser Functions (Required for compute Isolate) ──────────────

HomeFeed parseHomeFeed(String jsonStr) {
  final decoded = jsonDecode(jsonStr);
  return HomeFeed.fromJson(decoded);
}

Taxonomy parseTaxonomy(String jsonStr) {
  return Taxonomy.fromJson(jsonDecode(jsonStr));
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
  final List data = jsonDecode(jsonStr);
  return data.map((e) => SearchItem.fromJson(e)).toList();
}

Map<String, EventModel> parseEventsCatalog(String jsonStr) {
  final decoded = jsonDecode(jsonStr) as Map<String, dynamic>;
  final List eventsJson = decoded['events'] as List? ?? [];

  final map = <String, EventModel>{};
  for (final e in eventsJson) {
    final event = EventModel.fromJson(e as Map<String, dynamic>);
    if (event.slug.isNotEmpty) map[event.slug] = event;
  }
  return map;
}

List<ImageModel> parseImageList(String jsonStr) {
  final decoded = jsonDecode(jsonStr) as Map<String, dynamic>;
  // New schema: { version, images: [...] }
  final List imagesList = decoded['images'] as List? ?? [];
  return imagesList
      .map((img) => ImageModel.fromJson(img as Map<String, dynamic>))
      .toList();
}

List<GreetingModel> parseGreetings(String jsonStr) {
  final decoded = jsonDecode(jsonStr);
  // Backend wraps: { version, greetings: [...] }
  final List data = decoded is Map
      ? (decoded['greetings'] as List? ?? [])
      : decoded as List;
  return data.map((e) => GreetingModel.fromJson(e)).toList();
}

List<QuoteModel> parseQuotes(String jsonStr) {
  final decoded = jsonDecode(jsonStr);
  // Backend wraps: { version, quotes: [...] }
  final List data = decoded is Map
      ? (decoded['quotes'] as List? ?? [])
      : decoded as List;
  return data.map((e) => QuoteModel.fromJson(e)).toList();
}

List<MantraModel> parseMantras(String jsonStr) {
  final decoded = jsonDecode(jsonStr);
  // Backend wraps: { version, mantras: [...] }
  final List data = decoded is Map
      ? (decoded['mantras'] as List? ?? [])
      : decoded as List;
  return data.map((e) => MantraModel.fromJson(e)).toList();
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
  final decoded = jsonDecode(jsonStr);
  return GamificationConfigModel.fromJson(decoded);
}
