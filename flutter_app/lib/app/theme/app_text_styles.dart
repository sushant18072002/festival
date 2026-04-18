import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'app_colors.dart';

/// Neo-Modern Typography System
///
/// **Headlines**: DM Serif Display (High-contrast, editorial, luxury)
/// **UI/Body**: Outfit (Geometric, modern, tech-forward)
/// **Script**: Pinyon Script (Royal, refined)
class AppTextStyles {
  // ═══════════════════════════════════════════════════════════════════════════
  // DISPLAY — Hero & Magazine Titles
  // ═══════════════════════════════════════════════════════════════════════════

  static TextStyle displayLarge(BuildContext? context, {Brightness? brightness}) => GoogleFonts.dmSerifDisplay(
    fontSize: 48,
    fontWeight: FontWeight.w400,
    letterSpacing: -0.5,
    height: 1.0,
    color: AppColors.textAdaptive(context, brightness: brightness),
  );

  static TextStyle displayMedium(BuildContext? context, {Brightness? brightness}) => GoogleFonts.dmSerifDisplay(
    fontSize: 32,
    fontWeight: FontWeight.w400,
    letterSpacing: -0.25,
    height: 1.1,
    color: AppColors.textAdaptive(context, brightness: brightness),
  );

  static TextStyle displaySmall(BuildContext? context, {Brightness? brightness}) => GoogleFonts.dmSerifDisplay(
    fontSize: 24,
    fontWeight: FontWeight.w400,
    color: AppColors.textAdaptive(context, brightness: brightness),
  );

  static TextStyle headlineLarge(BuildContext? context, {Brightness? brightness}) => GoogleFonts.outfit(
    fontSize: 24,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.5,
    color: AppColors.textAdaptive(context, brightness: brightness),
  );

  static TextStyle headlineMedium(BuildContext? context, {Brightness? brightness}) => GoogleFonts.outfit(
    fontSize: 20,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.25,
    color: AppColors.textAdaptive(context, brightness: brightness),
  );

  static TextStyle headlineSmall(BuildContext? context, {Brightness? brightness}) => GoogleFonts.outfit(
    fontSize: 18,
    fontWeight: FontWeight.w500,
    color: AppColors.textAdaptive(context, brightness: brightness),
  );

  static TextStyle titleLarge(BuildContext? context, {Brightness? brightness}) => GoogleFonts.outfit(
    fontSize: 22,
    fontWeight: FontWeight.w500,
    color: AppColors.textAdaptive(context, brightness: brightness),
  );

  static TextStyle titleMedium(BuildContext? context, {Brightness? brightness}) => GoogleFonts.outfit(
    fontSize: 16,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.15,
    color: AppColors.textAdaptive(context, brightness: brightness),
  );

  static TextStyle titleSmall(BuildContext? context, {Brightness? brightness}) => GoogleFonts.outfit(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.1,
    color: AppColors.textAdaptive(context, brightness: brightness),
  );

  static TextStyle bodyLarge(BuildContext? context, {Brightness? brightness}) => GoogleFonts.outfit(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    height: 1.5,
    color: AppColors.textAdaptive(context, brightness: brightness),
  );

  static TextStyle bodyMedium(BuildContext? context, {Brightness? brightness}) => GoogleFonts.outfit(
    fontSize: 14,
    fontWeight: FontWeight.w400,
    height: 1.5,
    color: AppColors.textAdaptiveSecondary(context, brightness: brightness),
  );

  static TextStyle bodySmall(BuildContext? context, {Brightness? brightness}) => GoogleFonts.outfit(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    height: 1.4,
    color: AppColors.textAdaptiveSecondary(context, brightness: brightness),
  );

  static TextStyle labelLarge(BuildContext? context, {Brightness? brightness}) => GoogleFonts.outfit(
    fontSize: 14,
    fontWeight: FontWeight.w700,
    letterSpacing: 1.0,
    color: AppColors.textAdaptive(context, brightness: brightness),
  );

  static TextStyle labelMedium(BuildContext? context, {Brightness? brightness}) => GoogleFonts.outfit(
    fontSize: 12,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.5,
    color: AppColors.textAdaptiveSecondary(context, brightness: brightness),
  );

  static TextStyle labelSmall(BuildContext? context, {Brightness? brightness}) => GoogleFonts.outfit(
    fontSize: 10,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.5,
    color: AppColors.textAdaptiveSecondary(context, brightness: brightness).withValues(alpha: 0.7),
  );

  static TextStyle festive(BuildContext? context, {Brightness? brightness}) => GoogleFonts.pinyonScript(
    fontSize: 42,
    fontWeight: FontWeight.w400,
    color: AppColors.accentAdaptive(context, brightness: brightness),
  );

  static TextStyle festiveLarge(BuildContext? context, {Brightness? brightness}) => GoogleFonts.pinyonScript(
    fontSize: 64,
    fontWeight: FontWeight.w400,
    color: AppColors.accentAdaptive(context, brightness: brightness),
  );

  static TextStyle bigNumber(BuildContext? context, {Brightness? brightness}) => GoogleFonts.outfit(
    fontSize: 56,
    fontWeight: FontWeight.w700,
    letterSpacing: -2.0,
    color: AppColors.textAdaptive(context, brightness: brightness),
  );
}
