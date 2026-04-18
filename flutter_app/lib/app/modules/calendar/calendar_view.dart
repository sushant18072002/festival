import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import 'calendar_controller.dart';
import 'widgets/cal_month_mood_banner.dart';
import 'widgets/cal_timeline_event_card.dart';
import 'widgets/calendar_sticky_header.dart';
import 'widgets/neo_calendar_grid.dart';

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
          CalendarStickyHeader(
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
                  SliverToBoxAdapter(
                    child: NeoCalendarGrid(controller: controller),
                  ),

                  // ── Events Section ─────────────────────────────────────────
                  if (controller.isLoading.value) ...[
                    SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.all(AppSpacing.xl),
                        child: Center(
                          child: CircularProgressIndicator(
                            color: AppColors.primaryAdaptive(context),
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
                          child: _buildEmptyState(context, isDark),
                        ),
                      )
                    else ...[
                      _buildSectionHeader(
                        context,
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
                      context,
                      'cal_selected_events'.tr,
                      selectedEvents.length,
                      isDark,
                    ),

                    if (selectedEvents.isEmpty)
                      SliverToBoxAdapter(
                        child: Padding(
                          padding: const EdgeInsets.symmetric(vertical: 30),
                          child: _buildEmptyState(
                            context,
                            isDark,
                            title: 'cal_no_events'.tr,
                            subtitle: 'cal_explore_nearby'.tr,
                            icon: LucideIcons.calendarOff,
                          ),
                        ),
                      )
                    else
                      _buildEventsList(selectedEvents, controller),

                    // Append Upcoming Section
                    if (blockUpcoming.isNotEmpty) ...[
                      const SliverToBoxAdapter(child: SizedBox(height: 15)),
                      _buildSectionHeader(
                        context,
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

  Widget _buildEmptyState(
    BuildContext context,
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
            icon ?? LucideIcons.moon,
            size: 52,
            color: isDark ? Colors.white10 : Colors.black12,
          ),
          const SizedBox(height: 16),
          Text(
            title ?? 'cal_no_events'.tr,
            style: AppTextStyles.titleMedium(
              context,
            ).copyWith(color: isDark ? Colors.white30 : Colors.black38),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 8),
          Text(
            subtitle ?? 'cal_explore_nearby'.tr,
            style: AppTextStyles.bodySmall(context).copyWith(
              color: isDark
                  ? Colors.white.withValues(alpha: 0.2)
                  : Colors.black26,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    ).animate().fade(duration: const Duration(milliseconds: 600)).slideY(begin: 0.08);
  }

  SliverToBoxAdapter _buildSectionHeader(
    BuildContext context,
    String title,
    int count,
    bool isDark,
  ) {
    final adaptivePrimary = AppColors.primaryAdaptive(context);
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
              style: AppTextStyles.headlineSmall(context).copyWith(
                color: isDark ? Colors.white : Colors.black87,
                fontWeight: FontWeight.bold,
              ),
            ),
            const Spacer(),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(
                color: adaptivePrimary.withValues(alpha: 0.15),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '$count',
                style: AppTextStyles.labelMedium(
                  context,
                ).copyWith(color: adaptivePrimary, fontWeight: FontWeight.bold),
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
