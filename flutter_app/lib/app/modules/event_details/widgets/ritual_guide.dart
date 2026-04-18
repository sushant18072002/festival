import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../data/models/event_model.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';

/// Ritual Guide — step-by-step how-to celebrate guide.
/// Adapts to both Light and Dark mode.
/// Hidden entirely when ritualSteps list is empty.
class RitualGuide extends StatelessWidget {
  final List<RitualStep> steps;

  const RitualGuide({super.key, required this.steps});

  @override
  Widget build(BuildContext context) {
    if (steps.isEmpty) return const SizedBox.shrink();
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final sorted = [...steps]..sort((a, b) => a.order.compareTo(b.order));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header
        Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.primaryAdaptive(context).withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                LucideIcons.bookOpenText,
                color: AppColors.primaryAdaptive(context),
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Text(
              'Ritual Guide',
              style: AppTextStyles.headlineMedium(context).copyWith(
                color: AppColors.textAdaptive(context),
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),

        const SizedBox(height: 24),

        // Steps
        ...sorted.asMap().entries.map((entry) {
          final index = entry.key;
          final step = entry.value;
          final isLast = index == sorted.length - 1;

          return IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Vertical Line & Step Number
                SizedBox(
                  width: 40,
                  child: Column(
                    children: [
                      // Step Number Badge
                      Container(
                        width: 32,
                        height: 32,
                        decoration: BoxDecoration(
                          color: AppColors.primaryAdaptive(context),
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primaryAdaptive(context).withValues(alpha: 0.5),
                              blurRadius: 12,
                              spreadRadius: 1,
                            ),
                          ],
                        ),
                        child: Center(
                          child: Text(
                            '${index + 1}',
                            style: TextStyle(
                              color: isDark ? Colors.black : Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      ),
                      if (!isLast)
                        Expanded(
                          child: Container(
                            width: 2,
                            margin: const EdgeInsets.symmetric(vertical: 4),
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [
                                  AppColors.primaryAdaptive(context).withValues(alpha: 0.5),
                                  AppColors.primaryAdaptive(context).withValues(alpha: 0.05),
                                ],
                              ),
                            ),
                          ),
                        ),
                    ],
                  ),
                ),

                // Step Card
                Expanded(
                  child: Padding(
                    padding: EdgeInsets.only(bottom: isLast ? 0 : 20, left: 12),
                    child:
                        Container(
                              padding: const EdgeInsets.all(20),
                              decoration: BoxDecoration(
                                color: AppColors.surfaceGlass(context),
                                borderRadius: BorderRadius.circular(16),
                                border: AppColors.adaptiveBorder(context),
                                boxShadow: AppColors.glassShadow(context),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Expanded(
                                        child: Text(
                                          step.title,
                                          style: AppTextStyles.titleMedium(context)
                                              .copyWith(
                                                color: AppColors.textAdaptive(
                                                  context,
                                                ),
                                                fontWeight: FontWeight.bold,
                                              ),
                                        ),
                                      ),
                                      if (step.timing.isNotEmpty)
                                        Container(
                                          padding: const EdgeInsets.symmetric(
                                            horizontal: 8,
                                            vertical: 3,
                                          ),
                                            decoration: BoxDecoration(
                                              color: AppColors.accentAdaptive(context)
                                                  .withValues(alpha: 0.1),
                                              border: Border.all(
                                                color: AppColors.accentAdaptive(context)
                                                    .withValues(alpha: 0.3),
                                              ),
                                              borderRadius: BorderRadius.circular(
                                                8,
                                              ),
                                            ),
                                            child: Text(
                                              step.timing,
                                              style: AppTextStyles.labelSmall(context)
                                                  .copyWith(
                                                    color: AppColors.accentAdaptive(context),
                                                    fontSize: 10,
                                                  ),
                                          ),
                                        ),
                                    ],
                                  ),
                                  if (step.description.isNotEmpty) ...[
                                    const SizedBox(height: 8),
                                    Text(
                                      step.description,
                                      style: AppTextStyles.bodyMedium(context).copyWith(
                                        color: AppColors.textAdaptiveSecondary(
                                          context,
                                        ),
                                        height: 1.6,
                                      ),
                                    ),
                                  ],
                                  if (step.itemsNeeded.isNotEmpty) ...[
                                    const SizedBox(height: 12),
                                    Wrap(
                                      spacing: 8,
                                      runSpacing: 6,
                                      children: step.itemsNeeded
                                          .map(
                                            (item) => Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                    horizontal: 10,
                                                    vertical: 4,
                                                  ),
                                              decoration: BoxDecoration(
                                                color: AppColors.primaryAdaptive(context)
                                                    .withValues(alpha: 0.08),
                                                borderRadius:
                                                    BorderRadius.circular(12),
                                                border: Border.all(
                                                  color: AppColors.primaryAdaptive(context)
                                                      .withValues(alpha: 0.25),
                                                ),
                                              ),
                                              child: Text(
                                                item,
                                                style: AppTextStyles.labelSmall(context)
                                                    .copyWith(
                                                      color: AppColors.primaryAdaptive(context),
                                                      fontWeight:
                                                          FontWeight.w500,
                                                    ),
                                              ),
                                            ),
                                          )
                                          .toList(),
                                    ),
                                  ],
                                ],
                              ),
                            )
                            .animate(delay: (200 + index * 100).ms)
                            .fade()
                            .slideX(begin: 0.1),
                  ),
                ),
              ],
            ),
          );
        }),
      ],
    );
  }
}
