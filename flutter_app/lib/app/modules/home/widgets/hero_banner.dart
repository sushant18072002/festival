import 'package:flutter/material.dart';
import 'dart:ui';
import 'package:flutter/services.dart';
import 'package:flutter_animate/flutter_animate.dart';
import 'package:get/get.dart';
import '../../../data/models/event_model.dart';
import '../../../theme/app_colors.dart';
import '../../../theme/app_text_styles.dart';
import '../../../theme/app_spacing.dart';
import '../../../routes/app_pages.dart';
import '../../../widgets/smart_image.dart';
import '../../../widgets/animated_countdown_chip.dart';

/// Neo-Modern "Crystal Portal" Hero Banner
/// A glass-morphic card with neon inner glows and cinematic typography.
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
          height: 240, // Taller for cinematic feel
          margin: const EdgeInsets.symmetric(
            horizontal: AppSpacing.md,
            vertical: AppSpacing.sm,
          ),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(32), // More rounded
            boxShadow: [
              // Neon Bloom
              BoxShadow(
                color: AppColors.primary.withValues(alpha: 0.15),
                blurRadius: 20,
                offset: const Offset(0, 10),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(32),
            child: Stack(
              fit: StackFit.expand,
              children: [
                // 1. Background Image
                _buildBackground(),

                // 2. Cinematic Gradient Overlay (Bottom Up)
                _buildGradientOverlay(),

                // 3. Glass Border (Inner)
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(32),
                    border: Border.all(
                      color: Colors.white.withValues(alpha: 0.1),
                      width: 1.5,
                    ),
                  ),
                ),

                // 4. Content Content
                Padding(
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Top Row: Tag & Date
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildGlassTag('FEATURED'),
                          if (event.date != null)
                            _buildGlassTag(
                              _formatDate(event.date!),
                              isDate: true,
                            ),
                        ],
                      ),

                      const Spacer(),

                      // Countdown Label (Neon)
                      if (event.date != null)
                        AnimatedCountdownChip(
                          targetDate: event.date!,
                          isLarge: true,
                        ).animate().fade().slideY(begin: 0.2),

                      const SizedBox(height: 4),

                      // Massive Title (DM Serif)
                      Text(
                        event.title,
                        style: AppTextStyles.displayMedium.copyWith(
                          color: Colors.white,
                          height: 1.1,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ).animate().fade(delay: 100.ms).slideY(begin: 0.2),

                      const SizedBox(height: 8),

                      // Location/Subtitle
                      Row(
                        children: [
                          const Icon(
                            Icons.location_on_outlined,
                            color: Colors.white70,
                            size: 16,
                          ),
                          const SizedBox(width: 4),
                          Expanded(
                            child: Text(
                              event.location,
                              style: AppTextStyles.bodyMedium.copyWith(
                                color: Colors.white70,
                              ),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                          // Action Arrow
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Colors.white,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.arrow_forward,
                              size: 16,
                              color: Colors.black,
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
          memCacheWidth: 800,
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
            Colors.black.withValues(alpha: 0.3),
            Colors.black.withValues(alpha: 0.8),
          ],
          stops: const [0.0, 0.5, 1.0],
        ),
      ),
    );
  }

  Widget _buildGlassTag(String text, {bool isDate = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: isDate
            ? AppColors.secondary.withValues(alpha: 0.2)
            : Colors.black.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withValues(alpha: 0.1)),
      ),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
        child: Text(
          text,
          style: AppTextStyles.labelSmall.copyWith(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }

  String _formatDate(DateTime date) {
    const months = [
      'JAN',
      'FEB',
      'MAR',
      'APR',
      'MAY',
      'JUN',
      'JUL',
      'AUG',
      'SEP',
      'OCT',
      'NOV',
      'DEC',
    ];
    return '${date.day} ${months[date.month - 1]}';
  }
}
