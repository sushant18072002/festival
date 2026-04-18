import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';

import '../../../data/models/event_model.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../routes/app_pages.dart';
import '../../../widgets/smart_image.dart';

class SimilarEventsScroller extends StatelessWidget {
  final List<EventModel> relatedEvents;

  const SimilarEventsScroller({super.key, required this.relatedEvents});

  Color? _parseColor(String hex) {
    try {
      final cleaned = hex.replaceFirst('#', '');
      if (cleaned.length == 6) return Color(int.parse('FF$cleaned', radix: 16));
      if (cleaned.length == 8) return Color(int.parse(cleaned, radix: 16));
      return null;
    } catch (_) {
      return null;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (relatedEvents.isEmpty) return const SizedBox.shrink();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 32),
        Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: AppColors.goldAccent.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                LucideIcons.compass,
                color: AppColors.goldAccent,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Text(
              'You Might Also Like',
              style: AppTextStyles.headlineMedium(context).copyWith(
                color: AppColors.textAdaptive(context),
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        const SizedBox(height: 14),
        SizedBox(
          height: 220,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            itemCount: relatedEvents.length,
            itemBuilder: (context, index) {
              final related = relatedEvents[index];
              return GestureDetector(
                onTap: () {
                  HapticFeedback.lightImpact();
                  Get.toNamed(
                    Routes.eventDetails,
                    arguments: related,
                    preventDuplicates: false,
                  );
                },
                child: Container(
                  width: 160,
                  margin: const EdgeInsets.only(right: 16),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    color: AppColors.surfaceDark,
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      if (related.image != null)
                        SmartImage(
                          related.image!.thumbnail.isNotEmpty
                              ? related.image!.thumbnail
                              : related.image!.url,
                          fit: BoxFit.cover,
                          dominantColor: related.image!.dominantColors.isNotEmpty
                              ? _parseColor(related.image!.dominantColors.first)
                              : null,
                        ),
                      Positioned.fill(
                        child: Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.topCenter,
                              end: Alignment.bottomCenter,
                              colors: [
                                Colors.transparent,
                                Colors.black.withValues(alpha: 0.8),
                              ],
                              stops: const [0.4, 1.0],
                            ),
                          ),
                        ),
                      ),
                      Positioned(
                        bottom: 12,
                        left: 12,
                        right: 12,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (related.category != null)
                              Text(
                                related.category!.name.toUpperCase(),
                                style: AppTextStyles.labelSmall(context).copyWith(
                                  color: AppColors.accent,
                                  fontSize: 10,
                                ),
                              ),
                            const SizedBox(height: 4),
                            Text(
                              related.title,
                              style: AppTextStyles.titleMedium(context).copyWith(
                                color: Colors.white,
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                              ),
                              maxLines: 2,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ).animate(delay: (400 + index * 100).ms).fade().slideY(begin: 0.2),
              );
            },
          ),
        ),
      ],
    );
  }
}
