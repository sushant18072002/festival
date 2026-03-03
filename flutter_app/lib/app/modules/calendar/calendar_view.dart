import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:table_calendar/table_calendar.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'calendar_controller.dart';
import '../../widgets/neo_scaffold.dart';
import '../../widgets/festival_card.dart';
import '../../theme/app_colors.dart';
import '../../theme/app_text_styles.dart';
import '../../theme/app_spacing.dart';

class CalendarView extends GetView<CalendarController> {
  const CalendarView({super.key});

  @override
  Widget build(BuildContext context) {
    return NeoScaffold(
      // Transparent App Bar for immersion
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: Text('Timeline', style: AppTextStyles.headlineMedium),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
          onPressed: () => Get.back(),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.today_rounded, color: AppColors.accent),
            onPressed: () {
              HapticFeedback.lightImpact();
              final now = DateTime.now();
              controller.focusedDay.value = now;
              controller.selectedDay.value = now;
              controller.updateSelectedEvents(now);
            },
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          // Spacer for AppBar
          SizedBox(height: kToolbarHeight + MediaQuery.of(context).padding.top),

          // Month Mood (Phase 14)
          Obx(
            () => Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.md),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      controller.monthMood,
                      style: AppTextStyles.labelMedium.copyWith(
                        color: AppColors.accent,
                        letterSpacing: 1.2,
                        fontWeight: FontWeight.bold,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
          ).animate().fade().slideX(),

          const SizedBox(height: AppSpacing.sm),

          // 1. Neon Calendar Widget
          _buildNeoCalendar(),

          const Divider(color: AppColors.border, height: 1),

          // 2. Selected Date Header
          _buildDateHeader(),

          // 3. Timeline Event List
          Expanded(
            child: Obx(() {
              if (controller.selectedEvents.isEmpty) {
                return _buildEmptyState();
              }

              return ListView.builder(
                padding: const EdgeInsets.fromLTRB(
                  AppSpacing.md,
                  AppSpacing.md,
                  AppSpacing.md,
                  100,
                ),
                itemCount: controller.selectedEvents.length,
                itemBuilder: (context, index) {
                  final event = controller.selectedEvents[index];
                  return Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Timeline Line & Prep Dots
                      Column(
                        children: [
                          // Dot
                          Container(
                            width: 12,
                            height: 12,
                            decoration: BoxDecoration(
                              color: AppColors.primary,
                              shape: BoxShape.circle,
                              boxShadow: [
                                BoxShadow(
                                  color: AppColors.primary.withValues(
                                    alpha: 0.6,
                                  ),
                                  blurRadius: 8,
                                ),
                              ],
                              border: Border.all(color: Colors.white, width: 2),
                            ),
                          ),
                          // Line
                          Container(
                            width: 2,
                            height: 280, // Approximate height of card + padding
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [
                                  AppColors.primary,
                                  AppColors.primary.withValues(alpha: 0.0),
                                ],
                              ),
                            ),
                          ),
                          // Prep Dots for Upcoming Festivals (Phase 14)
                          if (event.date != null) ...[
                            Builder(
                              builder: (context) {
                                final days = controller.getDaysUntil(
                                  event.date!,
                                );
                                if (days != null && days > 0 && days <= 7) {
                                  return Column(
                                    children: [
                                      const SizedBox(height: 8),
                                      Text(
                                        'PREP',
                                        style: AppTextStyles.labelSmall
                                            .copyWith(
                                              color: AppColors.accent,
                                              fontSize: 9,
                                            ),
                                      ),
                                      const SizedBox(height: 4),
                                      Row(
                                        mainAxisSize: MainAxisSize.min,
                                        children: List.generate(
                                          days,
                                          (idx) => Container(
                                            margin: const EdgeInsets.symmetric(
                                              horizontal: 2,
                                            ),
                                            width: 4,
                                            height: 4,
                                            decoration: BoxDecoration(
                                              color: AppColors.accent
                                                  .withValues(alpha: 0.5),
                                              shape: BoxShape.circle,
                                            ),
                                          ),
                                        ),
                                      ),
                                    ],
                                  ).animate().fade().slideY();
                                }
                                return const SizedBox.shrink();
                              },
                            ),
                          ],
                        ],
                      ),

                      const SizedBox(width: AppSpacing.md),

                      // Event Card
                      Expanded(
                        child: Builder(
                          builder: (context) {
                            int? daysUntil;
                            if (event.date != null) {
                              daysUntil = controller.getDaysUntil(event.date!);
                            }

                            return FestivalCard(
                                  event: event,
                                  isHero: false,
                                  daysUntil: daysUntil,
                                  // Muhurat will be added to EventModel in Phase 17
                                  muhuratTime: null,
                                  onTap: () => Get.toNamed(
                                    '/event-details',
                                    arguments: event,
                                  ),
                                )
                                .animate()
                                .fade(delay: (index * 100).ms)
                                .slideX(begin: 0.1);
                          },
                        ),
                      ),
                    ],
                  );
                },
              );
            }),
          ),
        ],
      ),
    );
  }

  Widget _buildNeoCalendar() {
    return Obx(
      () => Container(
        margin: const EdgeInsets.only(bottom: AppSpacing.sm),
        child: TableCalendar(
          firstDay: DateTime.utc(2024, 1, 1),
          lastDay: DateTime.utc(2030, 12, 31),
          focusedDay: controller.focusedDay.value,
          selectedDayPredicate: (day) =>
              isSameDay(controller.selectedDay.value, day),
          calendarFormat: CalendarFormat.month,
          eventLoader: controller.getEventsForDay,
          startingDayOfWeek: StartingDayOfWeek.monday,

          // Header Style
          headerStyle: HeaderStyle(
            titleCentered: true,
            formatButtonVisible: false,
            titleTextStyle: AppTextStyles.titleLarge.copyWith(
              color: Colors.white,
            ),
            leftChevronIcon: const Icon(
              Icons.chevron_left,
              color: Colors.white70,
            ),
            rightChevronIcon: const Icon(
              Icons.chevron_right,
              color: Colors.white70,
            ),
          ),

          // Days Style
          daysOfWeekStyle: DaysOfWeekStyle(
            weekdayStyle: AppTextStyles.labelSmall.copyWith(
              color: Colors.white38,
            ),
            weekendStyle: AppTextStyles.labelSmall.copyWith(
              color: AppColors.secondary.withValues(alpha: 0.6),
            ),
          ),

          // Calendar Body Style
          calendarStyle: CalendarStyle(
            outsideDaysVisible: false,
            defaultTextStyle: AppTextStyles.bodyMedium.copyWith(
              color: Colors.white,
            ),
            weekendTextStyle: AppTextStyles.bodyMedium.copyWith(
              color: Colors.white70,
            ),

            // Today
            todayDecoration: BoxDecoration(
              color: Colors.transparent,
              shape: BoxShape.circle,
              border: Border.all(color: AppColors.accent, width: 1),
            ),
            todayTextStyle: AppTextStyles.bodyMedium.copyWith(
              color: AppColors.accent,
              fontWeight: FontWeight.bold,
            ),

            // Selected
            selectedDecoration: BoxDecoration(
              color: AppColors.primary,
              shape: BoxShape.circle,
              boxShadow: [
                BoxShadow(
                  color: AppColors.primary.withValues(alpha: 0.5),
                  blurRadius: 10,
                ),
              ],
            ),
            selectedTextStyle: AppTextStyles.bodyMedium.copyWith(
              color: Colors.black,
              fontWeight: FontWeight.bold,
            ),

            // Markers
            markerSize: 6,
            markerDecoration: const BoxDecoration(
              color: AppColors.secondary,
              shape: BoxShape.circle,
            ),
          ),

          calendarBuilders: CalendarBuilders(
            // Phase 14 Heatmap
            defaultBuilder: (context, day, focusedDay) {
              final density = controller.getEventDensity(day);
              if (density == 0) return null; // Use default styling

              // Define heatmap colors (amber -> orange -> red)
              Color bgColor;
              if (density == 1) {
                bgColor = AppColors.secondary.withValues(alpha: 0.15);
              } else if (density == 2) {
                bgColor = Colors.orangeAccent.withValues(alpha: 0.25);
              } else {
                bgColor = Colors.deepOrange.withValues(alpha: 0.4);
              }

              return Container(
                margin: const EdgeInsets.all(6.0),
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: bgColor,
                  shape: BoxShape.circle,
                ),
                child: Text(
                  '${day.day}',
                  style: AppTextStyles.bodyMedium.copyWith(color: Colors.white),
                ),
              );
            },
            // Hide the old marker dots to avoid cluttering the heatmap
            markerBuilder: (context, date, events) {
              return const SizedBox.shrink();
            },
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
    ).animate().fade();
  }

  Widget _buildDateHeader() {
    return Padding(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.md,
      ),
      child: Row(
        children: [
          Container(
            width: 4,
            height: 24,
            decoration: BoxDecoration(
              color: AppColors.accent,
              borderRadius: BorderRadius.circular(2),
              boxShadow: [
                BoxShadow(
                  color: AppColors.accent.withValues(alpha: 0.5),
                  blurRadius: 6,
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          Obx(() {
            final date = controller.selectedDay.value;
            return Text(
              _formatFullDate(date),
              style: AppTextStyles.headlineSmall,
            );
          }),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.nightlight_round, size: 48, color: Colors.white10),
          const SizedBox(height: 16),
          Text(
            "No festivals this day — explore nearby dates!",
            style: AppTextStyles.titleMedium.copyWith(color: Colors.white30),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    ).animate().fade(duration: 600.ms).slideY(begin: 0.1, duration: 600.ms);
  }

  String _formatFullDate(DateTime date) {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    // E.g. "October 14, 2025"
    return '${months[date.month - 1]} ${date.day}, ${date.year}';
  }
}
