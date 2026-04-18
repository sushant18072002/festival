import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../data/models/event_model.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';

class EventMuhuratCard extends StatelessWidget {
  final EventModel event;

  const EventMuhuratCard({super.key, required this.event});

  @override
  Widget build(BuildContext context) {
    if (event.muhurat == null || event.muhurat!.pujaTime.isEmpty) {
      return const SizedBox.shrink();
    }

    return Container(
      padding: const EdgeInsets.all(24),
      margin: const EdgeInsets.only(bottom: 32),
      decoration: BoxDecoration(
        color: AppColors.surface(context),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: AppColors.goldAccent.withValues(alpha: 0.4),
        ),
      ),
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Positioned(
            right: -10,
            top: -10,
            child: Icon(
              LucideIcons.sparkles,
              color: AppColors.goldAccent.withValues(alpha: 0.05),
              size: 100,
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    children: [
                      const Icon(
                        LucideIcons.star,
                        color: AppColors.goldAccent,
                        size: 18,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        (event.muhurat!.title.isNotEmpty)
                            ? event.muhurat!.title.toUpperCase()
                            : 'AUSPICIOUS TIME',
                        style: AppTextStyles.labelSmall(context).copyWith(
                          color: AppColors.goldAccent,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 2.0,
                        ),
                      ),
                    ],
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 8,
                      vertical: 2,
                    ),
                    decoration: BoxDecoration(
                      color: AppColors.goldAccent.withValues(alpha: 0.1),
                      border: Border.all(
                        color: AppColors.goldAccent.withValues(alpha: 0.2),
                      ),
                      borderRadius: BorderRadius.circular(4),
                    ),
                    child: Text(
                      'Auspicious',
                      style: AppTextStyles.labelSmall(context).copyWith(
                        color: AppColors.goldAccent,
                        fontSize: 10,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                event.muhurat!.pujaTime,
                style: AppTextStyles.displayMedium(context).copyWith(
                  color: AppColors.textAdaptive(context),
                  fontWeight: FontWeight.bold,
                ),
              ),
              if (event.muhurat!.description.isNotEmpty) ...[
                Padding(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  child: Divider(
                    color: Theme.of(context).brightness == Brightness.dark
                        ? Colors.white10
                        : Colors.black.withValues(alpha: 0.08),
                  ),
                ),
                Text(
                  event.muhurat!.description,
                  style: AppTextStyles.bodySmall(context).copyWith(
                    color: AppColors.textAdaptiveSecondary(context),
                    height: 1.5,
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    ).animate().fade(delay: 300.ms).slideY(begin: 0.1);
  }
}
