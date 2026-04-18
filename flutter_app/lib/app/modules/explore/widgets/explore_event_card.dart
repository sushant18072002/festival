import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:get/get.dart';
import 'package:intl/intl.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../data/models/event_model.dart';
import '../../../routes/app_pages.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../theme/app_spacing.dart';
import '../../../theme/taxonomy_icon_resolver.dart';
import '../../../theme/taxonomy_icon_widget.dart';
import '../../../widgets/smart_image.dart';

class ExploreEventCard extends StatelessWidget {
  final EventModel event;
  final String heroTagPrefix;

  const ExploreEventCard({
    super.key,
    required this.event,
    required this.heroTagPrefix,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = AppColors.surfaceGlass(context);
    Color categoryColor = Theme.of(context).colorScheme.primary;
    if (event.category != null && event.category!.color != null) {
      categoryColor = TaxonomyIconResolver.resolveColor(
        event.category!.color,
        fallback: categoryColor,
      );
    }

    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        Get.toNamed(
          Routes.eventDetails,
          arguments: {'event': event, 'heroTagPrefix': heroTagPrefix},
        );
      },
      child: Container(
        height: 220,
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(24),
          color: bgColor,
          boxShadow: AppColors.glassShadow(context),
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(24),
          child: Stack(
            fit: StackFit.expand,
            children: [
              // 1. Background Image
              Hero(
                tag: '${heroTagPrefix}_festival_card_${event.id}',
                child: SmartImage(
                  event.displayImageUrl ?? '',
                  fit: BoxFit.cover,
                  dominantColor: event.dominantColors.isNotEmpty
                      ? _parseColor(event.dominantColors.first)
                      : null,
                ),
              ),

              // 2. Gradient Overlay for Text Readability
              Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.black.withValues(
                        alpha: 0.2,
                      ), // Top protection for chips
                      Colors.transparent,
                      Colors.black.withValues(
                        alpha: 0.8,
                      ), // Bottom text protection
                    ],
                    stops: const [0.0, 0.4, 1.0],
                  ),
                ),
              ),

              // 3. Top Left: Category Badge
              if (event.category != null)
                Positioned(
                  top: AppSpacing.sm,
                  left: AppSpacing.sm,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: categoryColor.withValues(alpha: 0.9),
                      borderRadius: BorderRadius.circular(20),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.2),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (event.category!.icon != null) ...[
                          TaxonomyIconWidget(
                            iconSource: event.category!.icon,
                            size: 14,
                            color: Colors.white,
                          ),
                          const SizedBox(width: 6),
                        ],
                        Text(
                          event.category!.name.toUpperCase(),
                          style: AppTextStyles.labelSmall(context).copyWith(
                            color: Colors.white,
                            letterSpacing: 1.2,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

              // 4. Top Right: Relative Time Badge
              if (_getRelativeTimeText(event.nextDate ?? event.date).isNotEmpty)
                Positioned(
                  top: AppSpacing.sm,
                  right: AppSpacing.sm,
                  child: Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: isDark
                          ? Colors.white.withValues(alpha: 0.15)
                          : Colors.black.withValues(alpha: 0.4),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: Colors.white.withValues(alpha: 0.2),
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withValues(alpha: 0.2),
                          blurRadius: 4,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Text(
                      _getRelativeTimeText(event.nextDate ?? event.date),
                      style: AppTextStyles.labelSmall(context).copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),

              // 5. Bottom: Title and Location/Date
              Positioned(
                bottom: AppSpacing.md,
                left: AppSpacing.md,
                right: AppSpacing.md,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      event.title,
                      style: AppTextStyles.headlineSmall(context).copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w800,
                        shadows: [
                          Shadow(
                            color: Colors.black.withValues(alpha: 0.5),
                            blurRadius: 4,
                          ),
                        ],
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        if (event.nextDate != null) ...[
                          const Icon(
                            LucideIcons.calendar,
                            size: 14,
                            color: Colors.white70,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            DateFormat('MMMM d').format(event.nextDate!),
                            style: AppTextStyles.labelMedium(context).copyWith(
                              color: Colors.white70,
                            ),
                          ),
                          const SizedBox(width: 12),
                        ],
                        const Icon(
                          LucideIcons.mapPin,
                          size: 14,
                          color: Colors.white70,
                        ),
                        const SizedBox(width: 4),
                        Expanded(
                          child: Text(
                            event.location,
                            style: AppTextStyles.labelMedium(context).copyWith(
                              color: Colors.white70,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
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
    );
  }

  String _getRelativeTimeText(DateTime? date) {
    if (date == null) return '';
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final target = DateTime(date.year, date.month, date.day);

    final diff = target.difference(today).inDays;

    if (diff == 0) {
      return 'Today'.tr;
    }
    if (diff == 1) {
      return 'Tomorrow'.tr;
    }
    if (diff > 1 && diff <= 7) {
      return 'This Week'.tr;
    }
    if (diff > 7 && target.month == now.month && target.year == now.year) {
      return 'This Month'.tr;
    }

    if (target.isBefore(today)) {
      if (diff == -1) {
        return 'Yesterday'.tr;
      }
      if (target.month == now.month && target.year == now.year) {
        return 'Earlier this month'.tr;
      }

      int monthDiff = (now.year - target.year) * 12 + now.month - target.month;
      if (monthDiff == 1) {
        return 'Last Month'.tr;
      }
      if (monthDiff > 1) {
        return '$monthDiff Months Ago'.tr;
      }
    } else {
      int monthDiff = (target.year - now.year) * 12 + target.month - now.month;
      if (monthDiff == 1 && diff > 7) {
        return 'Next Month'.tr;
      }
      if (monthDiff > 1) {
        return 'In $monthDiff Months'.tr;
      }
    }
    return '';
  }

  Color? _parseColor(String hex) {
    hex = hex.replaceAll('#', '');
    if (hex.length == 6) {
      hex = 'FF$hex'; // Add 100% opacity
    }
    if (hex.length == 8) {
      return Color(int.parse('0x$hex'));
    }
    return null;
  }
}
