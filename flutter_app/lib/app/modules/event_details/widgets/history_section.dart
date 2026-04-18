import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../data/models/event_model.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';

/// Legacy Timeline — shows historical facts in a vertical glowing timeline.
/// Adapts to both Light and Dark mode gracefully.
/// Hidden entirely when facts list is empty.
class HistorySection extends StatelessWidget {
  final List<HistoryFact> facts;

  const HistorySection({super.key, required this.facts});

  @override
  Widget build(BuildContext context) {
    if (facts.isEmpty) return const SizedBox.shrink();


    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Section Header
        Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.primaryAdaptive(context).withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(
                LucideIcons.scrollText,
                color: AppColors.primaryAdaptive(context),
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Text(
              'Legacy Timeline',
              style: AppTextStyles.headlineMedium(context).copyWith(
                color: AppColors.textAdaptive(context),
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const SizedBox(height: 24),

        // Timeline Items
        ...facts.asMap().entries.map((entry) {
          final index = entry.key;
          final fact = entry.value;
          final isLast = index == facts.length - 1;

          return IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Timeline Line & Dot
                SizedBox(
                  width: 32,
                  child: Stack(
                    alignment: Alignment.topCenter,
                    children: [
                      if (!isLast)
                        Positioned(
                          top: 22,
                          bottom: -24,
                          child: Container(
                            width: 2,
                            decoration: BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topCenter,
                                end: Alignment.bottomCenter,
                                colors: [
                                  AppColors.primaryAdaptive(context).withValues(alpha: 0.6),
                                  AppColors.primaryAdaptive(context).withValues(alpha: 0.05),
                                ],
                              ),
                            ),
                          ),
                        ),
                      Container(
                        margin: const EdgeInsets.only(top: 8),
                        width: 14,
                        height: 14,
                        decoration: BoxDecoration(
                          color: AppColors.primaryAdaptive(context),
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primaryAdaptive(context).withValues(alpha: 0.4),
                              blurRadius: 16,
                            ),
                          ],
                        ),
                        child: Center(
                          child: Container(
                            width: 6,
                            height: 6,
                            decoration: const BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),

                // Fact Card
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 24, left: 8),
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
                                  if (fact.year > 0) ...[
                                    Container(
                                      padding: const EdgeInsets.symmetric(
                                        horizontal: 10,
                                        vertical: 3,
                                      ),
                                      decoration: BoxDecoration(
                                        color: AppColors.primaryAdaptive(context).withValues(
                                          alpha: 0.1,
                                        ),
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(
                                        '${fact.year}',
                                        style: AppTextStyles.labelSmall(context)
                                            .copyWith(
                                              color: AppColors.primaryAdaptive(context),
                                              fontWeight: FontWeight.bold,
                                              letterSpacing: 1.5,
                                            ),
                                      ),
                                    ),
                                    const SizedBox(height: 10),
                                  ],
                                  Text(
                                    fact.fact,
                                    style: AppTextStyles.bodyMedium(context).copyWith(
                                      color: AppColors.textAdaptiveSecondary(
                                        context,
                                      ),
                                      height: 1.6,
                                    ),
                                  ),
                                ],
                              ),
                            )
                            .animate(delay: (index * 100).ms)
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
