import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
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
              // Leverages new adaptive defaults for shadow/border/glow
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 8),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  _buildNavItem(context, 0, LucideIcons.house, 'home', isDark),
                  _buildNavItem(
                    context,
                    1,
                    LucideIcons.calendar,
                    'calendar',
                    isDark,
                  ),
                  _buildNavItem(
                    context,
                    2,
                    LucideIcons.layoutGrid,
                    'gallery',
                    isDark,
                  ),
                  _buildNavItem(
                    context,
                    3,
                    LucideIcons.settings,
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
    final unselectedColor = AppColors.textAdaptiveSecondary(context);
    // Selected icon color: adaptive deep primary in light mode, primary in dark mode
    final selectedIconColor = AppColors.primaryAdaptive(context);
    // Selected pill background: strongly translucent version of adaptive primary
    final pillColor = isSelected ? AppColors.primaryAdaptive(context).withValues(alpha: 0.15) : Colors.transparent;

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
                    color: AppColors.primaryAdaptive(context).withValues(alpha: isDark ? 0.35 : 0.12),
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
                style: AppTextStyles.labelSmall(context).copyWith(
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
