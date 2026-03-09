import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'app_colors.dart';
import 'app_text_styles.dart';
import 'app_spacing.dart';

class AppTheme {
  /// The primary "Neo-Modern" Dark Theme
  /// Uses Void Purple backgrounds + Neon Accents + Glassmorphism
  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.dark,
      primaryColor: AppColors.primary,
      scaffoldBackgroundColor: AppColors.backgroundDark,

      // ════════════════════════════════════════════════════════════════════════
      // TYPOGRAPHY
      // ════════════════════════════════════════════════════════════════════════
      fontFamily: 'Outfit', // Default font
      textTheme: TextTheme(
        displayLarge: AppTextStyles.displayLarge,
        displayMedium: AppTextStyles.displayMedium,
        displaySmall: AppTextStyles.displaySmall,
        headlineLarge: AppTextStyles.headlineLarge,
        headlineMedium: AppTextStyles.headlineMedium,
        headlineSmall: AppTextStyles.headlineSmall,
        titleLarge: AppTextStyles.titleLarge,
        titleMedium: AppTextStyles.titleMedium,
        titleSmall: AppTextStyles.titleSmall,
        bodyLarge: AppTextStyles.bodyLarge,
        bodyMedium: AppTextStyles.bodyMedium,
        bodySmall: AppTextStyles.bodySmall,
        labelLarge: AppTextStyles.labelLarge,
        labelMedium: AppTextStyles.labelMedium,
        labelSmall: AppTextStyles.labelSmall,
      ),

      // ════════════════════════════════════════════════════════════════════════
      // COMPONENT THEMES
      // ════════════════════════════════════════════════════════════════════════
      appBarTheme: AppBarTheme(
        backgroundColor:
            Colors.transparent, // Glass effect usually handled manually
        elevation: 0,
        centerTitle: true,
        scrolledUnderElevation: 0,
        titleTextStyle: AppTextStyles.headlineMedium.copyWith(
          color: AppColors.textPrimary,
        ),
        iconTheme: const IconThemeData(color: AppColors.textPrimary),
        systemOverlayStyle: SystemUiOverlayStyle.light,
      ),

      colorScheme: const ColorScheme.dark(
        primary: AppColors.primary,
        secondary: AppColors.secondary,
        surface: AppColors.surfaceDark,
        error: AppColors.error,
        onPrimary: Colors.black, // Neon text should be black for contrast
        onSecondary: Colors.white,
        onSurface: AppColors.textPrimary,
      ),

      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.black, // Contrast on neon
          elevation: 0,
          textStyle: AppTextStyles.labelLarge,
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.md,
          ),
          shape: RoundedRectangleBorder(borderRadius: AppRadius.pillRadius),
        ),
      ),

      cardTheme: CardThemeData(
        color: AppColors.surfaceGlass,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: AppRadius.cardRadius,
          side: const BorderSide(
            color: AppColors.border,
            width: 1,
          ), // Glass border
        ),
      ),

      iconTheme: const IconThemeData(color: AppColors.textPrimary, size: 24),

      dividerTheme: const DividerThemeData(
        color: AppColors.border,
        thickness: 1,
      ),
    );
  }

  /// Warm "Daylight Festival" Light Theme
  /// Bright backgrounds, high contrast dark text, same vibrant accent colors
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      brightness: Brightness.light,
      primaryColor: AppColors.primary,
      scaffoldBackgroundColor: AppColors.backgroundLight,

      fontFamily: 'Outfit',
      textTheme: TextTheme(
        displayLarge: AppTextStyles.displayLarge.copyWith(
          color: const Color(0xFF1A0B2E),
        ),
        displayMedium: AppTextStyles.displayMedium.copyWith(
          color: const Color(0xFF1A0B2E),
        ),
        displaySmall: AppTextStyles.displaySmall.copyWith(
          color: const Color(0xFF1A0B2E),
        ),
        headlineLarge: AppTextStyles.headlineLarge.copyWith(
          color: const Color(0xFF1A0B2E),
        ),
        headlineMedium: AppTextStyles.headlineMedium.copyWith(
          color: const Color(0xFF1A0B2E),
        ),
        headlineSmall: AppTextStyles.headlineSmall.copyWith(
          color: const Color(0xFF1A0B2E),
        ),
        titleLarge: AppTextStyles.titleLarge.copyWith(
          color: const Color(0xFF1A0B2E),
        ),
        titleMedium: AppTextStyles.titleMedium.copyWith(
          color: const Color(0xFF1A0B2E),
        ),
        titleSmall: AppTextStyles.titleSmall.copyWith(
          color: const Color(0xFF251042),
        ),
        bodyLarge: AppTextStyles.bodyLarge.copyWith(
          color: const Color(0xFF251042),
        ),
        bodyMedium: AppTextStyles.bodyMedium.copyWith(
          color: const Color(0xFF251042),
        ),
        bodySmall: AppTextStyles.bodySmall.copyWith(
          color: const Color(0xFF3D1F5C),
        ),
        labelLarge: AppTextStyles.labelLarge.copyWith(
          color: const Color(0xFF1A0B2E),
        ),
        labelMedium: AppTextStyles.labelMedium.copyWith(
          color: const Color(0xFF251042),
        ),
        labelSmall: AppTextStyles.labelSmall.copyWith(
          color: const Color(0xFF3D1F5C),
        ),
      ),

      appBarTheme: AppBarTheme(
        backgroundColor: AppColors.backgroundLight,
        elevation: 0,
        centerTitle: true,
        scrolledUnderElevation: 0,
        titleTextStyle: AppTextStyles.headlineMedium.copyWith(
          color: const Color(0xFF1A0B2E),
        ),
        iconTheme: const IconThemeData(color: Color(0xFF1A0B2E)),
        systemOverlayStyle: SystemUiOverlayStyle.dark,
      ),

      colorScheme: const ColorScheme.light(
        primary: AppColors.primary,
        secondary: AppColors.secondary,
        surface: AppColors.surfaceLight,
        error: AppColors.error,
        onPrimary: Colors.black,
        onSecondary: Colors.white,
        onSurface: Color(0xFF1A0B2E),
      ),

      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.black,
          elevation: 0,
          textStyle: AppTextStyles.labelLarge,
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.md,
          ),
          shape: RoundedRectangleBorder(borderRadius: AppRadius.pillRadius),
        ),
      ),

      cardTheme: CardThemeData(
        color: Colors.white,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: AppRadius.cardRadius,
          side: const BorderSide(color: Color(0x1A1A0B2E), width: 1),
        ),
      ),

      iconTheme: const IconThemeData(color: Color(0xFF1A0B2E), size: 24),

      dividerTheme: const DividerThemeData(
        color: Color(0x1A1A0B2E),
        thickness: 1,
      ),
    );
  }
}
