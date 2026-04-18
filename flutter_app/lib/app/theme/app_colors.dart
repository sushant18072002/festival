import 'package:flutter/material.dart';

/// Neo-Modern Color System: "Deep Night + Bioluminescence"
///
/// **Concept**: Festivals happen at night. We use a deep void background
/// and light it up with bioluminescent neon accents.
class AppColors {
  // ═══════════════════════════════════════════════════════════════════════════
  // BACKGROUNDS (The Void vs The Canvas)
  // ═══════════════════════════════════════════════════════════════════════════

  static const Color backgroundDark = Color(0xFF0F2223); // Deep Teal/Night
  static const Color surfaceDark = Color(0xFF162F32); // Slightly lighter teal

  static const Color backgroundLight = Color(0xFFF5F8F8); // Clean light
  static const Color surfaceLight = Color(0xFFFFFFFF);

  static Color background(BuildContext? context, {Brightness? brightness}) {
    final effectiveBrightness = brightness ?? (context != null ? Theme.of(context).brightness : Brightness.dark);
    return effectiveBrightness == Brightness.dark ? backgroundDark : backgroundLight;
  }

  static Color surface(BuildContext? context, {Brightness? brightness}) {
    final effectiveBrightness = brightness ?? (context != null ? Theme.of(context).brightness : Brightness.dark);
    return effectiveBrightness == Brightness.dark ? surfaceDark : surfaceLight;
  }

  static Color surfaceGlass(BuildContext? context, {Brightness? brightness}) {
    final effectiveBrightness = brightness ?? (context != null ? Theme.of(context).brightness : Brightness.dark);
    return effectiveBrightness == Brightness.dark
        ? const Color(0xFF0A1416).withValues(alpha: 0.6)
        : const Color(0xFFF5F8F8).withValues(alpha: 0.8);
  }

