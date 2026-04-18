import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../data/models/event_model.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';

class EventTldrSummary extends StatelessWidget {
  final EventModel event;

  const EventTldrSummary({super.key, required this.event});

  String _generateTLDR(String text) {
    if (text.isEmpty) return '';
    final sentences = text
        .split(RegExp(r'(?<=[.!?])\s+'))
        .map((s) => s.trim())
        .where((s) => s.isNotEmpty)
        .toList();
    if (sentences.isEmpty) return text;

    // Take up to 2 sentences, max ~180 chars
    final summary = sentences.take(2).join(' ');
    if (summary.length <= 180) return summary;
    return '${summary.substring(0, 180).trimRight()}…';
  }

  @override
  Widget build(BuildContext context) {
    if (event.description.isEmpty) return const SizedBox.shrink();

    return Stack(
      children: [
        Container(
          padding: const EdgeInsets.all(24),
          margin: const EdgeInsets.only(bottom: 24),
          decoration: BoxDecoration(
            color: AppColors.surfaceGlass(context),
            borderRadius: BorderRadius.circular(24),
            border: AppColors.adaptiveBorder(context),
            boxShadow: AppColors.glassShadow(context),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Icon(
                    LucideIcons.lightbulb,
                    color: AppColors.primaryAdaptive(context),
                    size: 18,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    'quick_summary'.tr,
                    style: AppTextStyles.labelMedium(context).copyWith(
                      color: AppColors.primaryAdaptive(context),
                      fontWeight: FontWeight.bold,
                      letterSpacing: 2.0,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Text(
                _generateTLDR(event.description),
                style: AppTextStyles.bodyMedium(context).copyWith(
                  color: AppColors.textAdaptiveSecondary(context),
                  height: 1.6,
                ),
              ),
              if (event.category != null || event.tags.isNotEmpty) ...[
                // Divider — adaptive, visible in light mode
                Padding(
                  padding: const EdgeInsets.only(top: 16, bottom: 16),
                  child: Divider(
                    color: Theme.of(context).brightness == Brightness.dark
                        ? Colors.white10
                        : Colors.black.withValues(alpha: 0.08),
                  ),
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    if (event.tags.isNotEmpty)
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Significance',
                            style: AppTextStyles.labelSmall(context).copyWith(
                              color: AppColors.textAdaptiveSecondary(context)
                                  .withValues(alpha: 0.7),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            event.tags.first.name,
                            style: AppTextStyles.bodyMedium(context).copyWith(
                              color: AppColors.textAdaptive(context),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    if (event.category != null)
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Key Theme',
                            style: AppTextStyles.labelSmall(context).copyWith(
                              color: AppColors.textAdaptiveSecondary(context)
                                  .withValues(alpha: 0.7),
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            event.category!.name,
                            style: AppTextStyles.bodyMedium(context).copyWith(
                              color: AppColors.textAdaptive(context),
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                  ],
                ),
              ],
            ],
          ),
        ),
        // Subtle blur light leak behind TLDR top right
        Positioned(
          right: -20,
          top: -20,
          child: Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: AppColors.primaryAdaptive(context).withValues(alpha: 0.1),
            ),
          ),
        ),
      ],
    ).animate().fade(delay: 200.ms).slideX(begin: -0.1);
  }
}
