import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../calendar_controller.dart';
import '../../../routes/app_pages.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../theme/app_spacing.dart';

class CalendarStickyHeader extends StatelessWidget {
  final CalendarController controller;
  final double topPad;
  final bool isDark;

  const CalendarStickyHeader({
    super.key,
    required this.controller,
    required this.topPad,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final adaptivePrimary = AppColors.primaryAdaptive(context);
    return Container(
      padding: EdgeInsets.fromLTRB(
        AppSpacing.md,
        topPad + 8,
        AppSpacing.md,
        10,
      ),
      decoration: BoxDecoration(
        color: isDark
            ? AppColors.backgroundDark.withValues(alpha: 0.95)
            : AppColors.backgroundLight.withValues(alpha: 0.97),
        border: Border(
          bottom: BorderSide(
            color: isDark
                ? Colors.white.withValues(alpha: 0.05)
                : Colors.black.withValues(alpha: 0.05),
          ),
        ),
      ),
      child: Row(
        children: [
          // Back button
          GestureDetector(
            onTap: () => Get.back(),
            child: Container(
              width: 38,
              height: 38,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isDark
                    ? Colors.white.withValues(alpha: 0.06)
                    : Colors.black.withValues(alpha: 0.05),
              ),
              child: Icon(
                LucideIcons.arrowLeft,
                color: isDark ? Colors.white : Colors.black87,
                size: 20,
              ),
            ),
          ),

          const SizedBox(width: 12),

          Text(
            'cal_title'.tr,
            style: AppTextStyles.headlineMedium(context).copyWith(
              color: isDark ? Colors.white : Colors.black87,
              fontWeight: FontWeight.bold,
            ),
          ),

          const Spacer(),

          // Search button
          Material(
            color: Colors.transparent,
            child: InkWell(
              onTap: () {
                HapticFeedback.lightImpact();
                Get.toNamed(Routes.search);
              },
              borderRadius: BorderRadius.circular(20),
              splashColor: adaptivePrimary.withValues(alpha: 0.1),
              highlightColor: adaptivePrimary.withValues(alpha: 0.05),
              child: Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: isDark
                      ? Colors.white.withValues(alpha: 0.06)
                      : Colors.black.withValues(alpha: 0.05),
                ),
                child: Icon(
                  LucideIcons.search,
                  color: isDark ? Colors.white70 : Colors.black54,
                  size: 20,
                ),
              ),
            ),
          ),

          const SizedBox(width: 4),

          // Today button
          GestureDetector(
            onTap: () {
              HapticFeedback.lightImpact();
              final now = DateTime.now();
              controller.focusedDay.value = now;
              controller.selectedDay.value = now;
              controller.updateSelectedEvents(now);
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
              decoration: BoxDecoration(
                color: adaptivePrimary.withValues(alpha: isDark ? 0.2 : 0.12),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: adaptivePrimary.withValues(alpha: isDark ? 0.4 : 0.3),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(LucideIcons.calendar, color: adaptivePrimary, size: 14),
                  const SizedBox(width: 5),
                  Text(
                    'cal_today'.tr.toUpperCase(),
                    style: AppTextStyles.labelSmall(context).copyWith(
                      color: adaptivePrimary,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 0.8,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
