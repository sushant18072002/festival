import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

import '../../../data/models/event_model.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';

class EventTagsList extends StatelessWidget {
  final EventModel event;

  const EventTagsList({super.key, required this.event});

  @override
  Widget build(BuildContext context) {
    if (event.tags.isEmpty) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.only(bottom: 24),
      child: Wrap(
        spacing: 8,
        runSpacing: 8,
        children: event.tags.map((tag) {
          return Container(
            padding: const EdgeInsets.symmetric(
              horizontal: 12,
              vertical: 6,
            ),
            decoration: BoxDecoration(
              color: AppColors.primaryAdaptive(context).withValues(alpha: 0.05),
              border: Border.all(
                color: AppColors.primaryAdaptive(context).withValues(alpha: 0.2),
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Text(
              '#${tag.name.toLowerCase().replaceAll(' ', '')}',
              style: AppTextStyles.labelSmall(context).copyWith(
                color: AppColors.primaryAdaptive(context),
                fontWeight: FontWeight.w500,
              ),
            ),
          );
        }).toList(),
      ).animate().fade(delay: 200.ms),
    );
  }
}
