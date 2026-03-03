import 'package:flutter/material.dart';
import '../data/models/taxonomy_model.dart';
import 'taxonomy_icon_resolver.dart';

class AppVibes {
  /// The static fallback list (used if DB hasn't loaded or fails)
  static const List<VibeItem> all = [
    VibeItem(code: 'all', label: 'All', emoji: '🌟'),
    VibeItem(
      code: 'patriotic',
      label: 'Desh',
      emoji: '🇮🇳',
      color: Color(0xFF10B981),
    ),
    VibeItem(
      code: 'spiritual',
      label: 'Bhakti',
      emoji: '🙏',
      color: Color(0xFF8B5CF6),
    ),
    VibeItem(
      code: 'joyful',
      label: 'Masti',
      emoji: '😂',
      color: Color(0xFFF59E0B),
    ),
    VibeItem(
      code: 'romantic',
      label: 'Love',
      emoji: '❤️',
      color: Color(0xFFEC4899),
    ),
    VibeItem(
      code: 'morning',
      label: 'Morning',
      emoji: '☀️',
      color: Color(0xFF0EA5E9),
    ),
  ];

  static const Map<String, String> _emojiFallback = {
    'all': '🌟',
    'spiritual': '🙏',
    'joyful': '😂',
    'patriotic': '🇮🇳',
    'cultural': '🎭',
    'solemn': '🕯️',
    'romantic': '❤️',
    'morning': '☀️',
  };

  /// Build dynamic vibelist from backend taxonomy
  static List<VibeItem> fromTaxonomy(List<TaxonomyItem> taxonomyVibes) {
    if (taxonomyVibes.isEmpty) return all;

    final list = <VibeItem>[
      const VibeItem(code: 'all', label: 'All', emoji: '🌟'),
    ];

    for (var t in taxonomyVibes) {
      list.add(
        VibeItem(
          code: t.code,
          label: t.name,
          emoji: _emojiFallback[t.code] ?? '✨',
          iconData: TaxonomyIconResolver.resolve(t.icon),
          color: TaxonomyIconResolver.resolveColor(t.color),
        ),
      );
    }
    return list;
  }
}

class VibeItem {
  final String code;
  final String label;
  final String emoji;
  final IconData? iconData;
  final Color? color;

  const VibeItem({
    required this.code,
    required this.label,
    required this.emoji,
    this.iconData,
    this.color,
  });
}
