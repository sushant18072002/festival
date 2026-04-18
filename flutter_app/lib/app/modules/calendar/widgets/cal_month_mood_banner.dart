import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../theme/app_spacing.dart';
import '../../../widgets/glass_container.dart';
import '../calendar_controller.dart';

/// Shows the current month's mood / energy as a glassmorphism banner.
class CalMonthMoodBanner extends StatelessWidget {
  final CalendarController controller;
  const CalMonthMoodBanner({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final adaptiveSecondary = AppColors.secondaryAdaptive(context);
    
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      child: GlassContainer(
        borderRadius: BorderRadius.circular(20),
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: 12,
        ),
        color: adaptiveSecondary.withValues(alpha: isDark ? 0.08 : 0.06),
        border: Border.all(
          color: adaptiveSecondary.withValues(alpha: isDark ? 0.25 : 0.2),
        ),
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'month_mood'.tr,
                    style: AppTextStyles.labelSmall(context).copyWith(
                      color: isDark ? Colors.white38 : Colors.black38,
                      letterSpacing: 1.6,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Icon(
                        LucideIcons.smile,
                        color: adaptiveSecondary,
                        size: 18,
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Obx(
                          () => Text(
                            controller.monthMood,
                            style: AppTextStyles.titleSmall(context).copyWith(
                              color: adaptiveSecondary,
                              fontWeight: FontWeight.bold,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: adaptiveSecondary.withValues(alpha: 0.15),
                border: Border.all(
                  color: adaptiveSecondary.withValues(alpha: 0.3),
                ),
              ),
              child: Icon(
                LucideIcons.sparkles,
                color: adaptiveSecondary,
                size: 20,
              ),
            ),
          ],
        ),
      ),
    ).animate().fade(duration: 500.ms).slideY(begin: -0.1);
  }
}
