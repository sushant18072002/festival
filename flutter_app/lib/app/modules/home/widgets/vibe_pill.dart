import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../theme/app_spacing.dart';
import '../../../theme/app_animations.dart';

/// Neo-Modern Vibe Pill
/// Unselected: Frosted Glass
/// Selected: Neon Gradient with inner glow
class VibePill extends StatelessWidget {
  final String label;
  final String? emoji;
  final String? vibeCode;
  final bool isSelected;
  final VoidCallback onTap;

  const VibePill({
    super.key,
    required this.label,
    this.emoji,
    this.vibeCode,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    // Determine gradient based on vibe code if selected
    final gradient = isSelected && vibeCode != null
        ? AppColors.getVibeGradient(vibeCode!)
        : null;

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
          vertical: AppSpacing.sm, // Slightly taller for touch targets
        ),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(30),
          // Background: Gradient (Selected) or Glass (Unselected)
          gradient: isSelected ? gradient : null,
          color: isSelected ? null : AppColors.surfaceGlass,

          // Border: None (Selected) or White/10% (Unselected)
          border: isSelected
              ? null
              : Border.all(
                  color: Colors.white.withValues(alpha: 0.1),
                  width: 1,
                ),

          // Shadows
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
          child: BackdropFilter(
            // Blur only for unselected glass state
            filter: ImageFilter.blur(
              sigmaX: isSelected ? 0 : 5,
              sigmaY: isSelected ? 0 : 5,
            ),
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                if (emoji != null) ...[
                  Text(emoji!, style: const TextStyle(fontSize: 16)),
                  AppSpacing.horizontalXs,
                ],
                Text(
                  label,
                  style: AppTextStyles.labelMedium.copyWith(
                    color: isSelected
                        ? Colors.black
                        : Colors.white, // Black text on neon
                    fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
