import 'package:flutter/material.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

/// Maps Lucide icon name strings (stored in DB/taxonomy.json) to Flutter IconData.
/// This allows backend changes to icon names to propagate to Flutter without app updates —
/// just regenerate taxonomy.json and redeploy.
///
/// Icon names match the Lucide icon set (https://lucide.dev/icons).
class TaxonomyIconResolver {
  // ─── Icon Resolution ──────────────────────────────────────────────────────

  /// Resolve a Lucide icon name string → Flutter IconData.
  /// Falls back to [Icons.label_outline] for unrecognised names.
  static IconData resolve(String? lucideName, {IconData? fallback}) {
    if (lucideName == null || lucideName.isEmpty) {
      return fallback ?? Icons.label_outline;
    }
    return _iconMap[lucideName] ?? fallback ?? Icons.label_outline;
  }

  /// Resolve a CSS hex color string → Flutter Color.
  /// Accepts '#8b5cf6', '8b5cf6', 'purple' (mapped to AppColors).
  static Color resolveColor(String? raw, {Color fallback = Colors.white54}) {
    if (raw == null || raw.isEmpty) return fallback;
    final lowerRaw = raw.toLowerCase();
    if (_namedColors.containsKey(lowerRaw)) return _namedColors[lowerRaw]!;

    final hex = raw.replaceAll('#', '');
    if (hex.length == 6 && RegExp(r'^[0-9A-Fa-f]{6}$').hasMatch(hex)) {
      try {
        return Color(int.parse('0xFF$hex'));
      } catch (_) {}
    }
    return fallback;
  }

  // ─── Icon Map ─────────────────────────────────────────────────────────────
  // Add more mappings here as new icons are needed.

  static const Map<String, IconData> _iconMap = {
    // Used by Categories
    'Sparkles': LucideIcons.sparkles,
    'Flag': LucideIcons.flag,
    'Om': LucideIcons.circle, // Lucide doesn't have Om — use Circle as stand-in
    'MapPin': LucideIcons.mapPin,
    'Globe': LucideIcons.globe,

    // Used by Vibes
    'PartyPopper': LucideIcons.partyPopper,
    'Music': LucideIcons.music,
    'Moon': LucideIcons.moon,
    'Heart': LucideIcons.heart,
    'Sunrise': LucideIcons.sunrise,
    'Sun': LucideIcons.sun,
    'Star': LucideIcons.star,
    'Flame': LucideIcons.flame,

    // Used by Tags / misc
    'Camera': LucideIcons.camera,
    'Award': LucideIcons.award,
    'Gift': LucideIcons.gift,
    'BookOpen': LucideIcons.bookOpen,
    'Leaf': LucideIcons.leaf,
    'Feather': LucideIcons.feather,
    'Flower': LucideIcons.flower,
    'Coffee': LucideIcons.coffee,
    'Zap': LucideIcons.zap,
    'Bell': LucideIcons.bell,
    'Crown': LucideIcons.crown,
    'Diamond': LucideIcons.diamond,
    'Anchor': LucideIcons.anchor,
    'Palette': LucideIcons.palette,
    'Waves': LucideIcons.waves,
    'Wind': LucideIcons.wind,
    'Snowflake': LucideIcons.snowflake,
    'Cloud': LucideIcons.cloud,
    'Trees': LucideIcons.trees,
    'Mountain': LucideIcons.mountain,
  };

  // ─── Named Color Map ──────────────────────────────────────────────────────
  // Tailwind/CSS named colors used in seed_taxonomy.js

  static const Map<String, Color> _namedColors = {
    'purple': Color(0xFF8B5CF6),
    'orange': Color(0xFFF97316),
    'red': Color(0xFFEF4444),
    'blue': Color(0xFF3B82F6),
    'green': Color(0xFF10B981),
    'pink': Color(0xFFEC4899),
    'yellow': Color(0xFFF59E0B),
    'teal': Color(0xFF14B8A6),
    'indigo': Color(0xFF6366F1),
    'rose': Color(0xFFF43F5E),
    'slate': Color(0xFF64748B),
    'amber': Color(0xFFF59E0B),
    'cyan': Color(0xFF06B6D4),
  };
}
