import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import 'glass_container.dart';

class AnimatedBottomNav extends StatelessWidget {
  final int currentIndex;
  final Function(int) onTap;

  const AnimatedBottomNav({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Align(
      alignment: Alignment.bottomCenter,
      child: Padding(
        padding: const EdgeInsets.all(24.0),
        child:
            GlassContainer(
              borderRadius: BorderRadius.circular(32),
              // Theme-aware glass background
              color: isDark ? Colors.black : Colors.white,
              opacity: isDark ? 0.65 : 0.85,
              blur: 20,
              border: Border.all(
                color: isDark
                    ? Colors.white.withValues(alpha: 0.15)
                    : Colors.black.withValues(alpha: 0.10),
                width: 1,
              ),
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _buildNavItem(context, 0, Icons.home_rounded, 'home', isDark),
                  _buildNavItem(
                    context,
                    1,
                    Icons.calendar_month_rounded,
                    'calendar',
                    isDark,
                  ),
                  _buildNavItem(
                    context,
                    2,
                    Icons.grid_view_rounded,
                    'gallery',
                    isDark,
                  ),
                  _buildNavItem(
                    context,
                    3,
                    Icons.settings_rounded,
                    'settings',
                    isDark,
                  ),
                ],
              ),
            ).animate().slideY(
              begin: 1,
              end: 0,
              duration: 600.ms,
              curve: Curves.easeOutBack,
            ),
      ),
    );
  }

  Widget _buildNavItem(
    BuildContext context,
    int index,
    IconData icon,
    String translationKey,
    bool isDark,
  ) {
    final isSelected = currentIndex == index;

    // Unselected icon color: white70 in dark, dark54 in light
    final unselectedColor = isDark ? Colors.white60 : Colors.black54;
    // Selected icon color: gold accent
    final selectedIconColor = AppColors.accent;
    // Selected pill background
    final pillColor = isSelected ? AppColors.primary : Colors.transparent;

    return GestureDetector(
      onTap: () {
        HapticFeedback.lightImpact();
        onTap(index);
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 280),
        curve: Curves.easeOut,
        margin: const EdgeInsets.symmetric(horizontal: 4),
        padding: EdgeInsets.symmetric(
          horizontal: isSelected ? 16 : 12,
          vertical: 12,
        ),
        decoration: BoxDecoration(
          color: pillColor,
          borderRadius: BorderRadius.circular(24),
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.primary.withValues(alpha: 0.35),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ]
              : null,
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: isSelected ? selectedIconColor : unselectedColor,
              size: 22,
            ),
            if (isSelected) ...[
              const SizedBox(width: 6),
              Text(
                translationKey.tr,
                style: AppTextStyles.labelSmall.copyWith(
                  color: selectedIconColor,
                  fontWeight: FontWeight.w600,
                  fontSize: 12,
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
