import 'taxonomy_model.dart';

class MantraModel {
  final String id;
  final String text;
  final String transliteration;
  final String meaning;
  final String audioFile;
  final String language;
  final TaxonomyItem? category;
  final List<TaxonomyItem> vibes;
  final List<TaxonomyItem> tags;

  MantraModel({
    required this.id,
    required this.text,
    this.transliteration = '',
    this.meaning = '',
    this.audioFile = '',
    this.language = 'en',
    this.category,
    this.vibes = const [],
    this.tags = const [],
  });

  factory MantraModel.fromJson(Map<String, dynamic> json) {
    return MantraModel(
      id: json['id'] ?? '',
      text: json['text'] ?? '',
      transliteration: json['transliteration'] ?? '',
      meaning: json['meaning'] ?? '',
      audioFile: json['audio_file'] ?? '',
      language: json['language'] ?? 'en',
      category: json['category'] != null
          ? (json['category'] is String
                ? TaxonomyItem(code: json['category'], name: json['category'])
                : TaxonomyItem.fromJson(json['category']))
          : null,
      vibes:
          (json['vibes'] as List?)
              ?.map(
                (e) => e is String
                    ? TaxonomyItem(code: e, name: e)
                    : TaxonomyItem.fromJson(e),
              )
              .toList() ??
          [],
      tags:
          (json['tags'] as List?)
              ?.map(
                (e) => e is String
                    ? TaxonomyItem(code: e, name: e)
                    : TaxonomyItem.fromJson(e),
              )
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'text': text,
      'transliteration': transliteration,
      'meaning': meaning,
      'audio_file': audioFile,
      'language': language,
      if (category != null) 'category': category!.toJson(),
      'vibes': vibes.map((e) => e.toJson()).toList(),
      'tags': tags.map((e) => e.toJson()).toList(),
    };
  }
}
