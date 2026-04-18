import 'package:flutter/material.dart';
import 'dart:ui';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import 'package:lucide_icons_flutter/lucide_icons.dart';
import '../../../data/models/event_model.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../theme/app_spacing.dart';
import '../../../routes/app_pages.dart';
import '../../../widgets/smart_image.dart';

/// Neo-Modern Hero Banner — matches the design spec with
/// FEATURED pill, countdown pill, "Upcoming Festival" label,
/// large serif title and an "Explore" CTA button.
class HeroBanner extends StatelessWidget {
  final EventModel event;
  final String heroTagPrefix;

  const HeroBanner({
    super.key,
    required this.event,
    required this.heroTagPrefix,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Featured Event: ${event.title}',
      hint: 'Tap to view festival details',
      button: true,
      child: GestureDetector(
        onTap: () {
          HapticFeedback.mediumImpact();
          Get.toNamed(
            Routes.eventDetails,
            arguments: {'event': event, 'heroTagPrefix': heroTagPrefix},
          );
        },
        child: Container(
          // 4:3 ratio for the banner
          height: MediaQuery.of(context).size.width * (3 / 4) - 32,
          constraints: const BoxConstraints(minHeight: 220, maxHeight: 320),
          margin: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: AppSpacing.sm,
          ),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(28),
            boxShadow: AppColors.glassShadow(context),
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(28),
            child: Stack(
              fit: StackFit.expand,
              children: [
                // 1. Background image
                _buildBackground(context),

                // 2. Gradient scrim
                _buildGradientOverlay(),

                // 3. Inner glass border
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(28),
                    border: Border.all(
                      color: AppColors.glassBorder(context),
                      width: 1.5,
                    ),
                  ),
                ),

                // 4. Content
                Padding(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Top row — "FEATURED" pill + countdown pill
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildPill(
                            context,
                            label: 'featured'.tr,
                            color: AppColors.secondaryAdaptive(context),
                          ),
                          const Spacer(),
                          if (event.date != null)
                            _buildCountdownPill(context, event.date!),
                        ],
                      ),

                      const Spacer(),

                      // "Upcoming Festival" category label
                      Text(
                        'upcoming_festival'.tr,
                        style: AppTextStyles.labelMedium(context).copyWith(
                          color: AppColors.primaryAdaptive(context),
                          letterSpacing: 1.2,
                        ),
                      ).animate().fade(delay: 50.ms),

                      const SizedBox(height: 4),

                      // Main title (DM Serif Display)
                      Text(
                        event.title,
                        style: AppTextStyles.displayMedium(context).copyWith(
                          color: Colors.white,
                          height: 1.1,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ).animate().fade(delay: 100.ms).slideY(begin: 0.2),

                      const SizedBox(height: 12),

                      // Bottom row — location + Explore button
                      Row(
                        children: [
                          if (event.location.isNotEmpty) ...[
                            const Icon(
                              LucideIcons.mapPin,
                              color: Colors.white60,
                              size: 13,
                            ),
                            const SizedBox(width: 4),
                            Expanded(
                              child: Text(
                                event.location,
                                style: AppTextStyles.bodySmall(context).copyWith(
                                  color: Colors.white60,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                            ),
                          ] else
                            const Spacer(),
                          // Explore CTA button
                          GestureDetector(
                            onTap: () {
                              HapticFeedback.mediumImpact();
                              Get.toNamed(
                                Routes.eventDetails,
                                arguments: {
                                  'event': event,
                                  'heroTagPrefix': heroTagPrefix,
                                },
                              );
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 8,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.primaryAdaptive(context).withValues(
                                  alpha: 0.2,
                                ),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                  color: AppColors.primaryAdaptive(context).withValues(
                                    alpha: 0.5,
                                  ),
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    'explore'.tr,
                                    style: AppTextStyles.labelMedium(context).copyWith(
                                      color: AppColors.primaryAdaptive(context),
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  Icon(
                                    LucideIcons.arrowRight,
                                    color: AppColors.primaryAdaptive(context),
                                    size: 14,
                                  ),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ).animate().fade(delay: 200.ms),
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

  Widget _buildBackground(BuildContext context) {
    final imageUrl = event.displayImageUrl;
    if (imageUrl != null) {
      return Hero(
        tag: '${heroTagPrefix}_festival_card_${event.id}',
        child: SmartImage(
          imageUrl,
          fit: BoxFit.cover,
          width: double.infinity,
          height: double.infinity,
          memCacheWidth: 900,
          dominantColor: event.dominantColors.isNotEmpty
              ? _parseColor(event.dominantColors.first)
              : null,
        ),
      );
    }
    return Container(
      color: AppColors.surfaceGlass(context),
      child: const Center(
        child: Icon(LucideIcons.landmark, size: 60, color: Colors.white10),
      ),
    );
  }

  Widget _buildGradientOverlay() {
    return Container(
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            Colors.transparent,
            Colors.black.withValues(alpha: 0.25),
            Colors.black.withValues(alpha: 0.78),
          ],
          stops: const [0.0, 0.45, 1.0],
        ),
      ),
    );
  }

  /// "FEATURED" pill on the top-left
  Widget _buildPill(BuildContext context, {required String label, required Color color}) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 6, sigmaY: 6),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.2),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: color.withValues(alpha: 0.4)),
          ),
          child: Text(
            label,
            style: AppTextStyles.labelSmall(context).copyWith(
              color: Colors.white,
              fontWeight: FontWeight.bold,
              letterSpacing: 0.8,
            ),
          ),
        ),
      ),
    );
  }

  /// Top-right countdown pill with a timer icon
  Widget _buildCountdownPill(BuildContext context, DateTime date) {
    final daysLeft = date.difference(DateTime.now()).inDays;
    if (daysLeft < 0) return const SizedBox.shrink();

    final color = daysLeft <= 7
        ? AppColors.errorAdaptive(context)
        : daysLeft <= 30
        ? AppColors.accentAdaptive(context)
        : AppColors.primaryAdaptive(context);

    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 6, sigmaY: 6),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.15),
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: color.withValues(alpha: 0.5)),
            boxShadow: [
              BoxShadow(color: color.withValues(alpha: 0.3), blurRadius: 8),
            ],
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              Icon(LucideIcons.timer, size: 12, color: color),
              const SizedBox(width: 4),
              Text(
                daysLeft == 0 ? 'today'.tr : '$daysLeft ${'days_left'.tr}',
                style: AppTextStyles.labelSmall(context).copyWith(
                  color: color,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ),
      ),
    );
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
