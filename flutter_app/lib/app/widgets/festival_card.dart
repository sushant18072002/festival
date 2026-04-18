import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../data/models/event_model.dart';
import '../theme/app_colors.dart';
import '../theme/app_text_styles.dart';
import '../theme/app_spacing.dart';
import '../theme/app_animations.dart';
import 'smart_image.dart';
import 'animated_countdown_chip.dart';

/// Neo-Modern Festival Card
/// Floating glass style with neon glows and vivid imagery.
class FestivalCard extends StatefulWidget {
  final EventModel event;
  final VoidCallback? onTap;
  final bool isHero;
  final int? daysUntil;
  final String? muhuratTime;
  final String heroTagPrefix;

  const FestivalCard({
    super.key,
    required this.event,
    this.onTap,
    this.isHero = false,
    this.daysUntil,
    this.muhuratTime,
    required this.heroTagPrefix,
  });

  @override
  State<FestivalCard> createState() => _FestivalCardState();
}

class _FestivalCardState extends State<FestivalCard> {
  double _scale = 1.0;

  @override
  Widget build(BuildContext context) {
    // Card dimensions based on hero vs regular
    final double height = widget.isHero ? 320 : 260;
    final double width = widget.isHero
        ? MediaQuery.of(context).size.width * 0.85
        : 220; // Slightly wider for better text fit

    return GestureDetector(
      onTapDown: (_) => setState(() => _scale = 0.96),
      onTapUp: (_) => setState(() => _scale = 1.0),
      onTapCancel: () => setState(() => _scale = 1.0),
      onTap: () {
        HapticFeedback.lightImpact();
        widget.onTap?.call();
      },
      child: AnimatedScale(
        scale: _scale,
        duration: AppAnimations.fast,
        curve: AppAnimations.smooth,
        child: Container(
          height: height,
          width: width,
          margin: const EdgeInsets.only(
            right: AppSpacing.md,
            bottom: AppSpacing.md,
          ),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(24),
            boxShadow: AppColors.glassShadow(context),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(24),
            child: Stack(
              fit: StackFit.expand,
              children: [
                // 1. Background Image
                _buildImage(context),

                // 2. Gradient Overlay (Bottom Up)
                Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.transparent,
                        Colors.black.withValues(alpha: 0.2),
                        Colors.black.withValues(alpha: 0.9),
                      ],
                      stops: const [0.3, 0.6, 1.0],
                    ),
                  ),
                ),

                // 3. Inner Border (Glass Effect)
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(24),
                    border: AppColors.adaptiveBorder(context),
                  ),
                ),

                // 4. Content Content
                Padding(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      // Title
                      Text(
                        widget.event.title,
                        style: AppTextStyles.headlineMedium(context).copyWith(
                          color: Colors.white,
                          height: 1.1,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ).animate().fade().slideY(begin: 0.2),

                      const SizedBox(height: 4),

                      // Date Row
                      if (widget.event.date != null)
                        Row(
                          children: [
                            Icon(
                              LucideIcons.calendar,
                              size: 12,
                              color: AppColors.accentAdaptive(context),
                            ),
                            const SizedBox(width: 4),
                            Text(
                              _formatDate(widget.event.date!),
                              style: AppTextStyles.labelSmall(context).copyWith(
                                color: AppColors.accentAdaptive(context),
                              ),
                            ),
                            if (widget.muhuratTime != null) ...[
                              const SizedBox(width: 8),
                              Icon(
                                LucideIcons.clock,
                                size: 12,
                                color: Colors.orangeAccent,
                              ),
                              const SizedBox(width: 4),
                              Expanded(
                                child: Text(
                                  widget.muhuratTime!,
                                  style: AppTextStyles.labelSmall(context).copyWith(
                                    color: Colors.orangeAccent,
                                  ),
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ),
                            ],
                          ],
                        ).animate().fade(delay: 100.ms),

                      const SizedBox(height: 12),

                      // Actions Row
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          // Location (Truncated)
                          Expanded(
                            child: Row(
                              children: [
                                Icon(
                                  LucideIcons.mapPin,
                                  size: 12,
                                  color: Colors.white70,
                                ),
                                const SizedBox(width: 4),
                                Expanded(
                                  child: Text(
                                    widget.event.location,
                                    style: AppTextStyles.bodySmall(context).copyWith(
                                      color: Colors.white70,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),

                          // Share Button
                          GestureDetector(
                            onTap: () {
                              HapticFeedback.mediumImpact();
                              // Share logic
                            },
                            child: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: Colors.white.withValues(alpha: 0.1),
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: Colors.white.withValues(alpha: 0.2),
                                ),
                              ),
                              child: const Icon(
                                LucideIcons.share2,
                                size: 14,
                                color: Colors.white,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),

                // 5. Category Badge (Top Left)
                // 5. Badges Row (Top Left)
                Positioned(
                  top: 12,
                  left: 12,
                  child: Row(
                    children: [
                      if (widget.event.category != null)
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.black.withValues(alpha: 0.4),
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: Colors.white.withValues(alpha: 0.1),
                            ),
                          ),
                          child: BackdropFilter(
                            filter: ImageFilter.blur(sigmaX: 4, sigmaY: 4),
                            child: Text(
                              widget.event.category!.name.toUpperCase(),
                              style: AppTextStyles.labelSmall(context).copyWith(
                                color: Colors.white,
                                fontSize: 10,
                              ),
                            ),
                          ),
                        ),

                      if (widget.daysUntil != null &&
                          widget.daysUntil! >= 0 &&
                          widget.event.date != null) ...[
                        const SizedBox(width: 6),
                        AnimatedCountdownChip(
                          targetDate: widget.event.date!,
                          isLarge: false,
                        ),
                      ],
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildImage(BuildContext context) {
    final imageUrl = widget.event.displayThumbnailUrl;

    if (imageUrl != null) {
      return Hero(
        tag: '${widget.heroTagPrefix}_festival_card_${widget.event.id}',
        child: SmartImage(imageUrl, fit: BoxFit.cover),
      );
    }
    return Container(
      color: AppColors.surfaceGlass(context),
      child: Center(
        child: Icon(
          LucideIcons.landmark,
          size: 48,
          color: AppColors.glassBorder(context),
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    return '${date.day} ${months[date.month - 1]}';
  }
}
