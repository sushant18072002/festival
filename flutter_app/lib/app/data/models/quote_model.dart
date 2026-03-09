import 'taxonomy_model.dart';

class QuoteModel {
  final String id;
  final String text;
  final String author;
  final String source;
  final bool isFeatured;
  final String language;
  final TaxonomyItem? category;
  final List<TaxonomyItem> vibes;
  final List<TaxonomyItem> tags;

  QuoteModel({
    required this.id,
    required this.text,
    this.author = '',
    this.source = '',
    this.isFeatured = false,
    this.language = 'en',
    this.category,
    this.vibes = const [],
    this.tags = const [],
  });

  factory QuoteModel.fromJson(Map<String, dynamic> json) {
    return QuoteModel(
      id: json['id'] ?? '',
      text: json['text'] ?? '',
      author: json['author'] ?? '',
      source: json['source'] ?? '',
      isFeatured: json['is_featured'] ?? false,
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
      'author': author,
      'source': source,
      'is_featured': isFeatured,
      'language': language,
      if (category != null) 'category': category!.toJson(),
      'vibes': vibes.map((e) => e.toJson()).toList(),
      'tags': tags.map((e) => e.toJson()).toList(),
    };
  }
}
