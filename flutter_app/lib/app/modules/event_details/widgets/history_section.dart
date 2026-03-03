import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../../../data/models/event_model.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../widgets/glass_container.dart';

class HistorySection extends StatelessWidget {
  final List<HistoryFact> facts;

  const HistorySection({super.key, required this.facts});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            const Icon(Icons.history_edu, color: AppColors.accent, size: 20),
            const SizedBox(width: 8),
            Text(
              'Festival Origins',
              style: AppTextStyles.headlineMedium.copyWith(
                color: AppColors.accent,
              ),
            ),
          ],
        ),
        const SizedBox(height: 16),
        ...facts.asMap().entries.map((entry) {
          final isLast = entry.key == facts.length - 1;
          return IntrinsicHeight(
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                // Timeline Line & Dot
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
                            color: AppColors.accent.withValues(alpha: 0.2),
                          ),
                        ),
                      Container(
                        margin: const EdgeInsets.only(top: 8),
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          color: AppColors.accent,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.accent.withValues(alpha: 0.6),
                              blurRadius: 8,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.only(bottom: 24),
                    child:
                        GlassContainer(
                              color: AppColors.surfaceGlass,
                              opacity: 0.4,
                              padding: const EdgeInsets.all(16),
                              borderRadius: BorderRadius.circular(16),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  if (entry.value.year > 0) ...[
                                    Text(
                                      '${entry.value.year}',
                                      style: AppTextStyles.labelSmall.copyWith(
                                        color: AppColors.accent,
                                        fontWeight: FontWeight.bold,
                                        letterSpacing: 1.2,
                                      ),
                                    ),
                                    const SizedBox(height: 6),
                                  ],
                                  Text(
                                    entry.value.fact,
                                    style: AppTextStyles.bodyMedium.copyWith(
                                      color: Colors.white,
                                      height: 1.5,
                                    ),
                                  ),
                                ],
                              ),
                            )
                            .animate(delay: (entry.key * 100).ms)
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
