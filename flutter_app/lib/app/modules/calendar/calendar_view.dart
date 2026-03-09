import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'calendar_controller.dart';
import 'widgets/cal_month_mood_banner.dart';

import 'widgets/cal_timeline_event_card.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';
import '../../theme/app_spacing.dart';
import '../../data/models/event_model.dart';

class CalendarView extends GetView<CalendarController> {
  const CalendarView({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final topPad = MediaQuery.of(context).padding.top;

    return Scaffold(
      backgroundColor: isDark
          ? AppColors.backgroundDark
          : AppColors.backgroundLight,
      body: Column(
        children: [
          // ── Sticky Header ──────────────────────────────────────────
          _CalendarHeader(
            controller: controller,
            topPad: topPad,
            isDark: isDark,
          ),

          Expanded(
            child: Obx(() {
              final showingSelected = controller.selectedDay.value != null;
              final selectedEvents = controller.selectedEvents;

              final blockUpcoming = showingSelected
                  ? controller.filteredUpcomingEvents.where((e) {
                      if (selectedEvents.contains(e)) return false;
                      if (e.date == null) return false;
                      return e.date!.isAfter(
                        controller.selectedDay.value!.subtract(
                          const Duration(seconds: 1),
                        ),
                      );
                    }).toList()
                  : <EventModel>[];

              return CustomScrollView(
                physics: const BouncingScrollPhysics(),
                slivers: [
                  // ── Month Mood Banner ──────────────────────────────────────
                  SliverToBoxAdapter(
                    child: CalMonthMoodBanner(controller: controller),
                  ),

                  // ── Calendar Grid ──────────────────────────────────────────
                  SliverToBoxAdapter(child: _buildNeoCalendar(isDark)),

                  // ── Events Section ─────────────────────────────────────────
                  if (controller.isLoading.value) ...[
                    const SliverToBoxAdapter(
                      child: Padding(
                        padding: EdgeInsets.all(AppSpacing.xl),
                        child: Center(
                          child: CircularProgressIndicator(
                            color: AppColors.primary,
                            strokeWidth: 2,
                          ),
                        ),
                      ),
                    ),
                  ] else if (!showingSelected) ...[
                    // Default Month View
                    if (controller.filteredUpcomingEvents.isEmpty)
                      SliverToBoxAdapter(
                        child: Padding(
                          padding: const EdgeInsets.only(top: 40),
                          child: _buildEmptyState(isDark),
                        ),
                      )
                    else ...[
                      _buildSectionHeader(
                        'cal_upcoming_section'.tr,
                        controller.filteredUpcomingEvents.length,
                        isDark,
                      ),
                      _buildEventsList(
                        controller.filteredUpcomingEvents,
                        controller,
                        addBottomPadding: true,
                      ),
                    ],
                  ] else ...[
                    // Showing a Selected Day
                    _buildSectionHeader(
                      'cal_selected_events'.tr,
                      selectedEvents.length,
                      isDark,
                    ),

                    if (selectedEvents.isEmpty)
                      SliverToBoxAdapter(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 30),
                          child: _buildEmptyState(
                            isDark,
                            title: 'No Events Scheduled',
                            subtitle:
                                'There are no festivals on this specific date.',
                            icon: Icons.event_busy_rounded,
                          ),
                        ),
                      )
                    else
                      _buildEventsList(selectedEvents, controller),

                    // Append Upcoming Section
                    if (blockUpcoming.isNotEmpty) ...[
                      SliverToBoxAdapter(child: const SizedBox(height: 15)),
                      _buildSectionHeader(
                        'cal_upcoming_section'.tr,
                        blockUpcoming.length,
                        isDark,
                      ),
                      _buildEventsList(
                        blockUpcoming,
                        controller,
                        addBottomPadding: true,
                      ),
                    ] else ...[
                      // Just pad the bottom of the active selected list
                      const SliverToBoxAdapter(child: SizedBox(height: 100)),
                    ],
                  ],
                ],
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildNeoCalendar(bool isDark) {
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
            titleTextStyle: AppTextStyles.titleMedium.copyWith(
              color: isDark ? Colors.white : Colors.black87,
              fontWeight: FontWeight.bold,
            ),
            headerPadding: const EdgeInsets.symmetric(
              horizontal: 8,
              vertical: 8,
            ),
            leftChevronIcon: Icon(
              Icons.chevron_left_rounded,
              color: isDark ? Colors.white54 : Colors.black45,
            ),
            rightChevronIcon: Icon(
              Icons.chevron_right_rounded,
              color: isDark ? Colors.white54 : Colors.black45,
            ),
          ),

          daysOfWeekStyle: DaysOfWeekStyle(
            weekdayStyle: AppTextStyles.labelSmall.copyWith(
              color: isDark ? Colors.white38 : Colors.black38,
              fontWeight: FontWeight.bold,
              letterSpacing: 1.0,
            ),
            weekendStyle: AppTextStyles.labelSmall.copyWith(
              color: AppColors.secondary.withValues(alpha: isDark ? 0.7 : 0.6),
              fontWeight: FontWeight.bold,
              letterSpacing: 1.0,
            ),
          ),

          calendarStyle: CalendarStyle(
            outsideDaysVisible: false,
            cellPadding: const EdgeInsets.all(2),
            tablePadding: const EdgeInsets.symmetric(horizontal: 8),

            defaultTextStyle: AppTextStyles.bodyMedium.copyWith(
              color: isDark ? Colors.white70 : Colors.black87,
            ),
            weekendTextStyle: AppTextStyles.bodyMedium.copyWith(
              color: isDark
                  ? Colors.white60
                  : Colors.black.withValues(alpha: 0.7),
            ),

            // Today indicator ring
            todayDecoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(
                color: AppColors.primary,
                width: isDark ? 2 : 2,
              ),
              color: AppColors.primary.withValues(alpha: isDark ? 0.0 : 0.0),
            ),
            todayTextStyle: AppTextStyles.bodyMedium.copyWith(
              color: AppColors.primary,
              fontWeight: FontWeight.bold,
            ),

            // Selected day
            selectedDecoration: BoxDecoration(
              color: AppColors.primary,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.45),
                  blurRadius: 12,
                ),
              ],
            ),
            selectedTextStyle: AppTextStyles.bodyMedium.copyWith(
              color: Colors.black,
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
                bgColor = const Color(0xFFF97316).withValues(alpha: 0.12);
                borderColor = const Color(0xFFF97316).withValues(alpha: 0.35);
                glowRadius = 6;
              } else if (density == 2) {
                bgColor = const Color(0xFFF97316).withValues(alpha: 0.28);
                borderColor = const Color(0xFFF97316).withValues(alpha: 0.55);
                glowRadius = 10;
              } else {
                bgColor = const Color(0xFFF97316).withValues(alpha: 0.45);
                borderColor = const Color(0xFFF97316).withValues(alpha: 0.75);
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
                            color: const Color(
                              0xFFF97316,
                            ).withValues(alpha: density >= 2 ? 0.5 : 0.3),
                            blurRadius: glowRadius,
                          ),
                        ]
                      : null,
                ),
                child: Text(
                  '${day.day}',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: isDark ? Colors.white : const Color(0xFF92400E),
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
    ).animate().fade(duration: 400.ms);
  }

  Widget _buildEmptyState(
    bool isDark, {
    String? title,
    String? subtitle,
    IconData? icon,
  }) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            icon ?? Icons.nightlight_round,
            size: 52,
            color: isDark ? Colors.white10 : Colors.black12,
          ),
          const SizedBox(height: 16),
          Text(
            title ?? 'cal_no_events'.tr,
            style: AppTextStyles.titleMedium.copyWith(
              color: isDark ? Colors.white30 : Colors.black38,
            ),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            subtitle ?? 'cal_explore_nearby'.tr,
            style: AppTextStyles.bodySmall.copyWith(
              color: isDark
                  ? Colors.white.withValues(alpha: 0.2)
                  : Colors.black26,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    ).animate().fade(duration: 600.ms).slideY(begin: 0.08);
  }

