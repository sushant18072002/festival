import 'taxonomy_model.dart';

class GreetingModel {
  final String id;
  final String text;
  final String language;
  final TaxonomyItem? category;
  final List<TaxonomyItem> vibes;

  GreetingModel({
    required this.id,
    required this.text,
    this.language = 'en',
    this.category,
    this.vibes = const [],
  });

  factory GreetingModel.fromJson(Map<String, dynamic> json) {
    return GreetingModel(
      id: json['id'] ?? '',
      text: json['text'] ?? '',
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
      'language': language,
      if (category != null) 'category': category!.toJson(),
      'vibes': vibes.map((e) => e.toJson()).toList(),
    };
  }
}
