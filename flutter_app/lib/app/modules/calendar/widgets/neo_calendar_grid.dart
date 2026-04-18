import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../calendar_controller.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../theme/app_spacing.dart';

class NeoCalendarGrid extends StatelessWidget {
  final CalendarController controller;

  const NeoCalendarGrid({super.key, required this.controller});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final adaptivePrimary = AppColors.primaryAdaptive(context);
    
    return Obx(
      () => Container(
        margin: const EdgeInsets.symmetric(
          horizontal: AppSpacing.md,
          vertical: AppSpacing.xs,
        ),
        decoration: BoxDecoration(
          color: isDark
              ? AppColors.surfaceDark.withValues(alpha: 0.8)
              : Colors.white,
          borderRadius: BorderRadius.circular(24),
          border: Border.all(
            color: isDark
                ? Colors.white.withValues(alpha: 0.06)
                : Colors.black.withValues(alpha: 0.06),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: isDark ? 0.3 : 0.06),
              blurRadius: 20,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: TableCalendar(
          firstDay: DateTime.utc(2024, 1, 1),
          lastDay: DateTime.utc(2030, 12, 31),
          focusedDay: controller.focusedDay.value,
          selectedDayPredicate: (day) =>
              isSameDay(controller.selectedDay.value, day),
          calendarFormat: CalendarFormat.month,
          eventLoader: controller.getEventsForDay,
          startingDayOfWeek: StartingDayOfWeek.sunday,

          headerStyle: HeaderStyle(
            titleCentered: true,
            formatButtonVisible: false,
            titleTextStyle: AppTextStyles.titleMedium(context).copyWith(
              color: isDark ? Colors.white : Colors.black87,
              fontWeight: FontWeight.bold,
            ),
            headerPadding: const EdgeInsets.symmetric(
              horizontal: 8,
              vertical: 8,
            ),
            leftChevronIcon: Icon(
              LucideIcons.chevronLeft,
              color: isDark ? Colors.white54 : Colors.black45,
            ),
            rightChevronIcon: Icon(
              LucideIcons.chevronRight,
              color: isDark ? Colors.white54 : Colors.black45,
            ),
          ),

          daysOfWeekStyle: DaysOfWeekStyle(
            weekdayStyle: AppTextStyles.labelSmall(context).copyWith(
              color: isDark ? Colors.white38 : Colors.black38,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.0,
            ),
            weekendStyle: AppTextStyles.labelSmall(context).copyWith(
              color: AppColors.secondaryAdaptive(
                context,
              ).withValues(alpha: isDark ? 0.7 : 0.6),
              fontWeight: FontWeight.bold,
              letterSpacing: 1.0,
            ),
          ),

          calendarStyle: CalendarStyle(
            outsideDaysVisible: false,
            cellPadding: const EdgeInsets.all(2),
            tablePadding: const EdgeInsets.symmetric(horizontal: 8),

            defaultTextStyle: AppTextStyles.bodyMedium(
              context,
            ).copyWith(color: isDark ? Colors.white70 : Colors.black87),
            weekendTextStyle: AppTextStyles.bodyMedium(context).copyWith(
              color: AppColors.secondaryAdaptive(
                context,
              ).withValues(alpha: isDark ? 0.8 : 0.7),
            ),

            // Today indicator ring
            todayDecoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: adaptivePrimary, width: 2),
            ),
            todayTextStyle: AppTextStyles.bodyMedium(
              context,
            ).copyWith(color: adaptivePrimary, fontWeight: FontWeight.bold),

            // Selected day
            selectedDecoration: BoxDecoration(
              color: adaptivePrimary,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: adaptivePrimary.withValues(alpha: 0.45),
                  blurRadius: 12,
                ),
              ],
            ),
            selectedTextStyle: AppTextStyles.bodyMedium(context).copyWith(
              color: isDark ? Colors.black : Colors.white,
              fontWeight: FontWeight.bold,
            ),

            markerSize: 0, // hidden — we use heatmap builder instead
            markerDecoration: const BoxDecoration(),
          ),

          calendarBuilders: CalendarBuilders(
            // Heatmap: orange glow rings for festival days
            defaultBuilder: (context, day, focusedDay) {
              final density = controller.getEventDensity(day);
              if (density == 0) return null;

              Color bgColor;
              Color borderColor;
              double glowRadius;

              if (density == 1) {
                bgColor = AppColors.accentAdaptive(
                  context,
                ).withValues(alpha: 0.12);
                borderColor = AppColors.accentAdaptive(
                  context,
                ).withValues(alpha: 0.35);
                glowRadius = 6;
              } else if (density == 2) {
                bgColor = AppColors.accentAdaptive(
                  context,
                ).withValues(alpha: 0.28);
                borderColor = AppColors.accentAdaptive(
                  context,
                ).withValues(alpha: 0.55);
                glowRadius = 10;
              } else {
                bgColor = AppColors.accentAdaptive(
                  context,
                ).withValues(alpha: 0.45);
                borderColor = AppColors.accentAdaptive(
                  context,
                ).withValues(alpha: 0.75);
                glowRadius = 14;
              }

              return Container(
                margin: const EdgeInsets.all(4),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: bgColor,
                  shape: BoxShape.circle,
                  border: Border.all(color: borderColor, width: 1.5),
                  boxShadow: isDark
                      ? [
                          BoxShadow(
                            color: AppColors.accentAdaptive(
                              context,
                            ).withValues(alpha: density >= 2 ? 0.5 : 0.3),
                            blurRadius: glowRadius,
                          ),
                        ]
                      : null,
                ),
                child: Text(
                  '${day.day}',
                  style: AppTextStyles.bodyMedium(context).copyWith(
                    color: isDark
                        ? Colors.white
                        : AppColors.accentAdaptive(
                            context,
                          ).withValues(alpha: 0.8),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              );
            },
            // Suppress default markers (we use heatmap)
            markerBuilder: (_, __, ___) => const SizedBox.shrink(),
          ),

          onDaySelected: (selectedDay, focusedDay) {
            HapticFeedback.selectionClick();
            controller.onDaySelected(selectedDay, focusedDay);
          },
          onPageChanged: (focusedDay) {
            controller.focusedDay.value = focusedDay;
          },
        ),
      ),
    ).animate().fade(duration: const Duration(milliseconds: 400));
  }
}
