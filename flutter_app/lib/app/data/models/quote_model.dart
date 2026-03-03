import 'taxonomy_model.dart';

class QuoteModel {
  final String id;
  final String text;
  final String author;
  final String language;
  final TaxonomyItem? category;
  final List<TaxonomyItem> vibes;

  QuoteModel({
    required this.id,
    required this.text,
    this.author = '',
    this.language = 'en',
    this.category,
    this.vibes = const [],
  });

  factory QuoteModel.fromJson(Map<String, dynamic> json) {
    return QuoteModel(
      id: json['id'] ?? '',
      text: json['text'] ?? '',
      author: json['author'] ?? '',
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
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'text': text,
      'author': author,
      'language': language,
      if (category != null) 'category': category!.toJson(),
      'vibes': vibes.map((e) => e.toJson()).toList(),
    };
  }
}
