import 'package:flutter/material.dart';
import 'taxonomy_icon_resolver.dart';

/// 🎨 TaxonomyIconWidget — Universal Icon Renderer
///
/// The backend stores an [iconSource] string in Category / Vibe / Tag documents.
/// That string can be one of three formats:
///
///   1. A Lucide icon name   → e.g. "Sparkles", "Heart"
///   2. A network URL        → e.g. "https://cdn.utsav.app/icons/diwali.png"
///   3. A local asset path   → e.g. "assets/icons/holi.svg"  (less common)
///
/// This widget inspects the string and renders the correct widget, falling back
/// to the [fallbackIcon] if nothing else works.
///
/// ──────────────────────────────────────────────────────────────────────────
/// USAGE
/// ──────────────────────────────────────────────────────────────────────────
///   TaxonomyIconWidget(
///     iconSource: category.icon,   // nullable String from backend
///     color: Colors.white,
///     size: 18,
///   )
/// ──────────────────────────────────────────────────────────────────────────
class TaxonomyIconWidget extends StatelessWidget {
  final String? iconSource;
  final Color? color;
  final double size;
  final IconData fallbackIcon;
  final BoxFit fit;

  const TaxonomyIconWidget({
    super.key,
    required this.iconSource,
    this.color,
    this.size = 20,
    this.fallbackIcon = Icons.label_outline,
    this.fit = BoxFit.contain,
  });

  @override
  Widget build(BuildContext context) {
    final src = iconSource?.trim();

    // ── 1. Null / Empty ────────────────────────────────────────────────────
    if (src == null || src.isEmpty) {
      return _fallback();
    }

    // ── 2. Network URL (http / https) ──────────────────────────────────────
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return SizedBox(
        width: size,
        height: size,
        child: Image.network(
          src,
          width: size,
          height: size,
          color: color,
          fit: fit,
          errorBuilder: (_, __, ___) => _fallback(),
        ),
      );
    }

    // ── 3. Local Asset Path ────────────────────────────────────────────────
    if (src.startsWith('assets/')) {
      return SizedBox(
        width: size,
        height: size,
        child: Image.asset(
          src,
          width: size,
          height: size,
          color: color,
          fit: fit,
          errorBuilder: (_, __, ___) => _fallback(),
        ),
      );
    }

    // ── 4. Lucide Icon Name String → looked up in TaxonomyIconResolver ─────
    final iconData = TaxonomyIconResolver.resolve(src, fallback: fallbackIcon);
    return Icon(iconData, size: size, color: color);
  }

  Widget _fallback() =>
      Icon(fallbackIcon, size: size, color: color ?? Colors.white54);
}
