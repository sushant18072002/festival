import 'event_model.dart';
import 'image_model.dart';

typedef ItemParser = dynamic Function(Map<String, dynamic> json);

class FeedSectionParserRegistry {
  static final Map<String, ItemParser> _parsers = {
    'history': (json) => HistoryItem.fromJson(json),
    'upcoming': (json) => EventModel.fromJson(json),
    'trending': (json) => ImageModel.fromJson(json),
  };

  static void registerParser(String code, ItemParser parser) {
    _parsers[code] = parser;
  }

  static ItemParser? getParser(String code) => _parsers[code];
}

class HomeFeed {
  final String version;
  final String language;
  final List<FeedSection> sections;

  HomeFeed({
    required this.version,
    required this.language,
    required this.sections,
  });

  factory HomeFeed.fromJson(Map<String, dynamic> json) {
    return HomeFeed(
      version: json['version'] ?? '1.0',
      language: json['language'] ?? 'en',
      sections:
          (json['sections'] as List?)
              ?.map((e) => FeedSection.fromJson(e))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'version': version,
      'language': language,
      'sections': sections.map((e) => e.toJson()).toList(),
    };
  }
}

class FeedSection {
  final String type;
  final String code;
  final String title;
  final List<dynamic> items;

  FeedSection({
    required this.type,
    required this.code,
    required this.title,
    required this.items,
  });

  factory FeedSection.fromJson(Map<String, dynamic> json) {
    var list = <dynamic>[];
    final code = json['code'] as String? ?? '';

    final parser = FeedSectionParserRegistry.getParser(code);
    if (parser != null) {
      list =
          (json['items'] as List?)
              ?.map((e) => parser(e as Map<String, dynamic>))
              .toList() ??
          [];
    } else {
      // Fallback for unknown sections
      list = json['items'] as List? ?? [];
    }

    return FeedSection(
      type: json['type'] as String? ?? '',
      code: code,
      title: json['title'] as String? ?? '',
      items: list,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'type': type,
      'code': code,
      'title': title,
      'items': items.map((e) => e is Map ? e : e.toJson()).toList(),
    };
  }
}
