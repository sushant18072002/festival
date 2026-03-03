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

  static TextStyle get displayLarge => GoogleFonts.dmSerifDisplay(
    fontSize: 48, // Massive scale
    fontWeight: FontWeight.w400, // Regular weight is bold enough for serif
    letterSpacing: -0.5,
    height: 1.0, // Tight leading for poster look
    color: AppColors.textPrimary,
  );

  static TextStyle get displayMedium => GoogleFonts.dmSerifDisplay(
    fontSize: 32,
    fontWeight: FontWeight.w400,
    letterSpacing: -0.25,
    height: 1.1,
    color: AppColors.textPrimary,
  );

  static TextStyle get displaySmall => GoogleFonts.dmSerifDisplay(
    fontSize: 24,
    fontWeight: FontWeight.w400,
    color: AppColors.textPrimary,
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // HEADLINES — Section Headers
  // ═══════════════════════════════════════════════════════════════════════════

  static TextStyle get headlineLarge => GoogleFonts.outfit(
    fontSize: 24,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.5, // Tighter for geometric fonts
    color: AppColors.textPrimary,
  );

  static TextStyle get headlineMedium => GoogleFonts.outfit(
    fontSize: 20,
    fontWeight: FontWeight.w600,
    letterSpacing: -0.25,
    color: AppColors.textPrimary,
  );

  static TextStyle get headlineSmall => GoogleFonts.outfit(
    fontSize: 18,
    fontWeight: FontWeight.w500,
    color: AppColors.textPrimary,
  );

  static TextStyle get titleLarge => GoogleFonts.outfit(
    fontSize: 22,
    fontWeight: FontWeight.w500,
    color: AppColors.textPrimary,
  );

  static TextStyle get titleMedium => GoogleFonts.outfit(
    fontSize: 16,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.15,
    color: AppColors.textPrimary,
  );

  static TextStyle get titleSmall => GoogleFonts.outfit(
    fontSize: 14,
    fontWeight: FontWeight.w500,
    letterSpacing: 0.1,
    color: AppColors.textPrimary,
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // BODY — Clean, Readable, Modern
  // ═══════════════════════════════════════════════════════════════════════════

  static TextStyle get bodyLarge => GoogleFonts.outfit(
    fontSize: 16,
    fontWeight: FontWeight.w400,
    height: 1.5,
    color: AppColors.textPrimary,
  );

  static TextStyle get bodyMedium => GoogleFonts.outfit(
    fontSize: 14,
    fontWeight: FontWeight.w400, // Outfit is legible at 400
    height: 1.5,
    color: AppColors.textSecondary,
  );

  static TextStyle get bodySmall => GoogleFonts.outfit(
    fontSize: 12,
    fontWeight: FontWeight.w400,
    height: 1.4,
    color: AppColors.textSecondary,
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // LABELS — Caps & Functional Text
  // ═══════════════════════════════════════════════════════════════════════════

  static TextStyle get labelLarge => GoogleFonts.outfit(
    fontSize: 14,
    fontWeight: FontWeight.w700, // Bold for buttons
    letterSpacing: 1.0, // Wide spacing for caps
    color: AppColors.textPrimary,
  );

  static TextStyle get labelMedium => GoogleFonts.outfit(
    fontSize: 12,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.5,
    color: AppColors.textSecondary,
  );

  static TextStyle get labelSmall => GoogleFonts.outfit(
    fontSize: 10,
    fontWeight: FontWeight.w600,
    letterSpacing: 0.5,
    color: AppColors.textTertiary,
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // SPECIAL — Festive & Decorative
  // ═══════════════════════════════════════════════════════════════════════════

  static TextStyle get festive => GoogleFonts.pinyonScript(
    fontSize: 42,
    fontWeight: FontWeight.w400,
    color: AppColors.accent,
  );

  static TextStyle get festiveLarge => GoogleFonts.pinyonScript(
    fontSize: 64,
    fontWeight: FontWeight.w400,
    color: AppColors.accent,
  );

  // ═══════════════════════════════════════════════════════════════════════════
  // NUMBERS — Big Data Points
  // ═══════════════════════════════════════════════════════════════════════════

  static TextStyle get bigNumber => GoogleFonts.outfit(
    fontSize: 56,
    fontWeight: FontWeight.w700,
    letterSpacing: -2.0, // Tight tracking for stats
    color: AppColors.textPrimary,
  );
}
