import 'package:flutter/material.dart';

/// Neo-Modern Color System: "Deep Night + Bioluminescence"
///
/// **Concept**: Festivals happen at night. We use a deep void background
/// and light it up with bioluminescent neon accents.
class AppColors {
  // ═══════════════════════════════════════════════════════════════════════════
  // BACKGROUNDS (The Void)
  // ═══════════════════════════════════════════════════════════════════════════

  static const Color backgroundDark = Color(0xFF0F0518); // Deep Void Purple
  static const Color surfaceDark = Color(0xFF1A0B2E); // Slightly lighter void
  static const Color surfaceGlass = Color(0xFF251042); // Glass surface base

  // Use these for light mode fallback if needed, but primary is DARK
  static const Color backgroundLight = Color(0xFFF8F5FF);
  static const Color surfaceLight = Color(0xFFFFFFFF);

  // ═══════════════════════════════════════════════════════════════════════════
  // NEON ACCENTS (Bioluminescence)
  // ═══════════════════════════════════════════════════════════════════════════

  static const Color primary = Color(0xFF00F0FF); // Electric Cyan
  static const Color primaryLight = Color(0xFF80F7FF); // Lighter Cyan
  static const Color secondary = Color(0xFFE0218A); // Neon Magenta
  static const Color secondaryLight = Color(0xFFFF80C0); // Lighter Magenta
  static const Color accent = Color(0xFFFFD700); // Warm Gold (Diwali Light)
  static const Color success = Color(0xFF00FF94); // Neon Green
  static const Color error = Color(0xFFFF2A6D); // Electric Red
  static const Color info = Color(0xFF2D8CFF); // Electric Blue

  // ═══════════════════════════════════════════════════════════════════════════
  // TEXT COLORS
  // ═══════════════════════════════════════════════════════════════════════════

  static const Color textPrimary = Color(0xFFFFFFFF); // Pure White
  static const Color textSecondary = Color(0xB3FFFFFF); // 70% White
  static const Color textTertiary = Color(0x66FFFFFF); // 40% White
  static const Color textMuted = Color(0x4DFFFFFF); // 30% White

  static const Color textLight = Color(0xFFFFFFFF);
  static const Color textDark = Color(0xFF0F0518);

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

  static List<BoxShadow> get glassShadow => [
    BoxShadow(
      color: Colors.black.withValues(alpha: 0.3),
      blurRadius: 30,
      offset: const Offset(0, 10),
    ),
  ];

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
