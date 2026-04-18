import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'app_colors.dart';
import 'app_text_styles.dart';
import 'app_spacing.dart';

class AppTheme {
  /// The primary "Neo-Modern" Dark Theme
  static ThemeData get darkTheme => _buildTheme(Brightness.dark);

  static ThemeData get lightTheme => _buildTheme(Brightness.light);

  static ThemeData _buildTheme(Brightness brightness) {
    final isDark = brightness == Brightness.dark;
    final primaryColor = AppColors.primary;
    final backgroundColor = AppColors.background(null, brightness: brightness);
    final surfaceColor = AppColors.surface(null, brightness: brightness);
    final textColor = AppColors.textAdaptive(null, brightness: brightness);

    return ThemeData(
      useMaterial3: true,
      brightness: brightness,
      primaryColor: primaryColor,
      scaffoldBackgroundColor: backgroundColor,
      fontFamily: 'Outfit',
      textTheme: TextTheme(
        displayLarge: AppTextStyles.displayLarge(null, brightness: brightness),
        displayMedium: AppTextStyles.displayMedium(null, brightness: brightness),
        displaySmall: AppTextStyles.displaySmall(null, brightness: brightness),
        headlineLarge: AppTextStyles.headlineLarge(null, brightness: brightness),
        headlineMedium: AppTextStyles.headlineMedium(null, brightness: brightness),
        headlineSmall: AppTextStyles.headlineSmall(null, brightness: brightness),
        titleLarge: AppTextStyles.titleLarge(null, brightness: brightness),
        titleMedium: AppTextStyles.titleMedium(null, brightness: brightness),
        titleSmall: AppTextStyles.titleSmall(null, brightness: brightness),
        bodyLarge: AppTextStyles.bodyLarge(null, brightness: brightness),
        bodyMedium: AppTextStyles.bodyMedium(null, brightness: brightness),
        bodySmall: AppTextStyles.bodySmall(null, brightness: brightness),
        labelLarge: AppTextStyles.labelLarge(null, brightness: brightness),
        labelMedium: AppTextStyles.labelMedium(null, brightness: brightness),
        labelSmall: AppTextStyles.labelSmall(null, brightness: brightness),
      ),

      appBarTheme: AppBarTheme(
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        scrolledUnderElevation: 0,
        iconTheme: IconThemeData(color: textColor),
        systemOverlayStyle: isDark ? SystemUiOverlayStyle.light : SystemUiOverlayStyle.dark,
      ),

      colorScheme: ColorScheme(
        brightness: brightness,
        primary: primaryColor,
        onPrimary: Colors.black,
        secondary: AppColors.secondary,
        onSecondary: Colors.white,
        error: AppColors.error,
        onError: Colors.white,
        surface: surfaceColor,
        onSurface: textColor,
      ),

      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: primaryColor,
          foregroundColor: Colors.black,
          elevation: 0,
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.lg,
            vertical: AppSpacing.md,
          ),
          shape: RoundedRectangleBorder(borderRadius: AppRadius.pillRadius),
        ),
      ),

      cardTheme: CardThemeData(
        color: surfaceColor,
        elevation: 0,
        margin: EdgeInsets.zero,
        shape: RoundedRectangleBorder(
          borderRadius: AppRadius.cardRadius,
          side: BorderSide(
            color: isDark ? Colors.white.withValues(alpha: 0.1) : Colors.black.withValues(alpha: 0.05),
            width: 1,
          ),
        ),
      ),

      iconTheme: IconThemeData(color: textColor, size: 24),

      dividerTheme: DividerThemeData(
        color: isDark ? Colors.white.withValues(alpha: 0.1) : Colors.black.withValues(alpha: 0.05),
        thickness: 1,
      ),
    );
  }
}

// Simple helper to get context-aware text theme without manual calls everywhere
extension ThemeContext on BuildContext {
  TextTheme get appTextTheme => Theme.of(this).textTheme;
}