  SliverToBoxAdapter _buildSectionHeader(String title, int count, bool isDark) {
    return SliverToBoxAdapter(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(
          AppSpacing.md,
          AppSpacing.md,
          AppSpacing.md,
          4,
        ),
        child: Row(
          children: [
            Text(
              title,
              style: AppTextStyles.headlineSmall.copyWith(
                color: isDark ? Colors.white : Colors.black87,
                fontWeight: FontWeight.bold,
              ),
            ),
            const Spacer(),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: AppColors.primary.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '$count',
                style: AppTextStyles.labelMedium.copyWith(
                  color: AppColors.primary,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  SliverPadding _buildEventsList(
    List<EventModel> events,
    CalendarController controller, {
    bool addBottomPadding = false,
  }) {
    return SliverPadding(
      padding: EdgeInsets.fromLTRB(
        AppSpacing.md,
        AppSpacing.sm,
        AppSpacing.md,
        addBottomPadding ? 100 : 0,
      ),
      sliver: SliverList(
        delegate: SliverChildBuilderDelegate((context, index) {
          final event = events[index];
          final isToday =
              event.date != null && isSameDay(event.date!, DateTime.now());
          return CalTimelineEventCard(
            event: event,
            controller: controller,
            isToday: isToday,
            index: index,
          );
        }, childCount: events.length),
      ),
    );
  }
}

// ─── Sticky Header Sub-widget ──────────────────────────────────────────────

class _CalendarHeader extends StatelessWidget {
  final CalendarController controller;
  final double topPad;
  final bool isDark;

  const _CalendarHeader({
    required this.controller,
    required this.topPad,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
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
                Icons.arrow_back_rounded,
                color: isDark ? Colors.white : Colors.black87,
                size: 20,
              ),
            ),
          ),

          const SizedBox(width: 12),

          Text(
            'cal_title'.tr,
            style: AppTextStyles.headlineMedium.copyWith(
              color: isDark ? Colors.white : Colors.black87,
              fontWeight: FontWeight.bold,
            ),
          ),

          const Spacer(),

          // Search button
          GestureDetector(
            onTap: () => HapticFeedback.lightImpact(),
            child: Container(
              width: 38,
              height: 38,
              margin: const EdgeInsets.only(right: 8),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isDark
                    ? Colors.white.withValues(alpha: 0.06)
                    : Colors.black.withValues(alpha: 0.05),
              ),
              child: Icon(
                Icons.search_rounded,
                color: isDark ? Colors.white70 : Colors.black54,
                size: 20,
              ),
            ),
          ),

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
                color: AppColors.primary.withValues(alpha: isDark ? 0.2 : 0.12),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(
                  color: AppColors.primary.withValues(
                    alpha: isDark ? 0.4 : 0.3,
                  ),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.calendar_today_rounded,
                    color: AppColors.primary,
                    size: 14,
                  ),
                  const SizedBox(width: 5),
                  Text(
                    'cal_today'.tr.toUpperCase(),
                    style: AppTextStyles.labelSmall.copyWith(
                      color: AppColors.primary,
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
