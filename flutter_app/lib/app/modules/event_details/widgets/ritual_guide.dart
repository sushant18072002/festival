import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../data/models/event_model.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../widgets/glass_container.dart';

class RitualGuide extends StatelessWidget {
  final List<RitualStep> steps;

  const RitualGuide({super.key, required this.steps});

  @override
  Widget build(BuildContext context) {
    final sorted = [...steps]..sort((a, b) => a.order.compareTo(b.order));

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(
              Icons.menu_book_rounded,
              color: AppColors.primary,
              size: 20,
            ),
            const SizedBox(width: 8),
            Text(
              'How to Celebrate',
              style: AppTextStyles.headlineMedium.copyWith(color: Colors.white),
            ),
          ],
        ),
        const SizedBox(height: 16),
        ...sorted.asMap().entries.map((entry) {
          final isLast = entry.key == sorted.length - 1;
          final step = entry.value;
          return IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                SizedBox(
                  width: 30,
                  child: Stack(
                    alignment: Alignment.topCenter,
                    children: [
                      if (!isLast)
                        Positioned(
                          top: 18,
                          bottom: -24,
                          child: Container(
                            width: 2,
                            color: AppColors.primary.withValues(alpha: 0.3),
                          ),
                        ),
                      Container(
                        margin: const EdgeInsets.only(top: 8),
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          color: AppColors.primary,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withValues(alpha: 0.4),
                              blurRadius: 6,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 20),
                    child:
                        GlassContainer(
                              color: AppColors.surfaceGlass,
                              opacity: 0.3,
                              padding: const EdgeInsets.all(14),
                              borderRadius: BorderRadius.circular(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment:
                                        MainAxisAlignment.spaceBetween,
                                    children: [
                                      Text(
                                        step.title,
                                        style: AppTextStyles.titleMedium
                                            .copyWith(
                                              color: Colors.white,
                                              fontWeight: FontWeight.bold,
                                            ),
                                      ),
                                      if (step.timing.isNotEmpty)
                                        Text(
                                          step.timing,
                                          style: AppTextStyles.labelSmall
                                              .copyWith(color: Colors.white54),
                                        ),
                                    ],
                                  ),
                                  if (step.description.isNotEmpty) ...[
                                    const SizedBox(height: 6),
                                    Text(
                                      step.description,
                                      style: AppTextStyles.bodyMedium.copyWith(
                                        color: Colors.white70,
                                        height: 1.4,
                                      ),
                                    ),
                                  ],
                                  if (step.itemsNeeded.isNotEmpty) ...[
                                    const SizedBox(height: 8),
                                    Wrap(
                                      spacing: 6,
                                      runSpacing: 4,
                                      children: step.itemsNeeded
                                          .map(
                                            (item) => Container(
                                              padding:
                                                  const EdgeInsets.symmetric(
                                                    horizontal: 8,
                                                    vertical: 3,
                                                  ),
                                              decoration: BoxDecoration(
                                                color: AppColors.primary
                                                    .withValues(alpha: 0.15),
                                                borderRadius:
                                                    BorderRadius.circular(12),
                                                border: Border.all(
                                                  color: AppColors.primary
                                                      .withValues(alpha: 0.3),
                                                ),
                                              ),
                                              child: Text(
                                                item,
                                                style: AppTextStyles.labelSmall
                                                    .copyWith(
                                                      color: AppColors.primary,
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
                            .animate(delay: (200 + entry.key * 100).ms)
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
