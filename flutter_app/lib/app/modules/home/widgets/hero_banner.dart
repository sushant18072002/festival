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

  const HeroBanner({super.key, required this.event});

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Featured Event: ${event.title}',
      hint: 'Tap to view festival details',
      button: true,
      child: GestureDetector(
        onTap: () {
          HapticFeedback.mediumImpact();
          Get.toNamed(Routes.EVENT_DETAILS, arguments: event);
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
            boxShadow: [
              BoxShadow(
                color: AppColors.primary.withValues(alpha: 0.12),
                blurRadius: 24,
                offset: const Offset(0, 12),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(28),
            child: Stack(
              fit: StackFit.expand,
              children: [
                // 1. Background image
                _buildBackground(),

                // 2. Gradient scrim
                _buildGradientOverlay(),

                // 3. Inner glass border
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(28),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.1),
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
                            label: 'featured'.tr,
                            color: AppColors.secondary,
                          ),
                          const Spacer(),
                          if (event.date != null)
                            _buildCountdownPill(event.date!),
                        ],
                      ),

                      const Spacer(),

                      // "Upcoming Festival" category label
                      Text(
                        'upcoming_festival'.tr,
                        style: AppTextStyles.labelMedium.copyWith(
                          color: AppColors.primary,
                          letterSpacing: 1.2,
                        ),
                      ).animate().fade(delay: 50.ms),

                      const SizedBox(height: 4),

                      // Main title (DM Serif Display)
                      Text(
                        event.title,
                        style: AppTextStyles.displayMedium.copyWith(
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
                                style: AppTextStyles.bodySmall.copyWith(
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
                                Routes.EVENT_DETAILS,
                                arguments: event,
                              );
                            },
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 8,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withValues(
                                  alpha: 0.15,
                                ),
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(
                                  color: AppColors.primary.withValues(
                                    alpha: 0.5,
                                  ),
                                ),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Text(
                                    'explore'.tr,
                                    style: AppTextStyles.labelMedium.copyWith(
                                      color: AppColors.primary,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  const SizedBox(width: 6),
                                  const Icon(
                                    LucideIcons.arrowRight,
                                    color: AppColors.primary,
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

  Widget _buildBackground() {
    final imageUrl = event.thumbnail ?? event.image?.url;
    if (imageUrl != null) {
      return Hero(
        tag: 'hero_banner_${event.id}',
        child: SmartImage(
          imageUrl,
          fit: BoxFit.cover,
          width: double.infinity,
          height: double.infinity,
          memCacheWidth: 900,
        ),
      );
    }
    return Container(
      color: AppColors.surfaceGlass,
      child: const Center(
        child: Icon(Icons.temple_hindu, size: 60, color: Colors.white10),
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
  Widget _buildPill({required String label, required Color color}) {
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
            style: AppTextStyles.labelSmall.copyWith(
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
  Widget _buildCountdownPill(DateTime date) {
    final daysLeft = date.difference(DateTime.now()).inDays;
    if (daysLeft < 0) return const SizedBox.shrink();

    final color = daysLeft <= 7
        ? AppColors.error
        : daysLeft <= 30
        ? AppColors.accent
        : AppColors.primary;

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
                style: AppTextStyles.labelSmall.copyWith(
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
}
