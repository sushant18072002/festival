import 'package:flutter/material.dart';

/// Spacing & Layout System (8pt Grid)
/// Provides consistent spacing throughout the app
class AppSpacing {
  // ═══════════════════════════════════════════════════════════════════════════
  // SPACING SCALE (8pt Base)
  // ═══════════════════════════════════════════════════════════════════════════

  /// 4px — Icon padding, tight gaps
  static const double xxs = 4;

  /// 8px — Chip margins, tight spacing
  static const double xs = 8;

  /// 12px — Card gaps, list item spacing
  static const double sm = 12;

  /// 16px — Standard padding, section content
  static const double md = 16;

  /// 24px — Section gaps, card padding
  static const double lg = 24;

  /// 32px — Major separation
  static const double xl = 32;

  /// 48px — Hero spacing, page margins
  static const double xxl = 48;

  /// 64px — Extra large spacing
  static const double xxxl = 64;

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMON EDGE INSETS
  // ═══════════════════════════════════════════════════════════════════════════

  /// Horizontal page padding (16px)
  static const EdgeInsets pagePadding = EdgeInsets.symmetric(horizontal: md);

  /// Card internal padding (16px all)
  static const EdgeInsets cardPadding = EdgeInsets.all(md);

  /// Chip padding (12h x 8v)
  static const EdgeInsets chipPadding = EdgeInsets.symmetric(
    horizontal: sm,
    vertical: xs,
  );

  /// Section padding (24h x 16v)
  static const EdgeInsets sectionPadding = EdgeInsets.symmetric(
    horizontal: lg,
    vertical: md,
  );

  /// List item padding
  static const EdgeInsets listItemPadding = EdgeInsets.symmetric(
    horizontal: md,
    vertical: sm,
  );

  /// Bottom sheet padding
  static const EdgeInsets sheetPadding = EdgeInsets.fromLTRB(lg, lg, lg, xl);

  // ═══════════════════════════════════════════════════════════════════════════
  // GAP BOXES (for Row/Column spacing)
  // ═══════════════════════════════════════════════════════════════════════════

  static const SizedBox gapXxs = SizedBox(width: xxs, height: xxs);
  static const SizedBox gapXs = SizedBox(width: xs, height: xs);
  static const SizedBox gapSm = SizedBox(width: sm, height: sm);
  static const SizedBox gapMd = SizedBox(width: md, height: md);
  static const SizedBox gapLg = SizedBox(width: lg, height: lg);
  static const SizedBox gapXl = SizedBox(width: xl, height: xl);
  static const SizedBox gapXxl = SizedBox(width: xxl, height: xxl);

  // Vertical-only gaps
  static const SizedBox verticalXs = SizedBox(height: xs);
  static const SizedBox verticalSm = SizedBox(height: sm);
  static const SizedBox verticalMd = SizedBox(height: md);
  static const SizedBox verticalLg = SizedBox(height: lg);
  static const SizedBox verticalXl = SizedBox(height: xl);

  // Horizontal-only gaps
  static const SizedBox horizontalXs = SizedBox(width: xs);
  static const SizedBox horizontalSm = SizedBox(width: sm);
  static const SizedBox horizontalMd = SizedBox(width: md);
  static const SizedBox horizontalLg = SizedBox(width: lg);

  // ═══════════════════════════════════════════════════════════════════════════
  // DIVIDERS
  // ═══════════════════════════════════════════════════════════════════════════

  static const Divider thinDivider = Divider(height: 1, thickness: 1);
  static const Divider thickDivider = Divider(height: md, thickness: 1);
  static const Divider sectionDivider = Divider(height: xl);
}

/// Border Radius Constants
class AppRadius {
  /// No radius
  static const double none = 0;

  /// 4px — Chips, tags
  static const double xs = 4;

  /// 8px — Buttons, small cards
  static const double sm = 8;

  /// 12px — Standard cards
  static const double md = 12;

  /// 16px — Large cards
  static const double lg = 16;

  /// 24px — Modals, bottom sheets
  static const double xl = 24;

  /// 32px — Extra large
  static const double xxl = 32;

  /// 100px — Circular/pill shapes
  static const double full = 100;

  // ═══════════════════════════════════════════════════════════════════════════
  // COMMON BORDER RADIUS OBJECTS
  // ═══════════════════════════════════════════════════════════════════════════

  static BorderRadius get chipRadius => BorderRadius.circular(xs);
  static BorderRadius get buttonRadius => BorderRadius.circular(sm);
  static BorderRadius get cardRadius => BorderRadius.circular(md);
  static BorderRadius get largeCardRadius => BorderRadius.circular(lg);
  static BorderRadius get sheetRadius => BorderRadius.circular(xl);
  static BorderRadius get pillRadius => BorderRadius.circular(full);

  /// Top-only radius for bottom sheets
  static BorderRadius get sheetTopRadius =>
      const BorderRadius.vertical(top: Radius.circular(xl));
}

/// Icon Sizes
class AppIconSize {
  static const double xs = 16;
  static const double sm = 20;
  static const double md = 24;
  static const double lg = 32;
  static const double xl = 48;
  static const double xxl = 64;
}

/// Touch Target Sizes (Accessibility)
class AppTouchTarget {
  /// Minimum touch target (48x48) per Material Guidelines
  static const double minimum = 48;

  /// Large touch target for primary actions
  static const double large = 56;

  /// FAB size
  static const double fab = 56;

  /// Extended FAB height
  static const double fabExtended = 48;
}
