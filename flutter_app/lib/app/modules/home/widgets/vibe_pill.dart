import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../theme/app_spacing.dart';
import '../../../theme/app_animations.dart';

/// Neo-Modern Vibe Pill
/// Unselected: Frosted glass (dark) / soft pastel pill (light)
/// Selected: Neon Gradient with inner glow
class VibePill extends StatelessWidget {
  final String label;
  final String? emoji;
  final IconData? iconData;
  final String? vibeCode;
  final bool isSelected;
  final bool isDark;
  final VoidCallback onTap;

  const VibePill({
    super.key,
    required this.label,
    this.emoji,
    this.iconData,
    this.vibeCode,
    required this.isSelected,
    required this.onTap,
    this.isDark = true,
  });

  @override
  Widget build(BuildContext context) {
    // Determine gradient based on vibe code if selected
    final gradient = isSelected && vibeCode != null
        ? AppColors.getVibeGradient(vibeCode!)
        : null;

    // Unselected pill style — adapts to light/dark via AppColors
    final unselectedBg = AppColors.surfaceGlass(context);
    final unselectedBorder = isDark 
        ? AppColors.primary.withValues(alpha: 0.15)
        : AppColors.primaryAdaptive(context).withValues(alpha: 0.25);
    final unselectedTextColor = AppColors.textAdaptiveSecondary(context);

    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        onTap();
      },
      child: AnimatedContainer(
        duration: AppAnimations.fast,
        curve: AppAnimations.smooth,
        margin: const EdgeInsets.only(right: AppSpacing.sm),
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.xs,
        ),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(30),
          gradient: isSelected ? gradient : null,
          color: isSelected ? null : unselectedBg,

          border: isSelected
              ? null
              : Border.all(color: unselectedBorder, width: 1),

          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: (gradient?.colors.first ?? AppColors.primary)
                        .withValues(alpha: 0.4),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ]
              : [],
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(30),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (iconData != null) ...[
                Icon(
                  iconData,
                  size: 16,
                  color: isSelected ? Colors.black : unselectedTextColor,
                ),
                AppSpacing.horizontalXs,
              ] else if (emoji != null) ...[
                Text(emoji!, style: const TextStyle(fontSize: 16)),
                AppSpacing.horizontalXs,
              ],
              Text(
                label.isNotEmpty
                    ? label
                    : (vibeCode ?? 'Vibe'), // fallback if missing
                style: AppTextStyles.labelMedium(context).copyWith(
                  color: isSelected
                      ? Colors
                            .black // Dark text on bright neon gradient
                      : unselectedTextColor,
                  fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