  static Color glassBorder(BuildContext? context, {Brightness? brightness}) {
    final effectiveBrightness = brightness ?? (context != null ? Theme.of(context).brightness : Brightness.dark);
    return effectiveBrightness == Brightness.dark
        ? Colors.white.withValues(alpha: 0.08)
        : Colors.black.withValues(alpha: 0.05);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // NEON ACCENTS (Bioluminescence)
  // ═══════════════════════════════════════════════════════════════════════════

  static const Color primary = Color(0xFF00EEFF); // Electric Cyan
  static const Color primaryLight = Color(0xFF80F7FF); // Lighter Cyan
  static const Color secondary = Color(0xFFE0218A); // Neon Magenta (Original)
  static const Color magentaGlow = Color(0xFFFF00FF); // Pure Neon Magenta CTA
  static const Color secondaryLight = Color(0xFFFF80C0); // Lighter Magenta
  static const Color accent = Color(0xFFFFD700); // Warm Gold (Diwali Light)
  static const Color goldAccent = Color(0xFFFFD700); // Alias for clarity
  static const Color success = Color(0xFF00FF94); // Neon Green
  static const Color error = Color(0xFFFF2A6D); // Electric Red
  static const Color info = Color(0xFF2D8CFF); // Electric Blue

  // Adaptive Deep Variants for Light Mode contrast
  static Color primaryAdaptive(BuildContext? context, {Brightness? brightness}) {
    final effectiveBrightness = brightness ?? (context != null ? Theme.of(context).brightness : Brightness.dark);
    return effectiveBrightness == Brightness.dark ? primary : const Color(0xFF00838F);
  }
          
  static Color secondaryAdaptive(BuildContext? context, {Brightness? brightness}) {
    final effectiveBrightness = brightness ?? (context != null ? Theme.of(context).brightness : Brightness.dark);
    return effectiveBrightness == Brightness.dark ? secondary : const Color(0xFFAD1457);
  }

  static Color accentAdaptive(BuildContext? context, {Brightness? brightness}) {
    final effectiveBrightness = brightness ?? (context != null ? Theme.of(context).brightness : Brightness.dark);
    return effectiveBrightness == Brightness.dark ? accent : const Color(0xFFB45309);
  }

  static Color errorAdaptive(BuildContext? context, {Brightness? brightness}) {
    final effectiveBrightness = brightness ?? (context != null ? Theme.of(context).brightness : Brightness.dark);
    return effectiveBrightness == Brightness.dark ? error : const Color(0xFFC62828);
  }
          
  static Color successAdaptive(BuildContext? context, {Brightness? brightness}) {
    final effectiveBrightness = brightness ?? (context != null ? Theme.of(context).brightness : Brightness.dark);
    return effectiveBrightness == Brightness.dark ? success : const Color(0xFF1B5E20);
  }

  static Color accessibilityAccent(BuildContext? context, {Brightness? brightness}) {
    final effectiveBrightness = brightness ?? (context != null ? Theme.of(context).brightness : Brightness.dark);
    return effectiveBrightness == Brightness.dark ? Colors.tealAccent : const Color(0xFF00796B);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // TEXT COLORS
  // ═══════════════════════════════════════════════════════════════════════════

  static const Color textPrimary = Color(0xFFFFFFFF); // Pure White
  static const Color textSecondary = Color(0xB3FFFFFF); // 70% White
  static const Color textTertiary = Color(0x66FFFFFF); // 40% White
  static const Color textMuted = Color(0x4DFFFFFF); // 30% White

  static const Color textLight = Color(0xFFFFFFFF);
  static const Color textDark = Color(0xFF0F2223);

  static Color textAdaptive(BuildContext? context, {Brightness? brightness}) {
    final effectiveBrightness = brightness ?? (context != null ? Theme.of(context).brightness : Brightness.dark);
    return effectiveBrightness == Brightness.dark ? textLight : textDark;
  }

  static Color textAdaptiveSecondary(BuildContext? context, {Brightness? brightness}) {
    final effectiveBrightness = brightness ?? (context != null ? Theme.of(context).brightness : Brightness.dark);
    return effectiveBrightness == Brightness.dark ? const Color(0xFFCBD5E1) : const Color(0xFF64748B);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // GRADIENTS (Kinetic Energy)
  // ═══════════════════════════════════════════════════════════════════════════

  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primary, Color(0xFF00A3FF)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient festiveGradient = LinearGradient(
    colors: [secondary, Color(0xFF8F00FF)], // Magenta -> Violet
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient goldGradient = LinearGradient(
    colors: [Color(0xFFFFD700), Color(0xFFFFA500)], // Gold -> Orange
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient glassGradient = LinearGradient(
    colors: [
      Color(0x1AFFFFFF), // 10% White
      Color(0x05FFFFFF), // 2% White
    ],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // SHADOWS & GLOWS
  // ═══════════════════════════════════════════════════════════════════════════

  static List<BoxShadow> get neonGlow => [
    BoxShadow(
      color: primary.withValues(alpha: 0.6),
      blurRadius: 20,
      spreadRadius: -5,
      offset: const Offset(0, 0),
    ),
  ];

  static List<BoxShadow> intenseMagentaGlow(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return [
      BoxShadow(
        color: magentaGlow.withValues(alpha: isDark ? 0.6 : 0.3),
        blurRadius: 30,
      ),
      BoxShadow(
        color: magentaGlow.withValues(alpha: isDark ? 0.3 : 0.1),
        blurRadius: 60,
      ),
    ];
  }

  static List<BoxShadow> glassShadow(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return isDark
        ? [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.5),
              blurRadius: 40,
              offset: const Offset(0, 20),
            ),
          ]
        : [
            // Professional Multi-Layer Shadow for Light Mode
            BoxShadow(
              color: const Color(0xFF0F172A).withValues(alpha: 0.08),
              blurRadius: 1,
              offset: const Offset(0, 1),
            ),
            BoxShadow(
              color: const Color(0xFF0F172A).withValues(alpha: 0.05),
              blurRadius: 20,
              offset: const Offset(0, 10),
            ),
          ];
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ADAPTIVE BORDERS & GLOWS
  // ═══════════════════════════════════════════════════════════════════════════

  static Border adaptiveBorder(BuildContext context, {double opacityFactor = 1.0}) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Border.all(
      color: isDark
          ? Colors.white.withValues(alpha: 0.1 * opacityFactor)
          : const Color(0xFF0F172A).withValues(alpha: 0.08 * opacityFactor),
      width: 1.0,
    );
  }

  /// Inner Glow effect for professional glass depth (Dark Mode only)
  static Decoration? innerGlow(BuildContext context) {
    if (Theme.of(context).brightness != Brightness.dark) return null;
    return BoxDecoration(
      gradient: LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          Colors.white.withValues(alpha: 0.1),
          Colors.transparent,
          Colors.black.withValues(alpha: 0.1),
        ],
      ),
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPONENT STYLES
  // ═══════════════════════════════════════════════════════════════════════════

  static WidgetStateProperty<Color> switchThumbColor(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return WidgetStateProperty.resolveWith<Color>((states) {
      if (states.contains(WidgetState.selected)) {
        return isDark ? Colors.white : Colors.white; // Always white for active thumb
      }
      return isDark ? Colors.white54 : Colors.black54;
    });
  }

  static Color switchInactiveTrackColor(BuildContext context) {
    return Theme.of(context).brightness == Brightness.dark
        ? Colors.white.withValues(alpha: 0.1)
        : Colors.black.withValues(alpha: 0.12);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  static const Color border = Color(0x1AFFFFFF); // 10% White border for glass

  static LinearGradient getVibeGradient(String vibeCode) {
    switch (vibeCode.toLowerCase()) {
      case 'patriotic':
        return const LinearGradient(
          colors: [Color(0xFFFF9933), Color(0xFF138808)],
        );
      case 'spiritual':
        return const LinearGradient(
          colors: [Color(0xFFFF4E50), Color(0xFFF9D423)],
        ); // Saffron
      case 'romantic':
        return const LinearGradient(
          colors: [Color(0xFFFF758C), Color(0xFFFF7EB3)],
        );
      case 'fun':
        return const LinearGradient(
          colors: [Color(0xFF00F260), Color(0xFF0575E6)],
        );
      default:
        return primaryGradient;
    }
  }
}
