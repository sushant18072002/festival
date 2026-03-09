import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../theme/app_spacing.dart';
import '../../../data/models/event_model.dart';
import '../../../widgets/smart_image.dart';
import '../calendar_controller.dart';

Color _resolveAccentColor(EventModel event, bool isDark) {
  if (event.category != null && event.category!.color != null) {
    var hexCode = event.category!.color!;
    if (hexCode.startsWith('#')) {
      hexCode = hexCode.substring(1);
    }
    if (hexCode.length == 6) {
      hexCode = 'FF$hexCode';
    }
    final intVal = int.tryParse(hexCode, radix: 16);
    if (intVal != null) {
      return Color(intVal);
    }
  }
  return isDark
      ? const Color(0xFFE2E8F0) // slate-200
      : const Color(0xFF64748B); // slate-500
}

class CalTimelineEventCard extends StatelessWidget {
  final EventModel event;
  final CalendarController controller;
  final bool isToday;
  final int index;

  const CalTimelineEventCard({
    super.key,
    required this.event,
    required this.controller,
    this.isToday = false,
    this.index = 0,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final accentColor = _resolveAccentColor(event, isDark);
    final daysLabel = event.date != null
        ? controller.getDaysUntilLabel(event.date!)
        : null;
    final dateLabel = event.date != null
        ? controller.getDayLabel(event.date!)
        : '';

    final imageUrl = event.image?.url ?? event.thumbnail;
    final hasImage = imageUrl != null && imageUrl.isNotEmpty;

    return Padding(
          padding: const EdgeInsets.only(bottom: AppSpacing.lg),
          child: GestureDetector(
            onTap: () {
              HapticFeedback.lightImpact();
              Get.toNamed('/event-details', arguments: event);
            },
            child: Container(
              height: 180,
              width: double.infinity,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(20),
                color: isDark
                    ? accentColor.withValues(alpha: 0.08)
                    : accentColor.withValues(alpha: 0.06),
                border: Border.all(
                  color: accentColor.withValues(alpha: 0.15),
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: isDark ? 0.4 : 0.1),
                    blurRadius: 18,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(19),
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    // 1. Background Image (if available)
                    if (hasImage) SmartImage(imageUrl, fit: BoxFit.cover),

                    // 2. Gradient Overlay for readability
                    Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: hasImage
                              ? [
                                  Colors.black.withValues(alpha: 0.3),
                                  Colors.black.withValues(alpha: 0.85),
                                ]
                              : [
                                  Colors.transparent,
                                  isDark
                                      ? Colors.black.withValues(alpha: 0.4)
                                      : Colors.white.withValues(alpha: 0.5),
                                ],
                        ),
                      ),
                    ),

                    // 3. Content
                    Padding(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          // Top Row: Date & Countdown
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Expanded(
                                child: Text(
                                  dateLabel.toUpperCase(),
                                  style: AppTextStyles.labelSmall.copyWith(
                                    color: hasImage
                                        ? Colors.white
                                        : accentColor,
                                    fontWeight: FontWeight.bold,
                                    letterSpacing: 0.8,
                                  ),
                                ),
                              ),
                              if (daysLabel != null)
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 10,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color:
                                        (hasImage ? Colors.white : accentColor)
                                            .withValues(alpha: 0.2),
                                    border: Border.all(
                                      color:
                                          (hasImage
                                                  ? Colors.white
                                                  : accentColor)
                                              .withValues(alpha: 0.35),
                                    ),
                                    borderRadius: BorderRadius.circular(12),
                                    boxShadow: [
                                      if (hasImage)
                                        const BoxShadow(
                                          color: Colors.black26,
                                          blurRadius: 8,
                                        ),
                                    ],
                                  ),
                                  child: Text(
                                    daysLabel,
                                    style: AppTextStyles.labelSmall.copyWith(
                                      color: hasImage
                                          ? Colors.white
                                          : accentColor,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                            ],
                          ),

                          // Bottom Content: Title & Tags
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              // Title
                              Text(
                                event.title,
                                style: AppTextStyles.titleMedium.copyWith(
                                  color: hasImage
                                      ? Colors.white
                                      : (isDark
                                            ? Colors.white
                                            : Colors.black87),
                                  fontWeight: FontWeight.bold,
                                  fontSize: 20,
                                  shadows: hasImage
                                      ? [
                                          const Shadow(
                                            color: Colors.black54,
                                            blurRadius: 6,
                                          ),
                                        ]
                                      : null,
                                ),
                                maxLines: 2,
                                overflow: TextOverflow.ellipsis,
                              ),

                              // Location (if present)
                              if (event.location.isNotEmpty &&
                                  event.location.toLowerCase() !=
                                      'festival grounds') ...[
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    Icon(
                                      Icons.location_on_rounded,
                                      size: 14,
                                      color: hasImage
                                          ? Colors.white70
                                          : (isDark
                                                ? Colors.white60
                                                : Colors.black54),
                                    ),
                                    const SizedBox(width: 4),
                                    Expanded(
                                      child: Text(
                                        event.location,
                                        style: AppTextStyles.labelSmall
                                            .copyWith(
                                              color: hasImage
                                                  ? Colors.white70
                                                  : (isDark
                                                        ? Colors.white60
                                                        : Colors.black54),
                                            ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ),
                                  ],
                                ),
                              ],

                              const SizedBox(height: 8),

                              // Bottom Row: Tags & Share Button
                              Row(
                                crossAxisAlignment: CrossAxisAlignment.end,
                                children: [
                                  Expanded(
                                    child: Wrap(
                                      spacing: 6,
                                      runSpacing: 6,
                                      children: [
                                        if (event.category != null)
                                          _buildTag(
                                            event.category!.name,
                                            accentColor,
                                            isDark,
                                            hasImage: hasImage,
                                          ),
                                        for (final tag in event.tags.take(2))
                                          _buildTag(
                                            tag.name,
                                            accentColor,
                                            isDark,
                                            dim: true,
                                            hasImage: hasImage,
                                          ),
                                        if (event.gallery.length > 1)
                                          _buildGalleryTag(
                                            event.gallery.length,
                                            isDark,
                                          ),
                                      ],
                                    ),
                                  ),
                                  // Share Button
                                  Material(
                                    color: Colors.transparent,
                                    child: InkWell(
                                      onTap: () {
                                        HapticFeedback.selectionClick();
                                        controller.shareEvent(event);
                                      },
                                      borderRadius: BorderRadius.circular(12),
                                      child: Container(
                                        padding: const EdgeInsets.all(8),
                                        decoration: BoxDecoration(
                                          color:
                                              (hasImage
                                                      ? Colors.white
                                                      : accentColor)
                                                  .withValues(alpha: 0.15),
                                          borderRadius: BorderRadius.circular(
                                            12,
                                          ),
                                          border: Border.all(
                                            color:
                                                (hasImage
                                                        ? Colors.white
                                                        : accentColor)
                                                    .withValues(alpha: 0.3),
                                          ),
                                        ),
                                        child: Icon(
                                          Icons.share_rounded,
                                          color: hasImage
                                              ? Colors.white
                                              : accentColor,
                                          size: 18,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        )
        .animate()
        .fade(delay: (index * 60).ms, duration: 400.ms)
        .slideY(begin: 0.05, delay: (index * 60).ms);
  }

  Widget _buildTag(
    String label,
    Color color,
    bool isDark, {
    bool dim = false,
    bool hasImage = false,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: hasImage
            ? Colors.black.withValues(alpha: dim ? 0.3 : 0.5)
            : color.withValues(alpha: dim ? 0.08 : 0.15),
        borderRadius: BorderRadius.circular(8),
        border: hasImage ? Border.all(color: Colors.white24, width: 0.5) : null,
      ),
      child: Text(
        label.toUpperCase(),
        style: AppTextStyles.labelSmall.copyWith(
          color: hasImage
              ? (dim ? Colors.white70 : Colors.white)
              : (dim ? (isDark ? Colors.white54 : Colors.black54) : color),
          fontSize: 9,
          fontWeight: FontWeight.bold,
          letterSpacing: 0.5,
        ),
      ),
    );
  }

  Widget _buildGalleryTag(int count, bool isDark) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.white24, width: 0.5),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Icon(
            Icons.photo_library_rounded,
            color: Colors.white,
            size: 10,
          ),
          const SizedBox(width: 4),
          Text(
            '+$count',
            style: AppTextStyles.labelSmall.copyWith(
              color: Colors.white,
              fontSize: 9,
              fontWeight: FontWeight.bold,
            ),
          ),
        ],
      ),
    );
  }
}
