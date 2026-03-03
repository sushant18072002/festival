class TaxonomyItem {
  final String code;
  final String name;
  final String? icon;
  final String? color;

  TaxonomyItem({required this.code, required this.name, this.icon, this.color});

  factory TaxonomyItem.fromJson(Map<String, dynamic> json) {
    return TaxonomyItem(
      code: json['code'] ?? '',
      name: json['name'] ?? '',
      icon: json['icon'],
      color: json['color'],
    );
  }

  Map<String, dynamic> toJson() {
    return {'code': code, 'name': name, 'icon': icon, 'color': color};
  }
}

class Taxonomy {
  final List<TaxonomyItem> categories;
  final List<TaxonomyItem> tags;
  final List<TaxonomyItem> vibes;

  Taxonomy({required this.categories, required this.tags, required this.vibes});

  factory Taxonomy.fromJson(Map<String, dynamic> json) {
    return Taxonomy(
      categories:
          (json['categories'] as List?)
              ?.map((e) => TaxonomyItem.fromJson(e))
              .toList() ??
          [],
      tags:
          (json['tags'] as List?)
              ?.map((e) => TaxonomyItem.fromJson(e))
              .toList() ??
          [],
      vibes:
          (json['vibes'] as List?)
              ?.map((e) => TaxonomyItem.fromJson(e))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'categories': categories.map((e) => e.toJson()).toList(),
      'tags': tags.map((e) => e.toJson()).toList(),
      'vibes': vibes.map((e) => e.toJson()).toList(),
    };
  }
}
