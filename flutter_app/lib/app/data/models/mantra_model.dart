import 'taxonomy_model.dart';

class MantraModel {
  final String id;
  final String text; // The mantra text (Sanskrit or vernacular)
  final String transliteration;
  final String meaning;
  final String language;
  final TaxonomyItem? category;

  MantraModel({
    required this.id,
    required this.text,
    this.transliteration = '',
    this.meaning = '',
    this.language = 'en',
    this.category,
  });

  factory MantraModel.fromJson(Map<String, dynamic> json) {
    return MantraModel(
      id: json['id'] ?? '',
      text: json['text'] ?? '',
      transliteration: json['transliteration'] ?? '',
      meaning: json['meaning'] ?? '',
      language: json['language'] ?? 'en',
      category: json['category'] != null
          ? (json['category'] is String
                ? TaxonomyItem(code: json['category'], name: json['category'])
                : TaxonomyItem.fromJson(json['category']))
          : null,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'text': text,
      'transliteration': transliteration,
      'meaning': meaning,
      'language': language,
      if (category != null) 'category': category!.toJson(),
    };
  }
}
